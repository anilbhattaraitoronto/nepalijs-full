const { Router } = require("express");
const router = Router();

const { checkEmailOrUsername } = require("../middlewares/checkEmailOrUsername");

const {
  signup,
  activateUser,
  login,
  changePassword,
  passwordResetRequest,
  getPasswordResetForm,
  resetPassword,
  deleteUser,
} = require(
  "../controllers/authController",
);

router.post("/signup", checkEmailOrUsername, signup);
router.get("/activate/:token", activateUser);
router.post("/login", login);
router.post("/changepassword", changePassword);
router.post("/passwordresetrequest", passwordResetRequest);
router.get("/resetpassword/:token", getPasswordResetForm);
router.post("/resetpassword", resetPassword);
router.delete("/deleteuser", deleteUser);

module.exports = router;
