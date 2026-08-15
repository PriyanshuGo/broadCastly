import express from "express";

// import { registerUser, verifyUserOtp } from "../../controllers/user.controller.js";
import { updateUserProfile } from "../../controllers/user/updateUserProfile.controller"
import {checkHandleAvailability} from "../../controllers/user/checkHandleAvailability.controller"
import {updateUserHandle} from   "../../controllers/user/updateUserHandle.controller"

const router = express.Router();

// router.post("/register", registerUser);
// router.post("/verify-otp", verifyUserOtp);

//Change profile data
router.patch(
    "/profile", 
    authenticate,
    userAvatarUpload.single("avatar"),
    updateUserProfile
);

// Check handle availability
router.get(
    "/profile/handle/check",
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


