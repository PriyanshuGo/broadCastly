import express from "express";
import { authenticate } from "../../middlewares/auth/authenticate.middleware.js";
import { createChannel } from "../../controllers/channel/createChannel.controller.js";
import { getMyChannels } from "../../controllers/channel/getMyChannels.controller.js";
import { channelLogoUpload } from "../../middlewares/multer/multer.middleware.js";
const router = express.Router();

router.post(
    "/create-channel",
    authenticate,
    channelLogoUpload.single("logo"),
    createChannel
);

router.get("/my-channels", authenticate, getMyChannels)
export default router;
