const Content = require("../models/content.model");
const { deleteMultipleFromCloudinary } = require("../utils/cloudinary");

// ───────────── Get Pending Approval Requests ─────────────

const getPendingApprovalRequests = async (req, res) => {
    try {
        const contents = await Content.find({ status: "pending" })
            .populate("createdBy", "name email")
            .populate("reviewedBy", "name email")
            .sort({ approvalRequestedAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Pending approval requests fetched successfully",
            data: contents,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch pending approval requests",
            error: error.message,
        });
    }
};

// ───────────── Get Approval Request Detail / Mark Reviewed ─────────────

const getApprovalRequestById = async (req, res) => {
    try {
        const { contentId } = req.params;

        const content = await Content.findById(contentId)
            .populate("createdBy", "name email")
            .populate("reviewedBy", "name email")
            .populate("approvedBy", "name email")
            .populate("rejectedBy", "name email")
            .populate("approvalRequests.requestedBy", "name email");

        if (!content) {
            return res.status(404).json({
                success: false,
                message: "Content not found",
            });
        }

        if (content.status === "pending" && !content.reviewedBy) {
            content.reviewedBy = req.user._id;
            content.reviewedAt = new Date();
            await content.save();
        }

        return res.status(200).json({
            success: true,
            message: "Approval request fetched successfully",
            data: content,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch approval request",
            error: error.message,
        });
    }
};

// ───────────── Approve Content ─────────────

const approveContent = async (req, res) => {
    try {
        const { contentId } = req.params;

        const content = await Content.findById(contentId);

        if (!content) {
            return res.status(404).json({
                success: false,
                message: "Content not found",
            });
        }

        if (content.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "Only pending content can be approved",
            });
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

        return res.status(200).json({
            success: true,
            message: "Content approved successfully",
            data: content,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to approve content",
            error: error.message,
        });
    }
};

// ───────────── Reject Content ─────────────

const rejectContent = async (req, res) => {
    try {
        const { contentId } = req.params;
        const { rejectionReason } = req.body;

        const content = await Content.findById(contentId);

        if (!content) {
            return res.status(404).json({
                success: false,
                message: "Content not found",
            });
        }

        if (content.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "Only pending content can be rejected",
            });
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

        return res.status(200).json({
            success: true,
            message: "Content rejected successfully",
            data: content,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to reject content",
            error: error.message,
        });
    }
};


// ───────────── Delete Any Content (Principal/Admin) ─────────────

const deleteContentByPrincipal = async (req, res) => {
    try {
        const { contentId } = req.params;

        const content = await Content.findById(contentId);

        if (!content) {
            return res.status(404).json({
                success: false,
                message: "Content not found",
            });
        }

        // delete all cloudinary files first
        if (content.files && content.files.length > 0) {
            const deleteResult = await deleteMultipleFromCloudinary(
                content.files
            );

            if (!deleteResult.success) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to delete content files from Cloudinary",
                    error: deleteResult.error,
                });
            }
        }

        await Content.deleteOne({ _id: content._id });

        return res.status(200).json({
            success: true,
            message: "Content deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete content",
            error: error.message,
        });
    }
};

module.exports = {
    getPendingApprovalRequests,
    getApprovalRequestById,
    approveContent,
    rejectContent,
    deleteContentByPrincipal,
};