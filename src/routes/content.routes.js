const express = require("express");

const {
  createDraftContent,
  updateDraftContent,
} = require("../controllers/content.controller");

const {
  authMiddleware,
} = require("../middlewares/auth.middleware");

const {
  upload,
} = require("../middlewares/multer.middleware");

const {
  validateCreateDraftContent,
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

module.exports = router;