const DB = require("../schema");

exports.checkEmailOrUsername = (req, res, next) => {
  let { full_name, email, username, password, confirmPassword } = req.body;
  //check if all data is provided
  if (full_name && email && username && password && confirmPassword) {
    //check if password and confirmPassword match
    if (password === confirmPassword) {
      let getUserStmt = DB.prepare(`SELECT email FROM users WHERE email=?;`);
      let user = getUserStmt.get(email);
      //check if the user with that email exists or not.
      if (user) {
        return res.status(400).json(
          { message: "User with that email already exists." },
        );
      } else {
        //check if user with username exists
        let getUserStmt = DB.prepare(
          `SELECT username FROM users WHERE username=?;`,
        );
        let user = getUserStmt.get(username);
        if (user) {
          return res.status(400).json(
            { message: "A user with that username already exists" },
          );
        } else {
          next();
        }
      }
    } else {
      return res.status(400).json({ message: "Passwords do not match." });
    }
  } else {
    return res.status(400).json({ message: "All these are required fields" });
  }
};
