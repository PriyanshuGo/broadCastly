const mongoose = require("mongoose");
const Content = require("../models/content.model");

const getLiveContentByTeacher = async (req, res) => {
    try {
        const { teacherId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(teacherId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid teacher id",
            });
        }

        const now = new Date();

        const contents = await Content.find({
            createdBy: teacherId,
            status: "approved",
            startTime: { $lte: now },
            endTime: { $gte: now },
        })
            .select(
                "title description files startTime endTime rotationDuration createdBy"
            )
            .populate("createdBy", "name")
            .sort({ startTime: 1 });

        return res.status(200).json({
            success: true,
            message:
                contents.length > 0
                    ? "Live content fetched successfully"
                    : "No content available",
            data: contents,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch live content",
            error: error.message,
        });
    }
};

module.exports = {
    getLiveContentByTeacher,
};