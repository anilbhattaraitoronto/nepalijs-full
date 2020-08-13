const jwt = require("jsonwebtoken");
const { authsecret } = require("../config");
const DB = require("../schema");

exports.verifyAdmin = (req, res, next) => {
  let token = req.headers["x-access-token"];
  if (token) {
    jwt.verify(token, authsecret, (err, decoded) => {
      if (err) {
        return res.status(403).json(
          { message: "Token is either invalid of expired." },
        );
      } else {
        let userId = decoded.id;
        let getUserStmt = DB.prepare(`SELECT is_admin FROM users WHERE id =?;`);
        let user = getUserStmt.get(userId);
        if (user) {
          if (user.is_admin === 1) {
            next();
          } else {
            return res.status(403).json({ message: "Not authorized." });
          }
        } else {
          return res.status(404).json({ message: "User does not exist" });
        }
      }
    });
  } else {
    return res.status(403).json(
      { message: "Token is required but not provided" },
    );
  }
};
