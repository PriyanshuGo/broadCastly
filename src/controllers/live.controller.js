const mongoose = require("mongoose");
const Content = require("../models/content.model");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");

const getLiveContentByTeacher = async (req, res, next) => {
    try {
        const { teacherId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(teacherId)) {
            return next(new ApiError(400, "Invalid teacher id"));
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

        return res.status(200).json(
            new ApiResponse(
                200,
                contents,
                contents.length > 0
                    ? "Live content fetched successfully"
                    : "No content available"
            )
        );
    } catch (error) {
        return next(new ApiError(500, "Failed to fetch live content", [error.message]));
    }
};

module.exports = {
    getLiveContentByTeacher,
};