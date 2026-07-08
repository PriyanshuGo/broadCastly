import mongoose from "mongoose";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const validateCreateDraftContent = (req, res, next) => {
    const {
        title,
        description,
        startTime,
        endTime,
        rotationDuration,
    } = req.body;

    const errors = [];

    if (!title || !title.trim()) {
        errors.push("Title is required");
    }

    if (!startTime) {
        errors.push("Start time is required");
    }

    if (!endTime) {
        errors.push("End time is required");
    }

    if (startTime && endTime && new Date(endTime) <= new Date(startTime)) {
        errors.push("End time must be greater than start time");
    }

    if (description && description.length > 1000) {
        errors.push("Description cannot exceed 1000 characters");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors,
        });
    }

    next();
};

const validateRequestApproval = (req, res, next) => {
    const { approvalRequestNote, changesSummary } = req.body;

    const errors = [];

    if (approvalRequestNote && approvalRequestNote.length > 500) {
        errors.push("Approval request note cannot exceed 500 characters");
    }

    if (changesSummary && changesSummary.length > 500) {
        errors.push("Changes summary cannot exceed 500 characters");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors,
        });
    }

    next();
};

const validateRejectContent = (req, res, next) => {
    const { rejectionReason } = req.body;

    const errors = [];

    if (!rejectionReason || !rejectionReason.trim()) {
        errors.push("Rejection reason is required");
    }

    if (rejectionReason && rejectionReason.length > 500) {
        errors.push("Rejection reason cannot exceed 500 characters");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors,
        });
    }

    next();
};

export {
    validateCreateDraftContent,
    validateRequestApproval,
    validateRejectContent,
};
