import path from "path";
import { fileTypeFromFile } from "file-type";

const allowedImageTypes = {
    ".jpg": {
        ext: "jpg",
        mime: "image/jpeg",
    },
    ".jpeg": {
        ext: "jpg",
        mime: "image/jpeg",
    },
    ".png": {
        ext: "png",
        mime: "image/png",
    },
    ".webp": {
        ext: "webp",
        mime: "image/webp",
    },
};

export const validateImageFile = async (file) => {
    const extension = path
        .extname(file.originalname)
        .toLowerCase();

    const expectedType = allowedImageTypes[extension];

    if (!expectedType) {
        return {
            valid: false,
            error: "Unsupported image format.",
        };
    }

    // 🔐 Inspect actual file bytes
    const detectedType = await fileTypeFromFile(file.path);

    if (!detectedType) {
        return {
            valid: false,
            error: "Unable to determine file type.",
        };
    }

    // Extension and actual content must agree
    if (
        detectedType.ext !== expectedType.ext ||
        detectedType.mime !== expectedType.mime
    ) {
        return {
            valid: false,
            error: "File content does not match its extension.",
        };
    }

    return {
        valid: true,
    };
};