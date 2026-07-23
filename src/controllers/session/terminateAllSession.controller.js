import Session from "../../models/session.model.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";

export const terminateAllSession = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const currentSessionId =
      req.params.sessionId ||
      req.body.sessionId ||
      req.query.sessionId;

    if (!currentSessionId) {
      return next(new ApiError(400, "Current session ID is required."));
    }

    const result = await Session.updateMany(
      {
        user: userId,
        isRevoked: false,
        _id: { $ne: currentSessionId },
      },
      {
        $set: {
          isRevoked: true,
          revokedAt: new Date(),
        },
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(200).json(
        new ApiResponse(
          200,
          { terminatedSessions: 0 },
          "No other active sessions found."
        )
      );
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        { terminatedSessions: result.modifiedCount },
        "Other sessions terminated successfully."
      )
    );
  } catch (error) {
    return next(error);
  }
};