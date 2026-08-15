import mongoose from "mongoose";

const userProfileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        handle: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            minlength: 3,
            maxlength: 30,
        },

        displayName: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 50,
        },

        bio: {
            type: String,
            default: "",
            trim: true,
            maxlength: 160,
        },

        avatar: {
            url: {
                type: String,
                default: null,
            },
            publicId: {
                type: String,
                default: null,
            },
        },
    },
    { timestamps: true }
);

userProfileSchema.index({ handle: 1 }, { unique: true });

export default mongoose.model("UserProfile", userProfileSchema);