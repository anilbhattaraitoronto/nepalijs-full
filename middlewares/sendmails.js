const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const { emailsecret, emailConfig } = require("../config");

exports.sendActivationEmail = (
  senderDetail,
  fullName,
  userEmail,
  username,
  password,
  secret,
) => {
  const transporter = nodemailer.createTransport(senderDetail);
  const token = jwt.sign(
    {
      full_name: fullName,
      email: userEmail,
      username: username,
      password: password,
    },
    secret,
    { expiresIn: "3m" },
  );
  const activationUrl = `
    <h3>Please click the link to activate your email</h3>
    <p>
        <a href="http://localhost:4003/api/auth/activate/${token}">
        http://localhost:4003/api/auth/activate/${token}
        </a>
    </p>
    `;
  const options = {
    from: "no-reply@gmail.com",
    to: userEmail,
    subject: "Please click the link below to activate your account.",
    html: activationUrl,
  };
  //send email
  transporter.sendMail(options, (err, info) => {
    if (err) {
      console.error(err);
    } else {
      console.log("Email sent: ", info.response);
    }
  });
};

exports.sendPasswordResetLink = (
  senderDetail,
  userEmail,
  secret,
) => {
  const transporter = nodemailer.createTransport(senderDetail);
  const token = jwt.sign(
    {
      email: userEmail,
    },
    secret,
    { expiresIn: "3m" },
  );
  const passwordResetLink = `
      <h3>Please click the link to go to password reset form.</h3>
      <p>
          <a href="http://localhost:4003/api/auth/resetpassword/${token}">
          http://localhost:4003/api/auth/resetpassword/${token}
          </a>
      </p>
      `;
  const options = {
    from: "no-reply@gmail.com",
    to: userEmail,
    subject: "Please click the link below to activate your account.",
    html: passwordResetLink,
  };
  //send email
  transporter.sendMail(options, (err, info) => {
    if (err) {
      console.error(err);
    } else {
      console.log("Email sent: ", info.response);
    }
  });
};
