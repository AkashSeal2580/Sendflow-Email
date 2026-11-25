
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

  const backendUrl = process.env.BACKEND_URL?.replace(/\/$/, "");

  if (!backendUrl) {
    throw new Error("BACKEND_URL is not configured");
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

  try {
    for (const recipient of recipients) {
      try {
        const trackingUrl =
          `${backendUrl}/api/tracking/open/` +
          encodeURIComponent(recipient.trackingToken);

        // Escape campaign content before inserting into HTML
        const safeContent = campaign.content
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");

        const htmlContent = `
          <div style="white-space: pre-wrap;">
            ${safeContent}
          </div>

          <img
            src="${trackingUrl}"
            width="1"
            height="1"
            alt=""
            style="width:1px;height:1px;border:0;"
          />
        `;

        await transporter.sendMail({
          from: `"${sender.name}" <${sender.email}>`,
          to: recipient.recipient,
          subject: campaign.subject,
          text: campaign.content,
          html: htmlContent,
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

  return {
    total: recipients.length,
    sent,
    failed,
  };
}
