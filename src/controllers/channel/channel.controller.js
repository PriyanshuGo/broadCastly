import mongoose from "mongoose";

import Channel from "../../models/channel.model.js";
import ChannelMember from "../../models/channelMember.model.js";

import { ApiError } from "../../utils/common/ApiError.js";
import { ApiResponse } from "../../utils/common/ApiResponse.js";

import {
    generateSlug,
    generateJoinCode,
} from "../../utils/channel/channel.js";

import {
    uploadOnCloudinary,
    deleteFromCloudinary,
} from "../../utils/cloudinary/cloudinary.js";


export const createChannel = async (req, res, next) => {
    const { name, description, ChannelType } = req.body;

    if (!name || !ChannelType) {
        return next(
            new ApiError(
                400,
                "Channel name and Channel Type are required"
            )
        );
    }

    if (!["public", "private"].includes(ChannelType)) {
        return next(
            new ApiError(
                400,
                "ChannelType must be public or private"
            )
        );
    }

    let logoData = { url: null, publicId: null };

    // Upload logo image to Cloudinary if provided
    if (req.file) {
        const uploadResult = await uploadOnCloudinary(
            req.file.path,
            req.file,
            {
                folder: "channel_logos",
                resourceType: "image",
            }
        );

        if (!uploadResult.success) {
            return next(
                new ApiError(
                    500,
                    uploadResult.error || "Failed to upload channel logo"
                )
            );
        }

        logoData = {
            url: uploadResult.file.url,
            publicId: uploadResult.file.publicId,
        };
    }

    const MAX_RETRIES = 3;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        const session = await mongoose.startSession();

        try {
            let channel;

            await session.withTransaction(async () => {
                // Generate new values on every retry
                const slug = generateSlug(name);
                const joinCode = generateJoinCode();

                [channel] = await Channel.create(
                    [
                        {
                            name,
                            description: description || "",
                            visibility: ChannelType,
                            logo: logoData,
                            slug,
                            joinCode,
                            owner: req.user.userId,
                            memberCount: 1,
                        },
                    ],
                    { session }
                );

                await ChannelMember.create(
                    [
                        {
                            channel: channel._id,
                            user: req.user.userId,
                            status: "active",
                        },
                    ],
                    { session }
                );
            });

            return res.status(201).json(
                new ApiResponse(
                    201,
                    { channel },
                    "Channel created successfully"
                )
            );

        } catch (error) {

            // Duplicate slug or joinCode - retry transaction
            if (error.code === 11000 && attempt < MAX_RETRIES) {
                continue;
            }

            // Clean up uploaded logo from Cloudinary if session fails completely
            if (logoData.publicId) {
                await deleteFromCloudinary(logoData.publicId);
            }

            // Max retries exhausted
            if (error.code === 11000) {
                return next(
                    new ApiError(
                        500,
                        "Unable to generate a unique channel identifier. Please try again."
                    )
                );
            }

            // Any other error
            return next(
                new ApiError(
                    500,
                    "Failed to create channel. Please try again."
                )
            );
        } finally {
            await session.endSession();
        }
    }
};