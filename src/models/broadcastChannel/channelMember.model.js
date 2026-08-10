import mongoose from "mongoose";

const channelMemberSchema = new mongoose.Schema(
    {
        channel: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Channel",
            required: true,
            index: true,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        status: {
            type: String,
            enum: [
                "active",
                "left",
            ],
            default: "active",
            index: true,
        },

    },
    {
        timestamps: true,
    }
);

channelMemberSchema.index(
    {
        channel: 1,
        user: 1,
    },
    {
        unique: true,
    }
);

export default mongoose.model("ChannelMember", channelMemberSchema); 