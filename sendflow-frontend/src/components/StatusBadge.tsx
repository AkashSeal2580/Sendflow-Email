import type { EmailStatus } from "../types";
export default function StatusBadge({ status }: { status: EmailStatus | "Connected" | "Disconnected" }) {
  const cls = status === "Sent" || status === "Connected" ? "bg-emerald-400/10 text-emerald-300" :
    status === "Failed" || status === "Disconnected" ? "bg-rose-400/10 text-rose-300" :
    status === "Processing" ? "bg-amber-400/10 text-amber-300" : "bg-violet-400/10 text-violet-300";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${cls}`}>{status}</span>;
}