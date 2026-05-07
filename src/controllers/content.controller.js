const Content = require("../models/content.model");
const Subject = require("../models/subject.model");
const { uploadOnCloudinary, deleteMultipleFromCloudinary } = require("../utils/cloudinary");

// ───────────── Create Draft Content ─────────────

const createDraftContent = async (req, res) => {
    try {
        const {
            title,
            description,
            subject,
            startTime,
            endTime,
            rotationDuration,
        } = req.body;

        const subjectExists = await Subject.findOne({
            _id: subject,
            isActive: true,
        });

        if (!subjectExists) {
            return res.status(404).json({
                success: false,
                message: "Subject not found or inactive",
            });
        }

        const uploadedFiles = [];

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const uploaded = await uploadOnCloudinary(
                    file.path,
                    file,
                    "content"
                );

                if (!uploaded.success) {
                    return res.status(500).json({
                        success: false,
                        message: "File upload failed",
                        error: uploaded.error,
                        details: uploaded.details,
                    });
                }

                uploadedFiles.push(uploaded.file);
            }
        }

        const content = await Content.create({
            title,
            description,
            subject,
            files: uploadedFiles,
            createdBy: req.user._id,

            status: "draft",

            approvalRequestCount: 0,
            approvalRequestedAt: null,
            approvalRequests: [],

            startTime,
            endTime,
            rotationDuration,
        });

        return res.status(201).json({
            success: true,
            message: "Content draft created successfully",
            data: content,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to create content draft",
            error: error.message,
        });
    }
};


// ───────────── Update Draft Content ─────────────

const updateDraftContent = async (req, res) => {
    try {
        const { contentId } = req.params;

        const {
            title,
            description,
            subject,
            startTime,
            endTime,
            rotationDuration,
            removeFilePublicIds,
        } = req.body;

        const content = await Content.findOne({
            _id: contentId,
            createdBy: req.user._id,
        });

        if (!content) {
            return res.status(404).json({
                success: false,
                message: "Content not found",
            });
        }

        if (content.status !== "draft") {
            return res.status(400).json({
                success: false,
                message: "Only draft content can be updated from this route",
            });
        }

        if (subject) {
            const subjectExists = await Subject.findOne({
                _id: subject,
                isActive: true,
            });

            if (!subjectExists) {
                return res.status(404).json({
                    success: false,
                    message: "Subject not found or inactive",
                });
            }

            content.subject = subject;
        }

        if (title !== undefined) content.title = title;
        if (description !== undefined) content.description = description;
        if (startTime !== undefined) content.startTime = startTime;
        if (endTime !== undefined) content.endTime = endTime;

        if (rotationDuration !== undefined) {
            content.rotationDuration = rotationDuration;
        }

        let publicIdsToRemove = [];

        if (removeFilePublicIds) {
            try {
                publicIdsToRemove = Array.isArray(removeFilePublicIds)
                    ? removeFilePublicIds
                    : JSON.parse(removeFilePublicIds);
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: "removeFilePublicIds must be a valid JSON array",
                });
            }
        }

        if (publicIdsToRemove.length > 0) {
            const filesToRemove = content.files.filter((file) =>
                publicIdsToRemove.includes(file.publicId)
            );

            if (filesToRemove.length > 0) {
                const deleteResult = await deleteMultipleFromCloudinary(filesToRemove);

                if (!deleteResult.success) {
                    return res.status(500).json({
                        success: false,
                        message: "Failed to delete files from Cloudinary",
                        error: deleteResult.error,
                    });
                }

                content.files = content.files.filter(
                    (file) => !publicIdsToRemove.includes(file.publicId)
                );
            }
        }

        if (req.files && req.files.length > 0) {
            const uploadedFiles = [];

            for (const file of req.files) {
                const uploaded = await uploadOnCloudinary(
                    file.path,
                    file,
                    "content"
                );

                if (!uploaded.success) {
                    return res.status(500).json({
                        success: false,
                        message: "File upload failed",
                        error: uploaded.error,
                        details: uploaded.details,
                    });
                }

                uploadedFiles.push(uploaded.file);
            }

            content.files.push(...uploadedFiles);
        }

        await content.save();

        return res.status(200).json({
            success: true,
            message: "Content draft updated successfully",
            data: content,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update content draft",
            error: error.message,
        });
    }
};

// ───────────── Get My Contents ─────────────

const getMyContents = async (req, res) => {
    try {
        const {
            status,
            search,
            page = 1,
            limit = 10,
        } = req.query;

        const query = {
            createdBy: req.user._id,
        };

        if (status) {
            query.status = status;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [contents, total] = await Promise.all([
            Content.find(query)
                .populate("subject", "name")
                .populate("reviewedBy", "name email")
                .populate("approvedBy", "name email")
                .populate("rejectedBy", "name email")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),

            Content.countDocuments(query),
        ]);

        return res.status(200).json({
            success: true,
            message: "Contents fetched successfully",
            data: contents,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch contents",
            error: error.message,
        });
    }
};


// ───────────── Get My Content By Id ─────────────

const getMyContentById = async (req, res) => {
    try {
        const { contentId } = req.params;

        const content = await Content.findOne({
            _id: contentId,
            createdBy: req.user._id,
        })
            .populate("subject", "name")
            .populate("createdBy", "name email")
            .populate("reviewedBy", "name email")
            .populate("approvedBy", "name email")
            .populate("rejectedBy", "name email");

        if (!content) {
            return res.status(404).json({
                success: false,
                message: "Content not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Content fetched successfully",
            data: content,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch content",
            error: error.message,
        });
    }
};

// ───────────── Delete My Content ─────────────

const deleteMyContent = async (req, res) => {
    try {
        const { contentId } = req.params;

        const content = await Content.findOne({
            _id: contentId,
            createdBy: req.user._id,
        });

        if (!content) {
            return res.status(404).json({
                success: false,
                message: "Content not found",
            });
        }

        if (!["draft", "rejected"].includes(content.status)) {
            return res.status(400).json({
                success: false,
                message: "Only draft or rejected content can be deleted",
            });
        }

        if (content.files && content.files.length > 0) {
            const deleteResult = await deleteMultipleFromCloudinary(content.files);

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


// ───────────── Request / Re-request Approval ─────────────

const requestContentApproval = async (req, res) => {
    try {
        const { contentId } = req.params;

        const {
            approvalRequestNote,
            changesSummary,
        } = req.body;

        const content = await Content.findOne({
            _id: contentId,
            createdBy: req.user._id,
        });

        if (!content) {
            return res.status(404).json({
                success: false,
                message: "Content not found",
            });
        }

        if (!["draft", "rejected"].includes(content.status)) {
            return res.status(400).json({
                success: false,
                message: "Only draft or rejected content can be requested for approval",
            });
        }

        if (!content.files || content.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one file is required before requesting approval",
            });
        }

        content.status = "pending";

        content.approvalRequestCount += 1;
        content.approvalRequestedAt = new Date();

        content.approvalRequests.push({
            requestedBy: req.user._id,
            requestedAt: new Date(),
            note: approvalRequestNote || null,
            changesSummary: changesSummary || null,
        });

        // reset current review cycle
        content.reviewedBy = null;
        content.reviewedAt = null;

        content.approvedBy = null;
        content.approvedAt = null;

        content.rejectedBy = null;
        content.rejectedAt = null;
        content.rejectionReason = null;

        await content.save();

        return res.status(200).json({
            success: true,
            message: "Content requested for approval successfully",
            data: content,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to request content approval",
            error: error.message,
        });
    }
};


module.exports = {
    createDraftContent,
    updateDraftContent,
    getMyContents,
    getMyContentById,
    deleteMyContent,
    requestContentApproval,
};