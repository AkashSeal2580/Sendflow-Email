
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./modules/auth/auth.routes";
import senderRoutes from "./modules/senders/sender.routes";
import campaignRoutes from "./modules/campaigns/campaign.routes";
import uploadRoutes from "./modules/uploads/upload.routes";
import emailRoutes from "./modules/email/email.routes";

import {
  authenticate,
  AuthRequest,
} from "./middleware/auth.middleware";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
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

// Protected authentication test route
app.get("/api/auth/me", authenticate, (req, res) => {
  const authReq = req as AuthRequest;

  res.status(200).json({
    success: true,
    message: "Authentication successful",
    userId: authReq.userId,
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/senders", senderRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/uploads", uploadRoutes);

// Email sending routes
app.use("/api/emails", emailRoutes);

export default app;
