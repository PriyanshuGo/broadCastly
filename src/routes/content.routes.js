import express from "express";

import {
  createDraftContent,
  updateDraftContent,
  getMyContents,
  getAllContents,
  getMyContentById,
  deleteMyContent,
  requestContentApproval,
} from "../controllers/content.controller.js";

import {
  authMiddleware,
} from "../middlewares/auth.middleware.js";

import {
  requirePermission,
} from "../middlewares/permission.middleware.js";

import {
  upload,
} from "../middlewares/multer.middleware.js";

import {
  validateCreateDraftContent,
  validateRequestApproval,
} from "../validations/content.validation.js";

import {
  cleanupTempFiles,
} from "../middlewares/cleanupTempFiles.middleware.js";

import { PERMISSIONS } from "../constants/permissions.js";

const router = express.Router();

// ───────────── Teacher Draft Content Routes ─────────────

// Create draft content
router.post(
  "/draft",
  authMiddleware,
  upload.array("files", 10),
  cleanupTempFiles,
  validateCreateDraftContent,
  createDraftContent
);

// Update existing draft
router.patch(
  "/draft/:contentId",
  authMiddleware,
  upload.array("files", 10),
  cleanupTempFiles,
  validateCreateDraftContent,
  updateDraftContent
);

// Get my contents
router.get(
  "/my",
  authMiddleware,
  getMyContents
);

// Get all contents (admin/principal view)
router.get(
  "/",
  authMiddleware,
  requirePermission(PERMISSIONS.CONTENT_VIEW_ALL),
  getAllContents
);

// Get my content by ID
router.get(
  "/my/:contentId",
  authMiddleware,
  getMyContentById
);

// Delete my content
router.delete(
  "/my/:contentId",
  authMiddleware,
  deleteMyContent
);


// Request approval (for draft/rejected content)
router.patch(
  "/request-approval/:contentId",
  authMiddleware,
  validateRequestApproval,
  requestContentApproval
);


export default router;
