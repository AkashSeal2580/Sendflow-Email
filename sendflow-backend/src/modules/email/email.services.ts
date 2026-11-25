
import nodemailer from "nodemailer";
import { prisma } from "../../config/database";
import { decryptPassword } from "../senders/sender.service";

async function processCampaignEmails(
  userId: string,
  campaignId: string,
  senderId: string,
  recipientStatus: "Draft" | "Scheduled"
) {
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, userId },
  });

  if (!campaign) {
    throw new Error("Campaign not found");
  }

  const sender = await prisma.sender.findFirst({
    where: {
      id: senderId,
      userId,
      status: "Connected",
    },
  });

  if (!sender) {
    throw new Error("Connected sender not found");
  }

  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const sentToday = await prisma.email.count({
    where: {
      senderId: sender.id,
      status: "Sent",
      sentAt: {
        gte: startOfDay,
      },
    },
  });

  const remainingLimit = Math.max(
    0,
    sender.dailyLimit - sentToday
  );

  const pendingBeforeSending = await prisma.email.count({
    where: {
      campaignId,
      status: recipientStatus,
    },
  });

  if (remainingLimit === 0 || pendingBeforeSending === 0) {
    return {
      total: 0,
      sent: 0,
      failed: 0,
      remaining: pendingBeforeSending,
      message:
        remainingLimit === 0
          ? "Daily sending limit reached. Remaining emails will continue later."
          : "No recipients available",
    };
  }

  const recipients = await prisma.email.findMany({
    where: {
      campaignId,
      status: recipientStatus,
    },
    orderBy: {
      createdAt: "asc",
    },
    take: remainingLimit,
  });

  const transporter = nodemailer.createTransport({
    host: sender.host,
    port: sender.port,
    secure: sender.port === 465,
    auth: {
      user: sender.username,
      pass: decryptPassword(sender.password),
    },
  });

  let sent = 0;
  let failed = 0;

  try {
    for (const recipient of recipients) {
      const claimed = await prisma.email.updateMany({
        where: {
          id: recipient.id,
          status: recipientStatus,
        },
        data: {
          status: "Sending",
          senderId: sender.id,
        },
      });

      if (claimed.count === 0) {
        continue;
      }

      try {
        await transporter.sendMail({
          from: `"${sender.name}" <${sender.email}>`,
          to: recipient.recipient,
          subject: campaign.subject,
          text: campaign.content,
        });

        await prisma.email.update({
          where: {
            id: recipient.id,
          },
          data: {
            status: "Sent",
            sentAt: new Date(),
            senderId: sender.id,
            error: null,
          },
        });

        sent++;
      } catch (error) {
        await prisma.email.update({
          where: {
            id: recipient.id,
          },
          data: {
            status: "Failed",
            senderId: sender.id,
            error:
              error instanceof Error
                ? error.message
                : "Email sending failed",
          },
        });

        failed++;
      }
    }
  } finally {
    transporter.close();
  }

  const remaining = await prisma.email.count({
    where: {
      campaignId,
      status: recipientStatus,
    },
  });

  return {
    total: sent + failed,
    sent,
    failed,
    remaining,
  };
}

// Manual sending
export async function sendCampaignEmails(
  userId: string,
  campaignId: string,
  senderId: string
) {
  return processCampaignEmails(
    userId,
    campaignId,
    senderId,
    "Draft"
  );
}

// Automatic scheduled sending
export async function sendScheduledCampaignEmails(
  userId: string,
  campaignId: string,
  senderId: string
) {
  return processCampaignEmails(
    userId,
    campaignId,
    senderId,
    "Scheduled"
  );
}

// Send a single email without creating a campaign
export async function sendSingleEmail(
  userId: string,
  senderId: string,
  recipient: string,
  subject: string,
  content: string
) {
  const sender = await prisma.sender.findFirst({
    where: {
      id: senderId,
      userId,
      status: "Connected",
    },
  });

  if (!sender) {
    throw new Error("Connected sender not found");
  }

  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const sentToday = await prisma.email.count({
    where: {
      senderId: sender.id,
      status: "Sent",
      sentAt: { gte: startOfDay },
    },
  });

  if (sentToday >= sender.dailyLimit) {
    throw new Error("Daily sending limit reached");
  }

  const email = await prisma.email.create({
    data: {
      recipient,
      subject,
      status: "Sending",
      senderId: sender.id,
    },
  });

  const transporter = nodemailer.createTransport({
    host: sender.host,
    port: sender.port,
    secure: sender.port === 465,
    auth: {
      user: sender.username,
      pass: decryptPassword(sender.password),
    },
  });

  try {
    await transporter.sendMail({
      from: `"${sender.name}" <${sender.email}>`,
      to: recipient,
      subject,
      text: content,
    });

    return await prisma.email.update({
      where: { id: email.id },
      data: {
        status: "Sent",
        sentAt: new Date(),
        error: null,
      },
    });
  } catch (error) {
    await prisma.email.update({
      where: { id: email.id },
      data: {
        status: "Failed",
        error:
          error instanceof Error
            ? error.message
            : "Email sending failed",
      },
    });

    throw error;
  } finally {
    transporter.close();
  }
}
