import express from "express";

import { registerUser, verifyUserOtp } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-otp", verifyUserOtp);

export default router;


