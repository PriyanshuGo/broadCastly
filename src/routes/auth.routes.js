const express = require("express");
const router = express.Router();

const {
    login,
    refreshAccessToken,
    logout,
    googleAuth,
} = require("../controllers/auth.controller");


router.post("/google", googleAuth);
router.post("/login", login);

router.post("/refresh-token", refreshAccessToken);

router.post("/logout", logout);

module.exports = router;