import express from "express";
const router = express.Router();


import {googleAuth} from "../controllers/auth/googleAuth.controller.js"
import {login} from "../controllers/auth/login.controller.js"
import {refreshAccessToken} from "../controllers/auth/refreshAccessToken.controller.js"
import {logout} from "../controllers/auth/logout.controller.js"

router.post("/google", googleAuth);
router.post("/login", login);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", logout);

export default router;
