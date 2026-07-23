    import Session from "../../models/session.model.js";
    import { ApiResponse } from "../../utils/ApiResponse.js";
    import { ApiError } from "../../utils/ApiError.js";

    export const terminateOneSession = async (req, res, next) => {
        try {
            const { sessionId } = req.params;
            if (!sessionId) {
                return next(new ApiError(400, "Session ID is required"));
            }

            const session = await Session.findById(sessionId);

            if (!session) {
                return next(new ApiError(404, "The selected session could not be found."));
            }

            // Only session owner or admin (not implemented here) can revoke a session
            if (!session.user.equals(req.user.userId)) {
                return next(
                    new ApiError(
                        403,
                        "You are not allowed to terminate this session."
                    )
                );
            }

            if (session.isRevoked) {
                return res.status(200).json(new ApiResponse(200, {}, "Session is already terminated"));
            }

            await Session.findByIdAndUpdate(sessionId, {
                $set: {
                    isRevoked: true,
                    revokedAt: new Date(),
                },
            });

            return res.status(200).json(new ApiResponse(200, {}, "Session terminated successfully"));
        } catch (error) {
            return next(error);
        }
    }

