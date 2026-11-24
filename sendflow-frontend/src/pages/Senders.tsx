
import { useEffect, useState } from "react";
import { Plus, Mail, X, Loader2, Trash2 } from "lucide-react";
import StatusBadge from "../components/StatusBadge";

interface Sender {
  id: string;
  name: string;
  email: string;
  host: string;
  port: number;
  username: string;
  status: string;
  dailyLimit: number;
  createdAt: string;
}

const API_URL = import.meta.env.VITE_API_URL;

const initialForm = {
  name: "",
  email: "",
  host: "smtp.gmail.com",
  port: "587",
  username: "",
  password: "",
};

export default function Senders() {
  const [senders, setSenders] = useState<Sender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const token = localStorage.getItem("sendflow_token");

  async function fetchSenders() {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        throw new Error("Please login again.");
      }

      const response = await fetch(`${API_URL}/api/senders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch senders");
      }

      setSenders(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSenders();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");

    if (!token) {
      setFormError("Please login again.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`${API_URL}/api/senders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          port: Number(form.port),
          password: form.password.replace(/\s/g, ""),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to connect sender");
      }

      setSenders((previous) => [result.data, ...previous]);
      setForm(initialForm);
      setShowModal(false);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(senderId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this sender?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(senderId);

      if (!token) {
        throw new Error("Please login again.");
      }

      const response = await fetch(
        `${API_URL}/api/senders/${senderId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete sender");
      }

      setSenders((previous) =>
        previous.filter((sender) => sender.id !== senderId)
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Sender management</h1>
          <p className="muted text-sm mt-2">
            Manage sender identities and sending limits.
          </p>
        </div>

        <button
          className="btn-primary text-sm"
          onClick={() => {
            setFormError("");
            setShowModal(true);
          }}
        >
          <Plus size={15} className="inline mr-2" />
          Add sender
        </button>
      </div>

      {loading && (
        <div className="panel p-6 text-center muted">
          Loading senders...
        </div>
      )}

      {error && (
        <div className="panel p-5 text-red-400">
          {error}
          <button onClick={fetchSenders} className="ml-3 underline">
            Retry
          </button>
        </div>
      )}

      {!loading && !error && senders.length === 0 && (
        <div className="panel p-8 text-center">
          <Mail size={32} className="mx-auto muted" />
          <p className="font-semibold mt-3">No senders connected</p>
          <p className="muted text-sm mt-1">
            Add an SMTP sender to start sending emails.
          </p>
        </div>
      )}

      {!loading && !error && senders.length > 0 && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {senders.map((sender) => (
            <div className="panel p-5" key={sender.id}>
              <div className="flex justify-between items-center">
                <div className="h-10 w-10 rounded-xl bg-violet-400/10 flex items-center justify-center text-violet-300">
                  <Mail />
                </div>

                <button
                  onClick={() => handleDelete(sender.id)}
                  disabled={deletingId !== null}
                  className="text-red-400 hover:text-red-300 disabled:opacity-50"
                  title="Delete sender"
                >
                  {deletingId === sender.id ? (
                    <Loader2 size={19} className="animate-spin" />
                  ) : (
                    <Trash2 size={19} />
                  )}
                </button>
              </div>

              <div className="font-semibold mt-4">{sender.name}</div>
              <div className="muted text-sm mt-1">{sender.email}</div>

              <div className="mt-4">
                <StatusBadge status={sender.status} />
              </div>

              <div className="flex justify-between text-xs mt-5">
                <span className="muted">SMTP Host</span>
                <span>{sender.host}:{sender.port}</span>
              </div>

              <div className="flex justify-between text-xs mt-3">
                <span className="muted">Daily sending limit</span>
                <span>{sender.dailyLimit} emails</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="panel w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold">Add SMTP Sender</h2>
                <p className="muted text-sm mt-1">
                  Connect your email account.
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="muted"
                type="button"
                disabled={saving}
              >
                <X />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { name: "name", label: "Sender Name", placeholder: "Akash", type: "text" },
                { name: "email", label: "Email Address", placeholder: "you@gmail.com", type: "email" },
                { name: "host", label: "SMTP Host", placeholder: "smtp.gmail.com", type: "text" },
                { name: "port", label: "SMTP Port", placeholder: "587", type: "number" },
                { name: "username", label: "SMTP Username", placeholder: "you@gmail.com", type: "text" },
                { name: "password", label: "SMTP App Password", placeholder: "Enter app password", type: "password" },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-sm mb-2 font-medium">
                    {field.label}
                  </label>

                  <input
                    required
                    type={field.type}
                    name={field.name}
                    value={form[field.name as keyof typeof form]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    className="w-full rounded-lg border border-white/10 bg-[#171b29] px-3 py-3 text-sm outline-none focus:border-violet-400"
                  />
                </div>
              ))}

              {formError && (
                <p className="text-red-400 text-sm">{formError}</p>
              )}

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  className="btn-secondary text-sm"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn-primary text-sm"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 size={15} className="inline mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    "Connect Sender"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
