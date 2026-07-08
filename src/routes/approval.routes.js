import express from "express";

import {
    getPendingApprovalRequests,
    getApprovalRequestById,
    approveContent,
    rejectContent,
    deleteContentByPrincipal,
} from "../controllers/approval.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";

import { PERMISSIONS } from "../constants/permissions.js";

import {
    validateRejectContent,
} from "../validations/content.validation.js";

const router = express.Router();

router.get(
    "/pending",
    authMiddleware,
    requirePermission(PERMISSIONS.CONTENT_VIEW_ALL),
    getPendingApprovalRequests
);

router.get(
    "/:contentId",
    authMiddleware,
    requirePermission(PERMISSIONS.CONTENT_VIEW_ALL),
    getApprovalRequestById
);

router.patch(
    "/approve/:contentId",
    authMiddleware,
    requirePermission(PERMISSIONS.CONTENT_APPROVE),
    approveContent
);

router.patch(
    "/reject/:contentId",
    authMiddleware,
    requirePermission(PERMISSIONS.CONTENT_REJECT),
    validateRejectContent,
    rejectContent
);

router.delete(
    "/delete/:contentId",
    authMiddleware,
    requirePermission(PERMISSIONS.CONTENT_DELETE),
    deleteContentByPrincipal
);

export default router;
