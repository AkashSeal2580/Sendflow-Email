
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./modules/auth/auth.routes";
import senderRoutes from "./modules/senders/sender.routes";
import campaignRoutes from "./modules/campaigns/campaign.routes";
import uploadRoutes from "./modules/uploads/upload.routes";
import emailRoutes from "./modules/email/email.routes";
import trackingRoutes from "./modules/email/tracking.routes";

import {
  authenticate,
  AuthRequest,
} from "./middleware/auth.middleware";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://sendflow-email.vercel.app",
];

app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Health check
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "SendFlow API is running",
    timestamp: new Date().toISOString(),
  });
});

// Authentication test
app.get("/api/auth/me", authenticate, (req, res) => {
  const authReq = req as AuthRequest;

  return res.status(200).json({
    success: true,
    message: "Authentication successful",
    userId: authReq.userId,
  });
});

// Application routes
app.use("/api/auth", authRoutes);
app.use("/api/senders", senderRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/emails", emailRoutes);

// Public tracking routes
app.use("/api/tracking", trackingRoutes);

export default app;
