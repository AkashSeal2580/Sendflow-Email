
import { useEffect, useState } from "react";
import {
  Search,
  CalendarClock,
  Loader2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  X,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

interface Campaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  status: string;
  scheduledAt: string | null;
  createdAt: string;
}

interface EmailRecord {
  id: string;
  recipient: string;
  subject: string;
  status: string;
  sentAt: string | null;
  error: string | null;
  createdAt: string;
  campaign: {
    id: string;
    name: string;
  } | null;
}

// ===============================
// SCHEDULED EMAILS
// ===============================

export function ScheduledEmails() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchCampaigns() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("sendflow_token");

      if (!token) {
        throw new Error("Please login again.");
      }

      const response = await fetch(`${API_URL}/api/campaigns`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch campaigns");
      }

      setCampaigns(result.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const scheduledCampaigns = campaigns.filter(
    (campaign) => campaign.status === "Scheduled"
  );

  const filtered = scheduledCampaigns.filter((campaign) =>
    `${campaign.name} ${campaign.subject} ${campaign.status}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          Scheduled campaigns
        </h1>
        <p className="muted text-sm mt-2">
          Review campaigns marked for future delivery.
        </p>
      </div>

      <section className="panel">
        <div className="p-4">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3 top-3 muted" />
            <input
              className="field pl-9"
              placeholder="Search by campaign name or subject..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {loading && (
          <div className="p-10 text-center muted">
            <Loader2 className="animate-spin mx-auto mb-2" />
            Loading campaigns...
          </div>
        )}

        {error && (
          <div className="p-8 text-center text-red-400">
            {error}
            <button onClick={fetchCampaigns} className="underline ml-2">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="divide-y divide-white/10">
            {filtered.map((campaign) => (
              <div key={campaign.id} className="p-5">
                <div className="flex justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{campaign.name}</h3>
                    <p className="muted text-sm mt-1">
                      {campaign.subject}
                    </p>
                  </div>
                  <span className="text-xs text-violet-300">
                    {campaign.status}
                  </span>
                </div>

                <p className="muted text-xs mt-3">
                  <CalendarClock size={13} className="inline mr-1" />
                  {campaign.scheduledAt
                    ? new Date(campaign.scheduledAt).toLocaleString()
                    : "No delivery date"}
                </p>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="p-12 text-center muted text-sm">
            No scheduled campaigns found.
          </div>
        )}
      </section>
    </div>
  );
}

// ===============================
// SENT EMAILS & EMAIL TRACKING
// ===============================

export function SentEmails() {
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedEmail, setSelectedEmail] =
    useState<EmailRecord | null>(null);

  async function fetchEmails() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("sendflow_token");

      if (!token) {
        throw new Error("Please login again.");
      }

      const response = await fetch(`${API_URL}/api/emails/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to fetch email history"
        );
      }

      setEmails(result.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEmails();
  }, []);

  const sentCount = emails.filter(
    (email) => email.status === "Sent"
  ).length;

  const failedCount = emails.filter(
    (email) => email.status === "Failed"
  ).length;

  const pendingCount = emails.filter(
    (email) => !["Sent", "Failed"].includes(email.status)
  ).length;

  const filteredEmails = emails.filter((email) => {
    const matchesSearch =
      `${email.recipient} ${email.subject} ${email.status} ${
        email.campaign?.name || ""
      }`
        .toLowerCase()
        .includes(query.toLowerCase());

    const matchesFilter =
      filter === "All" ||
      (filter === "Pending"
        ? !["Sent", "Failed"].includes(email.status)
        : email.status === filter);

    return matchesSearch && matchesFilter;
  });

  function statusIcon(status: string) {
    if (status === "Sent") {
      return <CheckCircle2 size={15} className="text-green-400" />;
    }

    if (status === "Failed") {
      return <XCircle size={15} className="text-red-400" />;
    }

    return <Clock size={15} className="text-yellow-400" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Email History</h1>
          <p className="muted text-sm mt-2">
            Track your sent, failed and pending emails.
          </p>
        </div>

        <button
          onClick={fetchEmails}
          disabled={loading}
          className="btn-secondary flex items-center gap-2 px-4 py-2"
        >
          <RefreshCw
            size={15}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="panel p-5">
          <p className="muted text-sm">Total emails</p>
          <h2 className="text-2xl font-semibold mt-2">
            {emails.length}
          </h2>
        </div>

        <div className="panel p-5">
          <p className="muted text-sm">Successfully sent</p>
          <h2 className="text-2xl font-semibold text-green-400 mt-2">
            {sentCount}
          </h2>
        </div>

        <div className="panel p-5">
          <p className="muted text-sm">Failed emails</p>
          <h2 className="text-2xl font-semibold text-red-400 mt-2">
            {failedCount}
          </h2>
        </div>
      </div>

      <div className="panel p-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          {["All", "Sent", "Failed", "Pending"].map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`px-4 py-2 rounded-lg text-sm transition ${
                filter === item
                  ? "bg-blue-600 text-white"
                  : "bg-white/5 text-slate-400 hover:bg-white/10"
              }`}
            >
              {item}
              {item === "Pending" && ` (${pendingCount})`}
              {item === "Sent" && ` (${sentCount})`}
              {item === "Failed" && ` (${failedCount})`}
            </button>
          ))}
        </div>

        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-3 muted" />
          <input
            className="field pl-9"
            placeholder="Search recipient, subject or campaign..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <section className="panel">
        {loading && (
          <div className="p-10 text-center muted">
            <Loader2 className="animate-spin mx-auto mb-2" />
            Loading email history...
          </div>
        )}

        {error && (
          <div className="p-8 text-center text-red-400">
            {error}
            <button onClick={fetchEmails} className="underline ml-2">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && filteredEmails.length > 0 && (
          <div className="divide-y divide-white/10">
            {filteredEmails.map((email) => (
              <div key={email.id} className="p-5">
                <div className="flex flex-wrap justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold break-all">
                      {email.recipient}
                    </h3>
                    <p className="muted text-sm mt-1">
                      {email.subject}
                    </p>
                    <p className="muted text-xs mt-2">
                      Campaign: {email.campaign?.name || "Unknown"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      {statusIcon(email.status)}
                      <span>{email.status}</span>
                    </div>

                    <button
                      onClick={() => setSelectedEmail(email)}
                      className="btn-secondary flex items-center gap-2 px-3 py-2 text-sm"
                    >
                      <Eye size={15} />
                      Details
                    </button>
                  </div>
                </div>

                <div className="muted text-xs mt-3">
                  {email.sentAt
                    ? `Sent: ${new Date(email.sentAt).toLocaleString()}`
                    : `Created: ${new Date(email.createdAt).toLocaleString()}`}
                </div>

                {email.status === "Failed" && (
                  <div className="mt-3 rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                    <p className="text-red-400 text-xs font-medium">
                      Delivery failed
                    </p>
                    <p className="text-red-300 text-xs mt-1 break-words">
                      {email.error || "No error details available."}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && !error && filteredEmails.length === 0 && (
          <div className="p-12 text-center muted text-sm">
            No email records found.
          </div>
        )}
      </section>

      {selectedEmail && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setSelectedEmail(null)}
        >
          <div
            className="panel w-full max-w-xl p-6 space-y-5 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Email Details</h2>
              <button
                onClick={() => setSelectedEmail(null)}
                className="muted hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <p className="muted text-xs">Recipient</p>
                <p className="mt-1 break-all">
                  {selectedEmail.recipient}
                </p>
              </div>

              <div>
                <p className="muted text-xs">Subject</p>
                <p className="mt-1">{selectedEmail.subject}</p>
              </div>

              <div>
                <p className="muted text-xs">Campaign</p>
                <p className="mt-1">
                  {selectedEmail.campaign?.name || "Unknown"}
                </p>
              </div>

              <div>
                <p className="muted text-xs">Email ID</p>
                <p className="mt-1 break-all">{selectedEmail.id}</p>
              </div>

              <div>
                <p className="muted text-xs">Status</p>
                <div className="flex items-center gap-2 mt-1">
                  {statusIcon(selectedEmail.status)}
                  <span>{selectedEmail.status}</span>
                </div>
              </div>

              <div>
                <p className="muted text-xs">Created At</p>
                <p className="mt-1">
                  {new Date(selectedEmail.createdAt).toLocaleString()}
                </p>
              </div>

              {selectedEmail.sentAt && (
                <div>
                  <p className="muted text-xs">Sent At</p>
                  <p className="mt-1">
                    {new Date(selectedEmail.sentAt).toLocaleString()}
                  </p>
                </div>
              )}

              {selectedEmail.status === "Failed" && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
                  <p className="text-red-400 font-medium">
                    Failure Reason
                  </p>
                  <p className="text-red-300 mt-2 break-words">
                    {selectedEmail.error || "No error details available."}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedEmail(null)}
              className="btn-primary w-full py-2"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
