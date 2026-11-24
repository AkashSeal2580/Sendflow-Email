import type { EmailRecord } from "../types";
import StatusBadge from "./StatusBadge";
export default function EmailTable({ rows }: { rows: EmailRecord[] }) {
  return <div className="overflow-x-auto"><table><thead><tr><th>Recipient</th><th>Subject</th><th>Time</th><th>Status</th></tr></thead><tbody>
    {rows.map(row => <tr key={row.id}><td><div className="text-sm font-medium">{row.recipient}</div><div className="muted text-xs mt-1">{row.id}</div></td><td className="text-sm">{row.subject}</td><td className="muted text-sm">{row.time}</td><td><StatusBadge status={row.status} /></td></tr>)}
  </tbody></table></div>;
}