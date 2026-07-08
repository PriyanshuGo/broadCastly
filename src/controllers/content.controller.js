import Content from "../models/content.model.js";
import { uploadOnCloudinary, deleteMultipleFromCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// ───────────── Create Draft Content ─────────────

const createDraftContent = async (req, res, next) => {
    try {
        const {
            title,
            description,
            startTime,
            endTime,
            rotationDuration,
        } = req.body;

        const uploadedFiles = [];

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const uploaded = await uploadOnCloudinary(
                    file.path,
                    file,
                    "content"
                );

                if (!uploaded.success) {
                    return next(
                        new ApiError(500, "File upload failed", [uploaded.error])
                    );
                }

                uploadedFiles.push(uploaded.file);
            }
        }

        const content = await Content.create({
            title,
            description,
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

        return res.status(201).json(
            new ApiResponse(201, content, "Content draft created successfully")
        );
    } catch (error) {
        return next(new ApiError(500, "Failed to create content draft", [error.message]));
    }
};


// ───────────── Update Draft Content ─────────────

const updateDraftContent = async (req, res, next) => {
    try {
        const { contentId } = req.params;

        const {
            title,
            description,
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
            return next(new ApiError(404, "Content not found"));
        }

        if (content.status !== "draft") {
            return next(new ApiError(400, "Only draft content can be updated from this route"));
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
                return next(new ApiError(400, "removeFilePublicIds must be a valid JSON array"));
            }
        }

        if (publicIdsToRemove.length > 0) {
            const filesToRemove = content.files.filter((file) =>
                publicIdsToRemove.includes(file.publicId)
            );

            if (filesToRemove.length > 0) {
                const deleteResult = await deleteMultipleFromCloudinary(filesToRemove);

                if (!deleteResult.success) {
                    return next(
                        new ApiError(500, "Failed to delete files from Cloudinary", [deleteResult.error])
                    );
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
                    return next(
                        new ApiError(500, "File upload failed", [uploaded.error])
                    );
                }

                uploadedFiles.push(uploaded.file);
            }

            content.files.push(...uploadedFiles);
        }

        await content.save();

        return res.status(200).json(
            new ApiResponse(200, content, "Content draft updated successfully")
        );
    } catch (error) {
        return next(new ApiError(500, "Failed to update content draft", [error.message]));
    }
};

// ───────────── Get My Contents ─────────────

const getMyContents = async (req, res, next) => {
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

        const [contents, total, totalUploadedContent] = await Promise.all([
            Content.find(query)
                .populate("reviewedBy", "name email")
                .populate("approvedBy", "name email")
                .populate("rejectedBy", "name email")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),

            Content.countDocuments(query),
            Content.countDocuments({ createdBy: req.user._id }),
        ]);

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    contents,
                    totalUploadedContent,
                    pagination: {
                        total,
                        page: Number(page),
                        limit: Number(limit),
                        totalPages: Math.ceil(total / Number(limit)),
                    },
                },
                "Contents fetched successfully"
            )
        );
    } catch (error) {
        return next(new ApiError(500, "Failed to fetch contents", [error.message]));
    }
};


// ───────────── Get All Contents ─────────────

const getAllContents = async (req, res, next) => {
    try {
        const {
            status,
            search,
            page = 1,
            limit = 10,
        } = req.query;

        const query = {
            status: { $ne: "draft" },
        };

        if (status && status !== "draft") {
            query.status = status;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [contents, total, totalUploadedContent] = await Promise.all([
            Content.find(query)
                .populate("createdBy", "name email")
                .populate("reviewedBy", "name email")
                .populate("approvedBy", "name email")
                .populate("rejectedBy", "name email")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),

            Content.countDocuments(query),
            Content.countDocuments({ status: { $ne: "draft" } }),
        ]);

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    contents,
                    totalUploadedContent,
                    pagination: {
                        total,
                        page: Number(page),
                        limit: Number(limit),
                        totalPages: Math.ceil(total / Number(limit)),
                    },
                },
                "All contents fetched successfully"
            )
        );
    } catch (error) {
        return next(new ApiError(500, "Failed to fetch contents", [error.message]));
    }
};


// ───────────── Get My Content By Id ─────────────

const getMyContentById = async (req, res, next) => {
    try {
        const { contentId } = req.params;

        const content = await Content.findOne({
            _id: contentId,
            createdBy: req.user._id,
        })
            .populate("createdBy", "name email")
            .populate("reviewedBy", "name email")
            .populate("approvedBy", "name email")
            .populate("rejectedBy", "name email");

        if (!content) {
            return next(new ApiError(404, "Content not found"));
        }

        return res.status(200).json(
            new ApiResponse(200, content, "Content fetched successfully")
        );
    } catch (error) {
        return next(new ApiError(500, "Failed to fetch content", [error.message]));
    }
};

// ───────────── Delete My Content ─────────────

const deleteMyContent = async (req, res, next) => {
    try {
        const { contentId } = req.params;

        const content = await Content.findOne({
            _id: contentId,
            createdBy: req.user._id,
        });

        if (!content) {
            return next(new ApiError(404, "Content not found"));
        }

        if (!["draft", "rejected"].includes(content.status)) {
            return next(new ApiError(400, "Only draft or rejected content can be deleted"));
        }

        if (content.files && content.files.length > 0) {
            const deleteResult = await deleteMultipleFromCloudinary(content.files);

            if (!deleteResult.success) {
                return next(
                    new ApiError(500, "Failed to delete content files from Cloudinary", [deleteResult.error])
                );
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


// ───────────── Request / Re-request Approval ─────────────

const requestContentApproval = async (req, res, next) => {
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
            return next(new ApiError(404, "Content not found"));
        }

        if (!["draft", "rejected"].includes(content.status)) {
            return next(new ApiError(400, "Only draft or rejected content can be requested for approval"));
        }

        if (!content.files || content.files.length === 0) {
            return next(new ApiError(400, "At least one file is required before requesting approval"));
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

        return res.status(200).json(
            new ApiResponse(200, content, "Content requested for approval successfully")
        );
    } catch (error) {
        return next(new ApiError(500, "Failed to request content approval", [error.message]));
    }
};


export {
    createDraftContent,
    updateDraftContent,
    getMyContents,
    getAllContents,
    getMyContentById,
    deleteMyContent,
    requestContentApproval,
};
