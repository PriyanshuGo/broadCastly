import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a local file to Cloudinary (async-safe and structured)
 */
const uploadOnCloudinary = async (
    localFilePath,
    originalFile,
    {
        folder = "content",
        resourceType = "auto",
    } = {}
) => {
    if (!localFilePath) {
        return {
            success: false,
            code: "FILE_PATH_MISSING",
            error: "No file path provided.",
        };
    }

    try {
        // Make sure temporary file exists
        await fs.access(localFilePath);

        const response = await cloudinary.uploader.upload(
            localFilePath,
            {
                resource_type: resourceType,
                folder,
            }
        );

        return {
            success: true,

            file: {
                url: response.secure_url,
                publicId: response.public_id,
                resourceType: response.resource_type,
                format: response.format,

                originalName:
                    originalFile?.originalname || null,

                mimeType:
                    originalFile?.mimetype || null,

                sizeBytes:
                    originalFile?.size || null,

                width: response.width || null,
                height: response.height || null,
                duration: response.duration || null,
            },
        };

    } catch (error) {

        // Log detailed internal error
        console.error("Cloudinary upload failed:", {
            message: error.message,
            code: error.code,
            httpCode: error.http_code,
            file: originalFile?.originalname,
            folder,
        });

        return {
            success: false,
            code: "CLOUDINARY_UPLOAD_FAILED",
            error: "Failed to upload the file. Please try again.",
        };

    } finally {

        // Always remove temporary file
        try {
            await fs.unlink(localFilePath);
        } catch (cleanupError) {

            // ENOENT means file was already removed
            if (cleanupError.code !== "ENOENT") {
                console.error(
                    "Failed to remove temporary file:",
                    cleanupError.message
                );
            }
        }
    }
};

/**
 * Delete a single file from Cloudinary
 */
const deleteFromCloudinary = async (publicId, resourceType = "image") => {
    if (!publicId) {
        return {
            success: false,
            error: "No publicId provided",
        };
    }

    try {
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
            invalidate: true,
        });

        return {
            success: result.result === "ok" || result.result === "not found",
            result,
        };
    } catch (error) {
        return {
            success: false,
            error: "Cloudinary delete failed",
            details: error.message,
        };
    }
};

/**
 * Delete multiple files from Cloudinary
 */
const deleteMultipleFromCloudinary = async (files = []) => {
    if (!Array.isArray(files) || files.length === 0) {
        return {
            success: false,
            error: "No files provided",
        };
    }

    try {
        const groupedByResourceType = files.reduce((acc, file) => {
            if (!file.publicId) return acc;

            const resourceType = file.resourceType || "image";

            if (!acc[resourceType]) {
                acc[resourceType] = [];
            }

            acc[resourceType].push(file.publicId);

            return acc;
        }, {});

        const results = {};

        for (const resourceType of Object.keys(groupedByResourceType)) {
            const result = await cloudinary.api.delete_resources(
                groupedByResourceType[resourceType],
                {
                    resource_type: resourceType,
                    invalidate: true,
                }
            );

            results[resourceType] = result.deleted;
        }

        return {
            success: true,
            deleted: results,
        };
    } catch (error) {
        return {
            success: false,
            error: "Cloudinary bulk delete failed",
            details: error.message,
        };
    }
};

export { uploadOnCloudinary, deleteFromCloudinary, deleteMultipleFromCloudinary };
