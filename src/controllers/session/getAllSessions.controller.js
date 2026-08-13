import Session from "../../models/user/session.model.js";
import { ApiResponse } from "../../utils/common/ApiResponse.js";

export const getAllSessions = async (req, res, next) => {
    try {
        const sessions = await Session.find({
            user: req.user.userId,
        })
            .sort({ createdAt: -1 })
            .select(
                "_id device isRevoked revokedAt createdAt"
            ).lean();

        return res.status(200).json(
            new ApiResponse(
                200,
                sessions,
                "Sessions fetched successfully"
            )
        );
    } catch (error) {
        return next(error);
    }
}