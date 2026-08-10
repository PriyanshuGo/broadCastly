import express from "express";

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    createChannel
);
export default router;
