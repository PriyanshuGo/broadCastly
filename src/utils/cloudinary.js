const cloudinary = require("cloudinary").v2;
const fs = require("fs").promises;

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
    folder = "content"
) => {
    if (!localFilePath) {
        return { success: false, error: "No file path provided" };
    }

    try {
        // Check if file exists
        await fs.access(localFilePath);

        // Upload to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder,
        });

        // Remove local temp file safely
        try {
            await fs.unlink(localFilePath);
        } catch (unlinkError) {
            console.warn("Failed to delete temp file:", unlinkError.message);
        }

        return {
            success: true,

            file: {
                url: response.secure_url,

                publicId: response.public_id,

                resourceType: response.resource_type,

                format: response.format,

                originalName: originalFile.originalname,

                mimeType: originalFile.mimetype,

                sizeBytes: originalFile.size,

                width: response.width,

                height: response.height,

                duration: response.duration,
            },
        };
    } catch (error) {
        // Attempt cleanup if upload failed
        try {
            await fs.unlink(localFilePath);
        } catch { }

        return {
            success: false,
            error: "Cloudinary upload failed",
            details: error.message,
        };
    }
};

/**
 * Delete a single file from Cloudinary
 */
// const deleteFromCloudinary = async (publicId, resourceType = "image") => {
//     if (!publicId) {
//         return {
//             success: false,
//             error: "No publicId provided",
//         };
//     }

//     try {
//         const result = await cloudinary.uploader.destroy(publicId, {
//             resource_type: resourceType,
//             invalidate: true,
//         });

//         return {
//             success: result.result === "ok" || result.result === "not found",
//             result,
//         };
//     } catch (error) {
//         return {
//             success: false,
//             error: "Cloudinary delete failed",
//             details: error.message,
//         };
//     }
// };

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

module.exports = { uploadOnCloudinary, deleteMultipleFromCloudinary };
