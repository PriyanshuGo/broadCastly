
import fs from "fs/promises";
import cloudinary from "./cloudinary.config.js";


/**
 * Upload a local file to Cloudinary (async-safe and structured)
 */
export const uploadOnCloudinary = async (
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
        console.error("FULL CLOUDINARY ERROR:", error);

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
export const deleteFromCloudinary = async (publicId, resourceType = "image") => {
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


