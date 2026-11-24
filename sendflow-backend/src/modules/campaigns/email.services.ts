
import nodemailer from "nodemailer";
import { prisma } from "../../config/database";
import { decryptPassword } from "../senders/sender.service";

export async function sendCampaignEmails(
  userId: string,
  campaignId: string,
  senderId: string
) {
  const campaign = await prisma.campaign.findFirst({
    where: {
      id: campaignId,
      userId,
    },
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

  const recipients = await prisma.email.findMany({
    where: {
      campaignId,
      status: "Draft",
    },
    orderBy: {
      createdAt: "asc",
    },
    take: sender.dailyLimit,
  });

  if (recipients.length === 0) {
    throw new Error("No draft recipients available");
  }

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

  for (const recipient of recipients) {
    try {
      await transporter.sendMail({
        from: `"${sender.name}" <${sender.email}>`,
        to: recipient.recipient,
        subject: campaign.subject,
        text: campaign.content,
      });

      await prisma.email.update({
        where: { id: recipient.id },
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
        where: { id: recipient.id },
        data: {
          status: "Failed",
          senderId: sender.id,
          error: error instanceof Error ? error.message : "Email sending failed",
        },
      });

      failed++;
    }
  }

  await transporter.close();

  return {
    total: recipients.length,
    sent,
    failed,
  };
}
