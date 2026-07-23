import { ApiError } from "../../utils/ApiError.js";
import { verifyAccessToken } from "../../utils/jwt.js";

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next(
        new ApiError(
          401,
          "Please sign in to continue."
        )
      );
    }

    if (!authHeader.startsWith("Bearer ")) {
      return next(
        new ApiError(
          401,
          "Your session is invalid. Please sign in again."
        )
      );
    }

    const accessToken = authHeader.split(" ")[1];

    if (!accessToken) {
      return next(
        new ApiError(
          401,
          "Please sign in to continue."
        )
      );
    }

    const decoded = verifyAccessToken(accessToken);

    req.user = decoded;

    next();
  } catch (error) {
    return next(error);
  }
};