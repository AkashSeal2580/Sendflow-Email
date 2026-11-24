
import nodemailer from "nodemailer";
import crypto from "crypto";
import { prisma } from "../../config/database";

interface CreateSenderInput {
  name: string;
  email: string;
  host: string;
  port: number;
  username: string;
  password: string;
}

function getEncryptionKey(): Buffer {
  const secret = process.env.SMTP_ENCRYPTION_KEY;

  if (!secret) {
    throw new Error("SMTP_ENCRYPTION_KEY is missing in .env");
  }

  const key = Buffer.from(secret, "hex");

  if (key.length !== 32) {
    throw new Error("SMTP_ENCRYPTION_KEY must be a valid 32-byte hex key");
  }

  return key;
}

function encryptPassword(password: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const encrypted = Buffer.concat([
    cipher.update(password, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return [
    iv.toString("hex"),
    authTag.toString("hex"),
    encrypted.toString("hex"),
  ].join(":");
}

export function decryptPassword(encryptedPassword: string): string {
  const key = getEncryptionKey();

  const [ivHex, authTagHex, encryptedHex] =
    encryptedPassword.split(":");

  if (!ivHex || !authTagHex || !encryptedHex) {
    throw new Error("Invalid encrypted password format");
  }

  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");

  if (iv.length !== 12 || authTag.length !== 16 || encrypted.length === 0) {
    throw new Error("Invalid encrypted password data");
  }

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);

  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

export async function createSender(
  userId: string,
  input: CreateSenderInput
) {
  const { name, email, host, port, username, password } = input;

  if (!name?.trim() || !email?.trim() || !host?.trim() ||
      !username?.trim() || !password || !port) {
    throw new Error("All sender fields are required");
  }

  if (
    !Number.isInteger(Number(port)) ||
    Number(port) < 1 ||
    Number(port) > 65535
  ) {
    throw new Error("Invalid SMTP port");
  }

  const transporter = nodemailer.createTransport({
    host: host.trim(),
    port: Number(port),
    secure: Number(port) === 465,
    auth: {
      user: username.trim(),
      pass: password,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  await transporter.verify();

  const encryptedPassword = encryptPassword(password);

  return prisma.sender.create({
    data: {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      host: host.trim(),
      port: Number(port),
      username: username.trim(),
      password: encryptedPassword,
      status: "Connected",
      userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      host: true,
      port: true,
      username: true,
      status: true,
      dailyLimit: true,
      createdAt: true,
    },
  });
}

export async function getSenders(userId: string) {
  return prisma.sender.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      email: true,
      host: true,
      port: true,
      username: true,
      status: true,
      dailyLimit: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function deleteSender(userId: string, senderId: string) {
  const result = await prisma.sender.deleteMany({
    where: {
      id: senderId,
      userId,
    },
  });

  if (result.count === 0) {
    throw new Error("Sender not found");
  }

  return { message: "Sender deleted successfully" };
}
