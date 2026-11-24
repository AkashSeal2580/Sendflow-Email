
import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";

import {
  createSender,
  getSenders,
  deleteSender,
} from "./sender.service";

export async function addSender(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const sender = await createSender(req.userId, req.body);

    return res.status(201).json({
      success: true,
      message: "SMTP sender connected successfully",
      data: sender,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to connect sender";

    return res.status(400).json({
      success: false,
      message,
    });
  }
}

export async function listSenders(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const senders = await getSenders(req.userId);

    return res.status(200).json({
      success: true,
      data: senders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch senders",
    });
  }
}

export async function removeSender(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const senderId = req.params.id;

if (typeof senderId !== "string") {
  return res.status(400).json({
    success: false,
    message: "Invalid sender ID",
  });
}

const result = await deleteSender(req.userId, senderId);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete sender";

    const status = message === "Sender not found" ? 404 : 400;

    return res.status(status).json({
      success: false,
      message,
    });
  }
}
