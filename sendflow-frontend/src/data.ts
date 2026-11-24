import type { EmailRecord, Sender } from "./types";
export const scheduledEmails: EmailRecord[] = [
  { id: "EM-2048", recipient: "olivia.martin@example.com", subject: "November product update", time: "Today, 10:30 AM", status: "Scheduled" },
  { id: "EM-2049", recipient: "james.wilson@example.com", subject: "Welcome to the community", time: "Today, 10:32 AM", status: "Scheduled" },
  { id: "EM-2050", recipient: "sophia.lee@example.com", subject: "Your weekly digest", time: "Today, 10:34 AM", status: "Processing" },
  { id: "EM-2051", recipient: "noah.brown@example.com", subject: "Early access invitation", time: "Today, 10:36 AM", status: "Scheduled" },
  { id: "EM-2052", recipient: "ava.jones@example.com", subject: "Thanks for joining us", time: "Today, 10:38 AM", status: "Scheduled" }
];
export const sentEmails: EmailRecord[] = [
  { id: "EM-2038", recipient: "mia.garcia@example.com", subject: "Your order confirmation", time: "Today, 9:42 AM", status: "Sent" },
  { id: "EM-2039", recipient: "ethan.davis@example.com", subject: "October newsletter", time: "Today, 9:38 AM", status: "Sent" },
  { id: "EM-2040", recipient: "isabella.clark@example.com", subject: "Account verification", time: "Today, 9:31 AM", status: "Failed" },
  { id: "EM-2041", recipient: "lucas.moore@example.com", subject: "Product launch invite", time: "Today, 9:25 AM", status: "Sent" }
];
export const senders: Sender[] = [
  { id: "1", name: "Primary sender", email: "hello@sendflow.demo", limit: 100, sent: 64, status: "Connected" },
  { id: "2", name: "Updates", email: "updates@sendflow.demo", limit: 80, sent: 22, status: "Connected" },
  { id: "3", name: "Outreach", email: "team@sendflow.demo", limit: 50, sent: 0, status: "Disconnected" }
];
