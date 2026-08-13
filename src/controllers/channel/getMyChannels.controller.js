import mongoose from "mongoose";
import ChannelMember from "../../models/broadcastChannel/channelMember.model.js";

export const getMyChannels = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const limit = Math.min(Number(req.query.limit) || 20, 50);
        const page = Math.max(Number(req.query.page) || 1, 1);
        const skip = (page - 1) * limit;

        const channels = await ChannelMember.aggregate([
            // 1. Find active memberships for the user
            {
                $match: {
                    user: new mongoose.Types.ObjectId(userId),
                    status: "active"
                }
            },
            // 2. Join with the channels collection
            {
                $lookup: {
                    from: "channels", // Make sure this matches your MongoDB collection name
                    localField: "channel",
                    foreignField: "_id",
                    as: "channelDetails"
                }
            },
            // 3. Flatten the array from the lookup
            { $unwind: "$channelDetails" },
            // 4. Apply strict ChannelType and status filters directly in the DB
            {
                $match: {
                    "channelDetails.channelType": "public",
                    "channelDetails.isActive": true
                }
            },
            // 5. Sort by membership creation date
            { $sort: { createdAt: -1 } },
            // 6. Paginate properly
            { $skip: skip },
            { $limit: limit },
            // 7. Shape the output to return clean channel objects with selected fields
            {
                $project: {
                    _id: "$channelDetails._id",
                    name: "$channelDetails.name",
                    slug: "$channelDetails.slug",
                    description: "$channelDetails.description",
                    logo: "$channelDetails.logo",
                    channelType: "$channelDetails.channelType",
                    owner: "$channelDetails.owner",
                    memberCount: "$channelDetails.memberCount",
                    createdAt: "$channelDetails.createdAt"
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            count: channels.length,
            data: channels,
        });
    } catch (error) {
        next(error);
    }
};
