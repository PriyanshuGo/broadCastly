import express from "express";

// import { registerUser, verifyUserOtp } from "../../controllers/user.controller.js";
import { updateUserProfile } from "../../controllers/user/updateUserProfile.controller.js"
import { checkHandleAvailability } from "../../controllers/user/checkHandleAvailability.controller.js"
import { updateUserHandle } from "../../controllers/user/updateUserHandle.controller.js"
import { getUserProfile } from "../../controllers/user/getUserProfile.controller.js"

import {authenticate} from "../../middlewares/auth/authenticate.middleware.js"
import {userAvatarUpload} from "../../middlewares/multer/multer.middleware.js" 

const router = express.Router();

// router.post("/register", registerUser);
// router.post("/verify-otp", verifyUserOtp);

//Get profile data
router.get(
    "/profile",
    authenticate,
    getUserProfile
);

//Change profile data
router.patch(
    "/profile/update",
    authenticate,
    userAvatarUpload.single("avatar"),
    updateUserProfile
);

// Check handle availability
router.get(
    "/profile/check",
    authenticate,
    checkHandleAvailability
);

// Change handle
router.patch(
    "/profile/handle",
    authenticate,
    updateUserHandle
);

export default router;


