
import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";

import {
  sendCampaign,
  sendSingle,
  getEmailHistory,
  getEmailStats,
} from "./email.controller";

const router = Router();

// Authentication required
router.use(authenticate);

// Send campaign emails (bulk)
router.post("/send", sendCampaign);

// Send single email (direct)
router.post("/send-single", sendSingle);

// Get email history
router.get("/history", getEmailHistory);

// Get dashboard analytics
router.get("/stats", getEmailStats);

export default router;
