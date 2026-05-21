const Content = require("../models/content.model");
const { deleteMultipleFromCloudinary } = require("../utils/cloudinary");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");

// ───────────── Get Pending Approval Requests ─────────────

const getPendingApprovalRequests = async (req, res, next) => {
    try {
        const contents = await Content.find({ status: "pending" })
            .populate("createdBy", "name email")
            .populate("reviewedBy", "name email")
            .sort({ approvalRequestedAt: -1 });

        return res.status(200).json(
            new ApiResponse(200, contents, "Pending approval requests fetched successfully")
        );
    } catch (error) {
        return next(new ApiError(500, "Failed to fetch pending approval requests", [error.message]));
    }
};

// ───────────── Get Approval Request Detail / Mark Reviewed ─────────────

const getApprovalRequestById = async (req, res, next) => {
    try {
        const { contentId } = req.params;

        const content = await Content.findById(contentId)
            .populate("createdBy", "name email")
            .populate("reviewedBy", "name email")
            .populate("approvedBy", "name email")
            .populate("rejectedBy", "name email")
            .populate("approvalRequests.requestedBy", "name email");

        if (!content) {
            return next(new ApiError(404, "Content not found"));
        }

        if (content.status === "pending" && !content.reviewedBy) {
            content.reviewedBy = req.user._id;
            content.reviewedAt = new Date();
            await content.save();
        }

        return res.status(200).json(
            new ApiResponse(200, content, "Approval request fetched successfully")
        );
    } catch (error) {
        return next(new ApiError(500, "Failed to fetch approval request", [error.message]));
    }
};

// ───────────── Approve Content ─────────────

const approveContent = async (req, res, next) => {
    try {
        const { contentId } = req.params;

        const content = await Content.findById(contentId);

        if (!content) {
            return next(new ApiError(404, "Content not found"));
        }

        if (content.status !== "pending") {
            return next(new ApiError(400, "Only pending content can be approved"));
        }

        content.status = "approved";

        content.reviewedBy = content.reviewedBy || req.user._id;
        content.reviewedAt = content.reviewedAt || new Date();

        content.approvedBy = req.user._id;
        content.approvedAt = new Date();

        content.rejectedBy = null;
        content.rejectedAt = null;
        content.rejectionReason = null;

        await content.save();

        return res.status(200).json(
            new ApiResponse(200, content, "Content approved successfully")
        );
    } catch (error) {
        return next(new ApiError(500, "Failed to approve content", [error.message]));
    }
};

// ───────────── Reject Content ─────────────

const rejectContent = async (req, res, next) => {
    try {
        const { contentId } = req.params;
        const { rejectionReason } = req.body;

        const content = await Content.findById(contentId);

        if (!content) {
            return next(new ApiError(404, "Content not found"));
        }

        if (content.status !== "pending") {
            return next(new ApiError(400, "Only pending content can be rejected"));
        }

        content.status = "rejected";

        content.reviewedBy = content.reviewedBy || req.user._id;
        content.reviewedAt = content.reviewedAt || new Date();

        content.rejectedBy = req.user._id;
        content.rejectedAt = new Date();
        content.rejectionReason = rejectionReason;

        content.approvedBy = null;
        content.approvedAt = null;

        await content.save();

        return res.status(200).json(
            new ApiResponse(200, content, "Content rejected successfully")
        );
    } catch (error) {
        return next(new ApiError(500, "Failed to reject content", [error.message]));
    }
};


// ───────────── Delete Any Content (Principal/Admin) ─────────────

const deleteContentByPrincipal = async (req, res, next) => {
    try {
        const { contentId } = req.params;

        const content = await Content.findById(contentId);

        if (!content) {
            return next(new ApiError(404, "Content not found"));
        }

        // delete all cloudinary files first
        if (content.files && content.files.length > 0) {
            const deleteResult = await deleteMultipleFromCloudinary(
                content.files
            );

            if (!deleteResult.success) {
                return next(new ApiError(500, "Failed to delete content files from Cloudinary", [deleteResult.error]));
            }
        }

        await Content.deleteOne({ _id: content._id });

        return res.status(200).json(
            new ApiResponse(200, {}, "Content deleted successfully")
        );
    } catch (error) {
        return next(new ApiError(500, "Failed to delete content", [error.message]));
    }
};

module.exports = {
    getPendingApprovalRequests,
    getApprovalRequestById,
    approveContent,
    rejectContent,
    deleteContentByPrincipal,
};