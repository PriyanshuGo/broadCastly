import express from "express";
import helmet from "helmet";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import contentRoutes from "./routes/content.routes.js";
import approvalRoutes from "./routes/approval.routes.js";
import liveRoutes from "./routes/live.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();


app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://cb-sfrontend.vercel.app"
  ],
  credentials: true
}), helmet({
  frameguard: { action: "sameorigin" },
  noSniff: true,

  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https:"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      imgSrc: ["'self'", "https:", "data:"],
    },
  },
}));

app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/content", contentRoutes);
app.use("/approvals", approvalRoutes);
app.use("/live", liveRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("API is running");
});

// Error handling middleware
app.use(errorHandler);

export default app;
