
import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";

import {
  addCampaign,
  listCampaigns,
  editCampaign,
  removeCampaign,
  scheduleDraftCampaign,
} from "./campaign.controller";

const router = Router();

// Protect all campaign routes
router.use(authenticate);

// Create campaign
router.post("/", addCampaign);

// Get all campaigns
router.get("/", listCampaigns);

// Edit draft campaign
router.put("/:id", editCampaign);

// Delete draft campaign
router.delete("/:id", removeCampaign);

// Schedule draft campaign
router.patch("/:id/schedule", scheduleDraftCampaign);

export default router;
