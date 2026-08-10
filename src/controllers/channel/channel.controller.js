import Channel from "../../models/channel.model.js";
import ChannelMember from "../../models/channelMember.model.js";
import { ApiError } from "../../utils/common/ApiError.js";
import { ApiResponse } from "../../utils/common/ApiResponse.js";
import { generateSlug, generateJoinCode } from "../../utils/channel/channel.js";

export const createChannel = async (req, res, next) => {
    try {
        const { name, description, visibility } = req.body;

        if (!name || !visibility) {
            return next(
                new ApiError(400, "Channel name and visibility are required")
            );
        }

        if (!["public", "private"].includes(visibility)) {
            return next(
                new ApiError(400, "Visibility must be public or private")
            );
        }

        const slug = generateSlug(name);
        const joinCode = generateJoinCode();

        const existingChannel = await Channel.findOne({
            $or: [{ slug }, { joinCode }],
        });

        if (existingChannel) {
            return next(
                new ApiError(
                    409,
                    "A channel with this name or join code already exists"
                )
            );
        }

        const channel = await Channel.create({
            name,
            description,
            visibility,
            slug,
            joinCode,
            owner: req.user.userId,
            memberCount: 1,
        });

        await ChannelMember.create({
            channel: channel._id,
            user: req.user.userId,
            status: "active",
        });

        return res.status(201).json(
            new ApiResponse(
                201,
                {
                    channel,
                },
                "Channel created successfully"
            )
        );
    } catch (error) {
        next(error);
    }
};