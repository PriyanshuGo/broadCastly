import mongoose from "mongoose";

const channelSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 80,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        description: {
            type: String,
            default: "",
            trim: true,
            maxlength: 500,
        },

        logo: {
            url: {
                type: String,
                default: null,
            },

            publicId: {
                type: String,
                default: null,
            },
        },

        channelType: {
            type: String,
            enum: ["public", "private"],
            required: true,
            index: true,
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        joinCode: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        memberCount: {
            type: Number,
            default: 1,
            min: 0,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Channel", channelSchema);