import express from "express";

import {
    getLiveContentByTeacher,
} from "../controllers/live.controller.js";

const router = express.Router();

router.get("/:teacherId", getLiveContentByTeacher);

export default router;
