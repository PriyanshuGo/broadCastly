const fs = require("fs").promises;

const cleanupTempFiles = async (req, res, next) => {
    res.on("finish", async () => {
        try {
            if (!req.files || req.files.length === 0) return;

            await Promise.all(
                req.files.map(async (file) => {
                    if (!file.path) return;

                    try {
                        await fs.unlink(file.path);
                    } catch (error) {
                        // ignore if already deleted by Cloudinary util
                    }
                })
            );
        } catch (error) {
            console.warn("Temp cleanup failed:", error.message);
        }
    });

    next();
};

module.exports = { cleanupTempFiles };