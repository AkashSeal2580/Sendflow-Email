
import dotenv from "dotenv";
import { connectDatabase, prisma } from "./config/database";
import { sendScheduledCampaignEmails } from "./modules/email/email.services";

dotenv.config();

const CHECK_INTERVAL = 30 * 1000;

let isChecking = false;

async function processScheduledCampaigns() {
  if (isChecking) return;

  isChecking = true;

  try {
    const now = new Date();

    const campaigns = await prisma.campaign.findMany({
      where: {
        status: "Scheduled",
        scheduledAt: {
          lte: now,
        },
        senderId: {
          not: null,
        },
      },
      orderBy: {
        scheduledAt: "asc",
      },
    });

    for (const campaign of campaigns) {
      if (!campaign.senderId) continue;

      // Atomically claim campaign to avoid duplicate workers
      const claimed = await prisma.campaign.updateMany({
        where: {
          id: campaign.id,
          status: "Scheduled",
          scheduledAt: {
            lte: new Date(),
          },
        },
        data: {
          status: "Sending",
        },
      });

      if (claimed.count === 0) continue;

      console.log(`Starting campaign: ${campaign.name}`);

      try {
        const result = await sendScheduledCampaignEmails(
          campaign.userId,
          campaign.id,
          campaign.senderId
        );

        const remainingRecipients = await prisma.email.count({
          where: {
            campaignId: campaign.id,
            status: "Scheduled",
          },
        });

        await prisma.campaign.update({
          where: {
            id: campaign.id,
          },
          data: {
            status: remainingRecipients > 0 ? "Scheduled" : "Completed",
          },
        });

        console.log(
          `Campaign: ${campaign.name} | Sent: ${result.sent} | Failed: ${result.failed} | Remaining: ${remainingRecipients}`
        );
      } catch (error) {
        console.error(
          `Campaign failed: ${campaign.name}`,
          error
        );

        // Restore campaign so it can be retried
        await prisma.campaign.update({
          where: {
            id: campaign.id,
          },
          data: {
            status: "Scheduled",
          },
        });
      }
    }
  } catch (error) {
    console.error("Scheduler error:", error);
  } finally {
    isChecking = false;
  }
}

async function startWorker() {
  try {
    await connectDatabase();

    console.log("🚀 SendFlow Email Worker started successfully");
    console.log("📧 Checking scheduled campaigns every 30 seconds...");

    // Check immediately when worker starts
    await processScheduledCampaigns();

    // Continue checking every 30 seconds
    setInterval(() => {
      void processScheduledCampaigns();
    }, CHECK_INTERVAL);
  } catch (error) {
    console.error("Worker startup failed:", error);
    process.exit(1);
  }
}

startWorker();
