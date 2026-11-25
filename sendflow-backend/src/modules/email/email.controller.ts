
import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { prisma } from "../../config/database";
import { Prisma } from "@prisma/client";

import {
  sendCampaignEmails,
  sendSingleEmail,
} from "./email.services";

// =====================================
// SEND CAMPAIGN EMAILS
// =====================================

export async function sendCampaign(
  req: AuthRequest,
  res: Response
) {
  try {
    const userId = req.userId;
    const { campaignId, senderId } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!campaignId || !senderId) {
      return res.status(400).json({
        success: false,
        message: "Campaign ID and Sender ID are required",
      });
    }

    const result = await sendCampaignEmails(
      userId,
      campaignId,
      senderId
    );

    return res.status(200).json({
      success: true,
      message: "Email sending process completed",
      data: result,
    });
  } catch (error) {
    console.error("Campaign sending error:", error);

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to send campaign emails",
    });
  }
}

// =====================================
// SEND SINGLE EMAIL
// =====================================

export async function sendSingle(
  req: AuthRequest,
  res: Response
) {
  try {
    const userId = req.userId;
    const { senderId, recipient, subject, content } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (
      !senderId ||
      typeof recipient !== "string" ||
      typeof subject !== "string" ||
      typeof content !== "string" ||
      !recipient.trim() ||
      !subject.trim() ||
      !content.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Sender, recipient, subject and message are required",
      });
    }

    const normalizedRecipient = recipient.trim();

    // Validate email address
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedRecipient)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid recipient email",
      });
    }

    const result = await sendSingleEmail(
      userId,
      senderId,
      normalizedRecipient,
      subject.trim(),
      content.trim()
    );

    return res.status(200).json({
      success: true,
      message: "Email sent successfully",
      data: result,
    });
  } catch (error) {
    console.error("Single email sending error:", error);

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to send email",
    });
  }
}

// =====================================
// GET EMAIL HISTORY
// =====================================

export async function getEmailHistory(
  req: AuthRequest,
  res: Response
) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const emails = await prisma.email.findMany({
      where: {
        OR: [
          {
            campaign: {
              is: { userId },
            },
          },
          {
            sender: {
              is: { userId },
            },
          },
        ],
      },
      select: {
        id: true,
        recipient: true,
        subject: true,
        status: true,
        sentAt: true,
        error: true,
        createdAt: true,
        campaign: {
          select: {
            id: true,
            name: true,
          },
        },
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: emails,
    });
  } catch (error) {
    console.error("Email history error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch email history",
    });
  }
}

// =====================================
// GET EMAIL STATISTICS
// =====================================

export async function getEmailStats(
  req: AuthRequest,
  res: Response
) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const emailFilter: Prisma.EmailWhereInput = {
      OR: [
        {
          campaign: {
            is: { userId },
          },
        },
        {
          sender: {
            is: { userId },
          },
        },
      ],
    };

    const [
      totalEmails,
      sentEmails,
      scheduledEmails,
      failedEmails,
    ] = await Promise.all([
      prisma.email.count({
        where: emailFilter,
      }),

      prisma.email.count({
        where: {
          AND: [
            emailFilter,
            { status: "Sent" },
          ],
        },
      }),

      prisma.email.count({
        where: {
          AND: [
            emailFilter,
            { status: "Scheduled" },
          ],
        },
      }),

      prisma.email.count({
        where: {
          AND: [
            emailFilter,
            { status: "Failed" },
          ],
        },
      }),
    ]);

    const deliveryRate =
      sentEmails + failedEmails > 0
        ? Number(
            (
              (sentEmails / (sentEmails + failedEmails)) *
              100
            ).toFixed(1)
          )
        : 0;

    const startDate = new Date();

    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - 6);

    // Keep ownership filter AND date filter together
    const recentEmails = await prisma.email.findMany({
      where: {
        AND: [
          emailFilter,
          {
            OR: [
              {
                createdAt: {
                  gte: startDate,
                },
              },
              {
                sentAt: {
                  gte: startDate,
                },
              },
            ],
          },
        ],
      },
      select: {
        status: true,
        createdAt: true,
        sentAt: true,
      },
    });

    const activity = Array.from(
      { length: 7 },
      (_, index) => {
        const date = new Date(startDate);

        date.setDate(startDate.getDate() + index);

        const dateKey = date.toDateString();

        const sent = recentEmails.filter(
          (email) =>
            email.status === "Sent" &&
            email.sentAt?.toDateString() === dateKey
        ).length;

        const scheduled = recentEmails.filter(
          (email) =>
            email.status === "Scheduled" &&
            email.createdAt.toDateString() === dateKey
        ).length;

        return {
          day: date.toLocaleDateString("en-US", {
            weekday: "short",
          }),
          sent,
          scheduled,
        };
      }
    );

    return res.status(200).json({
      success: true,
      data: {
        totalEmails,
        sentEmails,
        scheduledEmails,
        failedEmails,
        deliveryRate,
        activity,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard analytics",
    });
  }
}
