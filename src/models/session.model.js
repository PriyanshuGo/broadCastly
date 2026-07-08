import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    refreshTokenHash: {
      type: String,
      required: true,
      index: true,
    },

    userAgent: {
      type: String,
      default: null,
    },

    ipAddress: {
      type: String,
      default: null,
    },

    isRevoked: {
      type: Boolean,
      default: false,
      index: true,
    },

    revokedAt: {
      type: Date,
      default: null,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

sessionSchema.index({ user: 1, isRevoked: 1 });

export default mongoose.model("Session", sessionSchema);
