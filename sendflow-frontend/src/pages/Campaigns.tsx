
import { useEffect, useState } from "react";
import {
  RefreshCw,
  Pencil,
  Trash2,
  CalendarClock,
  X,
  Loader2,
  Mail,
  Plus,
} from "lucide-react";
import { Link } from "react-router-dom";

const API =
  import.meta.env.VITE_API_BASE_URL || "https://sendflow-email.onrender.com/api";

interface Campaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  status: string;
  scheduledAt: string | null;
  senderId: string | null;
  createdAt: string;
}

interface Sender {
  id: string;
  name: string;
  email: string;
  status: string;
}

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [senders, setSenders] = useState<Sender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [scheduling, setScheduling] = useState<Campaign | null>(null);
  const [scheduledAt, setScheduledAt] = useState("");
  const [senderId, setSenderId] = useState("");

  const token = localStorage.getItem("sendflow_token");

  async function loadCampaigns() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API}/campaigns`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch campaigns");
      }

      setCampaigns(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function loadSenders() {
    try {
      const response = await fetch(`${API}/senders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();

      if (response.ok) {
        setSenders(
          (result.data || []).filter(
            (sender: Sender) => sender.status === "Connected"
          )
        );
      }
    } catch (err) {
      console.error("Sender loading failed:", err);
    }
  }

  useEffect(() => {
    void loadCampaigns();
    void loadSenders();
  }, []);

  async function handleEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;

    try {
      setSaving(true);

      const response = await fetch(`${API}/campaigns/${editing.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editing.name,
          subject: editing.subject,
          content: editing.content,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Campaign update failed");
      }

      setEditing(null);
      await loadCampaigns();
      alert("Campaign updated successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Are you sure you want to delete this draft campaign?")) {
      return;
    }

    try {
      const response = await fetch(`${API}/campaigns/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Delete failed");
      }

      await loadCampaigns();
      alert("Campaign deleted successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  }

  async function handleSchedule(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!scheduling) return;

    try {
      setSaving(true);

      const response = await fetch(
        `${API}/campaigns/${scheduling.id}/schedule`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            scheduledAt: new Date(scheduledAt).toISOString(),
            senderId,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Scheduling failed");
      }

      setScheduling(null);
      setScheduledAt("");
      setSenderId("");
      await loadCampaigns();
      alert("Campaign scheduled successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Scheduling failed");
    } finally {
      setSaving(false);
    }
  }

  function statusStyle(status: string) {
    switch (status) {
      case "Draft":
        return "bg-gray-700/60 text-gray-200";
      case "Scheduled":
        return "bg-blue-500/20 text-blue-400";
      case "Completed":
        return "bg-green-500/20 text-green-400";
      case "Sending":
        return "bg-amber-500/20 text-amber-400";
      default:
        return "bg-gray-700/60 text-gray-200";
    }
  }

  const inputStyle =
    "w-full rounded-lg border border-gray-700 bg-[#111827] p-3 text-gray-100 placeholder-gray-500 outline-none focus:border-blue-500";

  return (
    <div className="space-y-6 text-gray-100">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Campaigns</h1>
          <p className="mt-1 text-sm text-gray-400">
            Manage, edit and schedule your email campaigns.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => void loadCampaigns()}
            className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-gray-800"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <Link
            to="/compose"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <Plus size={16} />
            New Campaign
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {["Draft", "Scheduled", "Completed"].map((status) => (
          <div
            key={status}
            className="rounded-xl border border-gray-800 bg-gray-900 p-5"
          >
            <p className="text-sm text-gray-400">{status}</p>
            <p className="mt-2 text-2xl font-bold text-white">
              {campaigns.filter((item) => item.status === status).length}
            </p>
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-red-900 bg-red-950/50 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900">
        <div className="border-b border-gray-800 px-5 py-4">
          <h2 className="font-semibold text-white">All Campaigns</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 p-12 text-gray-400">
            <Loader2 className="animate-spin" size={20} />
            Loading campaigns...
          </div>
        ) : campaigns.length === 0 ? (
          <div className="p-12 text-center">
            <Mail className="mx-auto mb-3 text-gray-500" size={32} />
            <p className="font-medium text-gray-200">No campaigns found</p>
            <p className="mt-1 text-sm text-gray-400">
              Create your first email campaign.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#111827] text-gray-400">
                <tr>
                  <th className="px-5 py-3 font-medium">Campaign</th>
                  <th className="px-5 py-3 font-medium">Subject</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Scheduled</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-800">
                {campaigns.map((campaign) => (
                  <tr
                    key={campaign.id}
                    className="transition hover:bg-gray-800/50"
                  >
                    <td className="px-5 py-4 font-medium text-gray-100">
                      {campaign.name}
                    </td>

                    <td className="max-w-xs truncate px-5 py-4 text-gray-400">
                      {campaign.subject}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle(
                          campaign.status
                        )}`}
                      >
                        {campaign.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-gray-400">
                      {campaign.scheduledAt
                        ? new Date(campaign.scheduledAt).toLocaleString()
                        : "—"}
                    </td>

                    <td className="px-5 py-4">
                      {campaign.status === "Draft" ? (
                        <div className="flex items-center gap-2">
                          <button
                            title="Edit campaign"
                            onClick={() => setEditing({ ...campaign })}
                            className="rounded-lg p-2 text-blue-400 transition hover:bg-blue-500/10"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            title="Schedule campaign"
                            onClick={() => setScheduling(campaign)}
                            className="rounded-lg p-2 text-green-400 transition hover:bg-green-500/10"
                          >
                            <CalendarClock size={16} />
                          </button>

                          <button
                            title="Delete campaign"
                            onClick={() => void handleDelete(campaign.id)}
                            className="rounded-lg p-2 text-red-400 transition hover:bg-red-500/10"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">No actions</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <form
            onSubmit={handleEdit}
            className="w-full max-w-lg space-y-4 rounded-xl border border-gray-700 bg-gray-900 p-6 text-gray-100 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                Edit Draft Campaign
              </h2>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <input
              required
              value={editing.name}
              onChange={(e) =>
                setEditing({ ...editing, name: e.target.value })
              }
              placeholder="Campaign name"
              className={inputStyle}
            />

            <input
              required
              value={editing.subject}
              onChange={(e) =>
                setEditing({ ...editing, subject: e.target.value })
              }
              placeholder="Email subject"
              className={inputStyle}
            />

            <textarea
              required
              rows={6}
              value={editing.content}
              onChange={(e) =>
                setEditing({ ...editing, content: e.target.value })
              }
              placeholder="Email content"
              className={inputStyle}
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-lg border border-gray-700 px-4 py-2 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </button>

              <button
                disabled={saving}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      {scheduling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <form
            onSubmit={handleSchedule}
            className="w-full max-w-lg space-y-4 rounded-xl border border-gray-700 bg-gray-900 p-6 text-gray-100 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                Schedule Campaign
              </h2>
              <button
                type="button"
                onClick={() => setScheduling(null)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-gray-400">{scheduling.name}</p>

            <label className="block space-y-2 text-sm font-medium text-gray-300">
              Schedule date and time
              <input
                type="datetime-local"
                required
                min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className={inputStyle}
              />
            </label>

            <label className="block space-y-2 text-sm font-medium text-gray-300">
              Select connected sender
              <select
                required
                value={senderId}
                onChange={(e) => setSenderId(e.target.value)}
                className={inputStyle}
              >
                <option value="">Choose sender</option>
                {senders.map((sender) => (
                  <option key={sender.id} value={sender.id}>
                    {sender.name} ({sender.email})
                  </option>
                ))}
              </select>
            </label>

            {senders.length === 0 && (
              <p className="text-sm text-red-400">
                No connected sender found. Connect a sender first.
              </p>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setScheduling(null)}
                className="rounded-lg border border-gray-700 px-4 py-2 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </button>

              <button
                disabled={saving || senders.length === 0}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <CalendarClock size={16} />
                {saving ? "Scheduling..." : "Schedule Campaign"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
