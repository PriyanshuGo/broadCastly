import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
    {
        url: {
            type: String,
            required: true,
            trim: true,
        },

        publicId: {
            type: String,
            required: true,
            index: true,
        },

        resourceType: {
            type: String,
            enum: ["image", "video", "raw"],
            required: true,
        },

        format: {
            type: String,
            trim: true,
        },

        originalName: {
            type: String,
            required: true,
            trim: true,
        },

        mimeType: {
            type: String,
            required: true,
            trim: true,
        },

        sizeBytes: {
            type: Number,
            required: true,
            min: 0,
        },

        width: {
            type: Number,
        },

        height: {
            type: Number,
        },

        duration: {
            type: Number,
        },

        uploadedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        _id: false,
    }
);

export default fileSchema;
