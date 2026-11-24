
import { Response } from "express";
import { parse } from "csv-parse/sync";
import { prisma } from "../../config/database";
import { AuthRequest } from "../../middleware/auth.middleware";

export async function uploadRecipients(req: AuthRequest, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a CSV file",
      });
    }

    const userId = req.userId;
    const { campaignId } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!campaignId) {
      return res.status(400).json({
        success: false,
        message: "Campaign ID is required",
      });
    }

    // Check campaign ownership
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        userId,
      },
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    // Read CSV
    const content = req.file.buffer.toString("utf-8");

    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as Record<string, string>[];

    // Validate emails
    const emails = records
      .map((row) => row.email || row.Email || row.EMAIL)
      .filter((email): email is string => Boolean(email))
      .map((email) => email.trim().toLowerCase())
      .filter((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));

    const uniqueEmails = [...new Set(emails)];

    if (uniqueEmails.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid email addresses found.",
      });
    }

    // Find existing recipients for this campaign
    const existingEmails = await prisma.email.findMany({
      where: {
        campaignId,
        recipient: { in: uniqueEmails },
      },
      select: {
        recipient: true,
      },
    });

    const existingSet = new Set(
      existingEmails.map((item) => item.recipient.toLowerCase())
    );

    const newEmails = uniqueEmails.filter(
      (email) => !existingSet.has(email)
    );

    // Save new recipients
    if (newEmails.length > 0) {
      await prisma.email.createMany({
        data: newEmails.map((email) => ({
          recipient: email,
          subject: campaign.subject,
          campaignId: campaign.id,
          scheduledAt: campaign.scheduledAt,
          status: campaign.status === "Scheduled" ? "Scheduled" : "Draft",
        })),
      });
    }

    return res.status(200).json({
      success: true,
      message: "Recipients uploaded successfully",
      data: {
        totalValidEmails: uniqueEmails.length,
        savedEmails: newEmails.length,
        duplicateEmails: uniqueEmails.length - newEmails.length,
      },
    });
  } catch (error) {
    console.error("CSV upload error:", error);

    return res.status(400).json({
      success: false,
      message: "Unable to process CSV file",
    });
  }
}
