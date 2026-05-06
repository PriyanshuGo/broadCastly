const express = require("express");
const helmet = require("helmet");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const uploadRoutes = require("./routes/upload.routes");
const userRoutes = require("./routes/user.routes");
const { errorHandler } = require("./middlewares/error.middleware");

const app = express();

app.use(cors({
  origin: [
    "http://localhost:3000",
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
app.use(authRoutes);
app.use(uploadRoutes);
app.use("/user",userRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("API is running");
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;
