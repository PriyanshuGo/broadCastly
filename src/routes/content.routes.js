const express = require("express");

const {
  createDraftContent,
  updateDraftContent,
  getMyContents,
  getMyContentById,
  deleteMyContent,
  requestContentApproval,
} = require("../controllers/content.controller");

const {
  authMiddleware,
} = require("../middlewares/auth.middleware");

const {
  upload,
} = require("../middlewares/multer.middleware");

const {
  validateCreateDraftContent,
  validateRequestApproval,
} = require("../validations/content.validation");

const {
  cleanupTempFiles,
} = require("../middlewares/cleanupTempFiles.middleware");

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


module.exports = router;