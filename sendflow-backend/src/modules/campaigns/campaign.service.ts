
import { prisma } from "../../config/database";

interface CreateCampaignInput {
  name: string;
  subject: string;
  content: string;
  scheduledAt?: string | null;
  senderId?: string | null;
}

export async function createCampaign(
  userId: string,
  input: CreateCampaignInput
) {
  const { name, subject, content, scheduledAt, senderId } = input;

  if (!name?.trim() || !subject?.trim() || !content?.trim()) {
    throw new Error("Campaign name, subject and content are required");
  }

  let scheduleDate: Date | null = null;

  if (scheduledAt) {
    scheduleDate = new Date(scheduledAt);

    if (Number.isNaN(scheduleDate.getTime())) {
      throw new Error("Invalid scheduled date");
    }

    if (scheduleDate.getTime() <= Date.now()) {
      throw new Error("Scheduled date must be in the future");
    }

    if (!senderId) {
      throw new Error("Please select a sender for scheduled campaigns");
    }
  }

  if (senderId) {
    const sender = await prisma.sender.findFirst({
      where: {
        id: senderId,
        userId,
        status: "Connected",
      },
    });

    if (!sender) {
      throw new Error("Selected sender is not connected or does not exist");
    }
  }

  return prisma.campaign.create({
    data: {
      name: name.trim(),
      subject: subject.trim(),
      content: content.trim(),
      scheduledAt: scheduleDate,
      status: scheduleDate ? "Scheduled" : "Draft",
      userId,
      senderId: senderId || null,
    },
    select: {
      id: true,
      name: true,
      subject: true,
      content: true,
      status: true,
      scheduledAt: true,
      senderId: true,
      createdAt: true,
    },
  });
}

export async function getCampaigns(userId: string) {
  return prisma.campaign.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      subject: true,
      content: true,
      status: true,
      scheduledAt: true,
      senderId: true,
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

interface UpdateCampaignInput {
  name: string;
  subject: string;
  content: string;
}

export async function updateCampaign(
  userId: string,
  campaignId: string,
  input: UpdateCampaignInput
) {
  const { name, subject, content } = input;

  if (!name?.trim() || !subject?.trim() || !content?.trim()) {
    throw new Error("Campaign name, subject and content are required");
  }

  const campaign = await prisma.campaign.findFirst({
    where: {
      id: campaignId,
      userId,
      status: "Draft",
    },
  });

  if (!campaign) {
    throw new Error("Draft campaign not found or cannot be edited");
  }

  return prisma.campaign.update({
    where: { id: campaignId },
    data: {
      name: name.trim(),
      subject: subject.trim(),
      content: content.trim(),
    },
  });
}

export async function deleteCampaign(
  userId: string,
  campaignId: string
) {
  const campaign = await prisma.campaign.findFirst({
    where: {
      id: campaignId,
      userId,
      status: "Draft",
    },
  });

  if (!campaign) {
    throw new Error("Draft campaign not found or cannot be deleted");
  }

  await prisma.$transaction([
    prisma.email.deleteMany({
      where: { campaignId },
    }),
    prisma.campaign.delete({
      where: { id: campaignId },
    }),
  ]);

  return { message: "Campaign deleted successfully" };
}

export async function scheduleCampaign(
  userId: string,
  campaignId: string,
  scheduledAt: string,
  senderId: string
) {
  if (!scheduledAt || !senderId) {
    throw new Error("Schedule date and sender are required");
  }

  const scheduleDate = new Date(scheduledAt);

  if (
    Number.isNaN(scheduleDate.getTime()) ||
    scheduleDate.getTime() <= Date.now()
  ) {
    throw new Error("Please select a valid future date and time");
  }

  const campaign = await prisma.campaign.findFirst({
    where: {
      id: campaignId,
      userId,
      status: "Draft",
    },
  });

  if (!campaign) {
    throw new Error("Draft campaign not found or cannot be scheduled");
  }

  const sender = await prisma.sender.findFirst({
    where: {
      id: senderId,
      userId,
      status: "Connected",
    },
  });

  if (!sender) {
    throw new Error("Selected sender is not connected or does not exist");
  }

  const recipientCount = await prisma.email.count({
    where: {
      campaignId,
      status: "Draft",
    },
  });

  if (recipientCount === 0) {
    throw new Error("Please upload recipients before scheduling");
  }

  return prisma.$transaction(async (tx) => {
    await tx.email.updateMany({
      where: {
        campaignId,
        status: "Draft",
      },
      data: {
        status: "Scheduled",
        scheduledAt: scheduleDate,
        senderId,
      },
    });

    return tx.campaign.update({
      where: { id: campaignId },
      data: {
        status: "Scheduled",
        scheduledAt: scheduleDate,
        senderId,
      },
    });
  });
}
