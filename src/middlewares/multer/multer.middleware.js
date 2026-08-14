import multer from "multer";
import path from "path";
import fs from "fs/promises";

const contentTempDir = path.join(
    process.cwd(),
    "temp",
    "content"
);

const channelLogoTempDir = path.join(
    process.cwd(),
    "temp",
    "channel-logos"
);

// Create temp directories
(async () => {
    try {
        await Promise.all([
            fs.mkdir(contentTempDir, { recursive: true }),
            fs.mkdir(channelLogoTempDir, { recursive: true }),
        ]);
    } catch (error) {
        console.error("Failed to create upload directories:", error);
        process.exit(1);
    }
})();

const createStorage = (destination) =>
    multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, destination);
        },

        filename: (req, file, cb) => {
            const uniqueSuffix =
                Date.now() +
                "-" +
                Math.round(Math.random() * 1e9);

            cb(
                null,
                `${file.fieldname}-${uniqueSuffix}${path.extname(
                    file.originalname
                )}`
            );
        },
    });

// =========================
// IMAGE FILTER
// =========================

const allowedImageTypes = [
    ".jpeg",
    ".png",
    ".webp",
    ".jpg",
];

const imageFileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedImageTypes.includes(ext)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Only JPEG, PNG, and WebP images are allowed"
            )
        );
    }
};

// =========================
// CONTENT FILTER
// =========================

const allowedContentTypes = [
    // Images
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",

    // Documents
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",

    // Video
    "video/mp4",
    "video/webm",
    "video/quicktime",

    // Audio
    "audio/mpeg",
    "audio/wav",
    "audio/ogg",
];

const contentFileFilter = (req, file, cb) => {
    if (allowedContentTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                `File type "${file.mimetype}" is not supported`
            )
        );
    }
};

// =========================
// STORAGE
// =========================

const contentStorage = createStorage(contentTempDir);

const channelLogoStorage = createStorage(
    channelLogoTempDir
);

// =========================
// MULTER CONFIG
// =========================

const contentUpload = multer({
    storage: contentStorage,
    limits: {
        fileSize: 20 * 1024 * 1024,
        files: 10,
    },
    fileFilter: contentFileFilter,
});

const channelLogoUpload = multer({
    storage: channelLogoStorage,
    limits: {
        fileSize: 2 * 1024 * 1024,
        files: 1,
    },
    fileFilter: imageFileFilter,
});

export {
    contentUpload,
    channelLogoUpload,
    contentTempDir,
    channelLogoTempDir,
};