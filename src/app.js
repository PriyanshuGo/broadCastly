import express from "express";
import helmet from "helmet";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user/user.routes.js";
import sessionRoutes from "./routes/session/session.routes.js";
import channelRoutes from "./routes/channel/channel.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();


app.use(cors({
  origin: "*",
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
app.use("/devices", sessionRoutes);
app.use("/channel", channelRoutes);

// Health check
app.get("/health", (req, res) => {
  res.send("API is running");
});

// Error handling middleware
app.use(errorHandler);

export default app;
