import mongoose from "mongoose";
import ChannelMember from "../../models/broadcastChannel/channelMember.model.js";

export const getMyChannels = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        const limit = Math.min(
            Number(req.query.limit) || 20,
            50
        );

        const page = Math.max(
            Number(req.query.page) || 1,
            1
        );

        const skip = (page - 1) * limit;

        const [result] = await ChannelMember.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(userId),
                    status: "active"
                }
            },

            {
                $lookup: {
                    from: "channels",
                    localField: "channel",
                    foreignField: "_id",
                    as: "channelDetails"
                }
            },

            {
                $unwind: "$channelDetails"
            },

            {
                $match: {
                    "channelDetails.channelType": "public",
                    "channelDetails.isActive": true
                }
            },

            {
                $sort: {
                    createdAt: -1
                }
            },

            {
                $facet: {
                    data: [
                        { $skip: skip },
                        { $limit: limit },

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
                    ],

                    total: [
                        {
                            $count: "count"
                        }
                    ]
                }
            }
        ]);

        const total = result.total[0]?.count || 0;

        return res.status(200).json({
            success: true,
            count: total,
            data: result.data
        });

    } catch (error) {
        next(error);
    }
};