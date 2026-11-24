export type EmailStatus = "Scheduled" | "Sent" | "Failed" | "Processing";
export type EmailRecord = { id: string; recipient: string; subject: string; time: string; status: EmailStatus };
export type Sender = { id: string; name: string; email: string; limit: number; sent: number; status: "Connected" | "Disconnected" };
