const express = require("express");

const { registerUser, verifyUserOtp } = require("../controllers/user.controller.js");

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-otp", verifyUserOtp);

module.exports = router;


