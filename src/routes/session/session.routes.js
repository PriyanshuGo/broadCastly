import express from "express";
import { authenticate } from "../../middlewares/auth/authenticate.middleware.js";
import { getAllSessions } from "../../controllers/session/getAllSessions.controller.js";
import { terminateOneSession } from "../../controllers/session/terminateOneSession.controller.js";
import { terminateAllSession } from "../../controllers/session/terminateAllSession.controller.js";

const router = express.Router();

router.get("/all", authenticate, getAllSessions);
router.post("/terminateOne/:sessionID", authenticate, terminateAllSession);
router.delete("terminateAll/:sessionId", authenticate, terminateOneSession);

export default router;
