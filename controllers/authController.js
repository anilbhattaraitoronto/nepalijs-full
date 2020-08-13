const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);

const { emailsecret, emailConfig, authsecret } = require("../config");
const { sendActivationEmail, sendPasswordResetLink } = require(
  "../middlewares/sendmails",
);
const DB = require("../schema");

//signup
exports.signup = (req, res) => {
  const { full_name, email, username, password } = req.body;

  sendActivationEmail(
    emailConfig,
    full_name,
    email,
    username,
    password,
    emailsecret,
  );
  return res.status(200).json(
    {
      message:
        "Thank you for signing up. We have sent you an email to activate your account.",
    },
  );
};

//activate
exports.activateUser = (req, res) => {
  let { token } = req.params;
  if (!token) {
    return res.status(403).json(
      { message: "Token is required but is not provided" },
    );
  } else {
    jwt.verify(token, emailsecret, (err, decoded) => {
      if (err) {
        return res.status(403).json(
          { message: "Token is expired of invalid." },
        );
      } else {
        let { full_name, email, username, password } = decoded;
        let hashedPassword = bcrypt.hashSync(password, salt);
        let insertUserStmt = DB.prepare(
          `INSERT INTO users (full_name, email, username, password) VALUES(?,?,?,?);`,
        );
        insertUserStmt.run(full_name, email, username, hashedPassword)
          .lastInsertRowid;
        return res.status(200).json(
          { message: "Your account is activated. Please proceed to log in." },
        );
      }
    });
  }
};

//login
exports.login = (req, res) => {
  const { username, password } = req.body;
  if (username && password) {
    //check if user with that username exists
    let getUserStmt = DB.prepare(`SELECT * FROM users WHERE username =?;`);
    let user = getUserStmt.get(username);
    if (user) {
      //check if passwords match
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          return res.status(500).json({ message: err });
        } else if (result === true) {
          //generate token
          let token = jwt.sign(
            { id: user.id },
            authsecret,
            { expiresIn: 10800 },
          );
          return res.status(200).json({
            username: user.username,
            email: user.email,
            full_name: user.full_name,
            authToken: token,
          });
        } else {
          return res.status(403).json({ message: "Invalid credential" });
        }
      });
    } else {
      return res.status(400).json({ message: "User does not exist." });
    }
  } else {
    return res.status(400).json(
      { message: "Both username and password is required." },
    );
  }
};

exports.changePassword = (req, res) => {
  //get token from headers
  let token = req.headers["x-access-token"];
  if (token) {
    //verify token
    jwt.verify(token, authsecret, (err, decoded) => {
      if (err) {
        return res.status(403).json(
          { message: "Token is either expired or invalid." },
        );
      } else {
        const userId = decoded.id;
        const { password, confirmPassword } = req.body;
        if (password === confirmPassword) {
          //created hashed password
          const hashedPassword = bcrypt.hashSync(password, saltRounds);
          const updateUserStmt = DB.prepare(
            `UPDATE users SET password = ? WHERE id=?`,
          );
          updateUserStmt.run(hashedPassword, userId);
          return res.status(200).json({ message: "Password is updated" });
        } else {
          return res.status(400).json({ message: "Passwords do not match." });
        }
      }
    });
  } else {
    return res.status(403).json(
      { message: "Token is required but not provided" },
    );
  }
};

exports.passwordResetRequest = (req, res) => {
  let { email } = req.body;
  if (email) {
    let getUserStmt = DB.prepare(`SELECT email FROM users WHERE email=?;`);
    let user = getUserStmt.get(email);
    if (!user) {
      return res.status(404).json(
        { message: "User with that email does not exist." },
      );
    } else {
      sendPasswordResetLink(emailConfig, email, emailsecret);
      return res.status(200).json(
        { message: "We have sent you an email with a password reset link." },
      );
    }
  } else {
    return res.status(403).json(
      { message: "A valid user email is required to reset password." },
    );
  }
};

exports.getPasswordResetForm = (req, res) => {
  const { token } = req.params;
  if (token) {
    //verify token
    jwt.verify(token, emailsecret, (err, decoded) => {
      if (err) {
        return res.status(403).json(
          { message: "The token is invalid or expired." },
        );
      } else {
        const userEmail = decoded.email;
        //get user with that email
        const getUserStmt = DB.prepare(
          `SELECT username FROM users WHERE email=?;`,
        );
        const user = getUserStmt.get(userEmail);
        if (user) {
          //send the form
          const submitUrl = `http://localhost:4003/api/auth/resetpassword`;
          const resetPasswordForm = `
            <style>
            form{
                width:100%;
                max-width:450px;
                margin: 40px auto;
                line-height:1.7;
                background: lightgray;
                padding: 20px;
            }
            h3{
                text-align: center;
                font-size: 1.3em;
                padding: 20px 0;
            }
            input, label{
                display: block;
                width:95%;
                margin: 4px auto;
                padding: 4px;
            }
            input[type="submit"]{
                font-size: 1.1em;
                cursor:pointer;
            }
            </style>
                  <form action=${submitUrl} method="POST">
                  <h3>Reset Password </h3>
                      <label for="password">Type new password</label>
                      <input type="password" name="password" required >
                      <label for="confirmPassword">Re-type new password</label>
                      <input type="password" name="confirmPassword" required >
                      <input type="hidden" name="token" value=${token}>
                      <input type="submit" value="Reset Password" />
                  </form>`;
          return res.status(200).send(resetPasswordForm);
        } else {
          return res.status(400).json({ message: "User does not exist." });
        }
      }
    });
  } else {
    return res.status(400).json({ message: "Token is not provided" });
  }
};

exports.resetPassword = (req, res) => {
  let { password, confirmPassword, token } = req.body;
  if (token) {
    //verify token
    jwt.verify(token, emailsecret, (err, decoded) => {
      if (err) {
        return res.status(400).json({ message: "Token is invalid or expired" });
      } else {
        let userEmail = decoded.email;
        if (password === confirmPassword) {
          //get user
          let getUserStmt = DB.prepare(`SELECT * FROM users WHERE email = ?;`);
          let user = getUserStmt.get(userEmail);
          if (user) {
            let hashedPassword = bcrypt.hashSync(password, salt);
            let updateUserStmt = DB.prepare(
              `UPDATE users SET password = ? WHERE email =?; `,
            );
            updateUserStmt.run(hashedPassword, userEmail);
            return res.status(200).json(
              {
                message:
                  "Password is reset. Please log in with new password now.",
              },
            );
          } else {
            return res.status(404).json(
              { message: "User with that email does not exist." },
            );
          }
        } else {
          return res.status(400).json(
            { message: "The passwords need to match" },
          );
        }
      }
    });
  } else {
    return res.status(403).json(
      { message: "Token is required but not provided" },
    );
  }
};

exports.deleteUser = (req, res) => {
  let token = req.headers["x-access-token"];
  if (token) {
    jwt.verify(token, authsecret, (err, decoded) => {
      if (err) {
        return res.status(403).json(
          { message: "The token is invalid or expired." },
        );
      } else {
        let userId = decoded.id;
        let getUserStmt = DB.prepare(`SELECT id FROM users WHERE id =?;`);
        let user = getUserStmt.get(userId);
        if (user) {
          let deleteUserStmt = DB.prepare(`DELETE FROM users WHERE id=?;`);
          deleteUserStmt.run(userId);
          return res.status(200).json(
            {
              message:
                "You have removed yourself from our recodes. You can signup again.",
            },
          );
        } else {
          return res.status(404).json({ message: "User does not exist" });
        }
      }
    });
  } else {
    return res.status(403).json(
      { message: "Token is required but is not provided." },
    );
  }
};
