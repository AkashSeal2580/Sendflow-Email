
import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";

import {
  createCampaign,
  getCampaigns,
  updateCampaign,
  deleteCampaign,
  scheduleCampaign,
} from "./campaign.service";

// Create Campaign
export async function addCampaign(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { name, subject, content, scheduledAt, senderId } = req.body;

    const campaign = await createCampaign(req.userId, {
      name,
      subject,
      content,
      scheduledAt,
      senderId,
    });

    return res.status(201).json({
      success: true,
      message: "Campaign created successfully",
      data: campaign,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create campaign";

    return res.status(400).json({
      success: false,
      message,
    });
  }
}

// Get All Campaigns
export async function listCampaigns(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const campaigns = await getCampaigns(req.userId);

    return res.status(200).json({
      success: true,
      data: campaigns,
    });
  } catch (error) {
    console.error("Fetch campaigns error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch campaigns",
    });
  }
}

// Edit Draft Campaign
export async function editCampaign(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const campaign = await updateCampaign(
      req.userId,
      String(req.params.id),
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Campaign updated successfully",
      data: campaign,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update campaign";

    return res.status(400).json({
      success: false,
      message,
    });
  }
}

// Delete Draft Campaign
export async function removeCampaign(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const result = await deleteCampaign(
      req.userId,
      String(req.params.id)
    );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete campaign";

    return res.status(400).json({
      success: false,
      message,
    });
  }
}

// Schedule Draft Campaign
export async function scheduleDraftCampaign(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { scheduledAt, senderId } = req.body;

    const campaign = await scheduleCampaign(
      req.userId,
      String(req.params.id),
      scheduledAt,
      senderId
    );

    return res.status(200).json({
      success: true,
      message: "Campaign scheduled successfully",
      data: campaign,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to schedule campaign";

    return res.status(400).json({
      success: false,
      message,
    });
  }
}
