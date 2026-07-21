import express from "express";
const router = express.Router();

import {
    login,
    refreshAccessToken,
    logout,
} from "../controllers/auth.controller.js";
import {googleAuth} from "../controllers/auth/googleAuth.controller.js"

router.post("/google", googleAuth);
router.post("/login", login);

router.post("/refresh-token", refreshAccessToken);

router.post("/logout", logout);

export default router;
