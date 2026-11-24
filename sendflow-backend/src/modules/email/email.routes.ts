
import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import {
  sendCampaign,
  getEmailHistory,
  getEmailStats,
} from "./email.controller";

const router = Router();

// Authentication required
router.use(authenticate);

// Send campaign emails
router.post("/send", sendCampaign);

// Get email history
router.get("/history", getEmailHistory);

// Get dashboard analytics
router.get("/stats", getEmailStats);

export default router;
