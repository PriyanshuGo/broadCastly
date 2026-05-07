const express = require("express");

const {
    getPendingApprovalRequests,
    getApprovalRequestById,
    approveContent,
    rejectContent,
} = require("../controllers/approval.controller");

const { authMiddleware } = require("../middlewares/auth.middleware");
const { requirePermission } = require("../middlewares/permission.middleware");

const { PERMISSIONS } = require("../constants/permissions");

const {
    validateRejectContent,
} = require("../validations/content.validation");

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

module.exports = router;