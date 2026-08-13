import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    refreshTokenHash: {
      type: String,
      required: true,
    },

    device: {
      brand: {
        type: String,
        default: null,
        trim: true,
      },

      model: {
        type: String,
        default: null,
        trim: true,
      },

      osName: {
        type: String,
        default: null,
        trim: true,
      },

      osVersion: {
        type: String,
        default: null,
        trim: true,
      },

      type: {
        type: String,
        default: null,
      },
    },

    isRevoked: {
      type: Boolean,
      default: false,
    },

    revokedAt: {
      type: Date,
      default: null,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Index for fetching all sessions of a user
sessionSchema.index({ user: 1 });

// TTL index: automatically delete expired sessions
sessionSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

export default mongoose.model("Session", sessionSchema);
