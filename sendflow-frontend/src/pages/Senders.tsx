
import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  Plus,
  Mail,
  X,
  Loader2,
  Trash2,
} from "lucide-react";

import StatusBadge from "../components/StatusBadge";

// =====================================
// INTERFACES
// =====================================

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

interface SenderForm {
  name: string;
  email: string;
  host: string;
  port: string;
  username: string;
  password: string;
}

interface SenderField {
  name: keyof SenderForm;
  label: string;
  placeholder: string;
  type: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// =====================================
// API CONFIGURATION
// =====================================

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const API_URL = `${API_BASE.replace(/\/+$/, "").replace(/(?:\/api)+$/i, "")}/api`;

// =====================================
// INITIAL FORM
// =====================================

const initialForm: SenderForm = {
  name: "",
  email: "",
  host: "smtp.gmail.com",
  port: "587",
  username: "",
  password: "",
};

// =====================================
// FORM FIELDS
// =====================================

const formFields: SenderField[] = [
  {
    name: "name",
    label: "Sender Name",
    placeholder: "Your Name",
    type: "text",
  },
  {
    name: "email",
    label: "Email Address",
    placeholder: "you@gmail.com",
    type: "email",
  },
  {
    name: "host",
    label: "SMTP Host",
    placeholder: "smtp.gmail.com",
    type: "text",
  },
  {
    name: "port",
    label: "SMTP Port",
    placeholder: "587",
    type: "number",
  },
  {
    name: "username",
    label: "SMTP Username",
    placeholder: "you@gmail.com",
    type: "text",
  },
  {
    name: "password",
    label: "SMTP App Password",
    placeholder: "Enter app password",
    type: "password",
  },
];

// =====================================
// COMMON API HELPERS
// =====================================

function getAuthToken(): string {
  const token = localStorage.getItem("sendflow_token");

  if (!token) {
    throw new Error("Please login again.");
  }

  return token;
}

async function parseResponse<T>(
  response: Response
): Promise<ApiResponse<T>> {
  const contentType =
    response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    throw new Error(
      `Invalid server response (${response.status}). Please check your backend API route.`
    );
  }

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || `Request failed (${response.status})`
    );
  }

  return result as ApiResponse<T>;
}

// =====================================
// SENDERS COMPONENT
// =====================================

export default function Senders() {
  const [senders, setSenders] = useState<Sender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<SenderForm>(initialForm);

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  // =====================================
  // FETCH SENDERS
  // =====================================

  async function fetchSenders() {
    try {
      setLoading(true);
      setError("");

      const token = getAuthToken();

      const response = await fetch(`${API_URL}/senders`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const result = await parseResponse<Sender[]>(response);

      setSenders(
        Array.isArray(result.data) ? result.data : []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSenders();
  }, []);

  // =====================================
  // HANDLE FORM CHANGE
  // =====================================

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // =====================================
  // ADD SMTP SENDER
  // =====================================

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");

    if (!form.name.trim()) {
      setFormError("Please enter sender name.");
      return;
    }

    if (!form.email.trim() || !form.username.trim()) {
      setFormError("Please enter valid email and username.");
      return;
    }

    if (!form.password.trim()) {
      setFormError("Please enter SMTP app password.");
      return;
    }

    const port = Number(form.port);

    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      setFormError("Please enter a valid SMTP port.");
      return;
    }

    try {
      setSaving(true);

      const token = getAuthToken();

      const response = await fetch(`${API_URL}/senders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          ...form,
          name: form.name.trim(),
          email: form.email.trim(),
          host: form.host.trim(),
          username: form.username.trim(),
          port,
          password: form.password.replace(/\s/g, ""),
        }),
      });

      const result = await parseResponse<Sender>(response);

      setSenders((previous) => [
        result.data,
        ...previous,
      ]);

      setForm(initialForm);
      setShowModal(false);
      setFormError("");
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  }

  // =====================================
  // DELETE SENDER
  // =====================================

  async function handleDelete(senderId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this sender?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(senderId);

      const token = getAuthToken();

      const response = await fetch(
        `${API_URL}/senders/${encodeURIComponent(senderId)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      await parseResponse<unknown>(response);

      setSenders((previous) =>
        previous.filter((sender) => sender.id !== senderId)
      );
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Delete failed"
      );
    } finally {
      setDeletingId(null);
    }
  }

  // =====================================
  // RENDER
  // =====================================

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex justify-between items-end gap-3">
        <div>
          <h1 className="text-2xl font-semibold">
            Sender management
          </h1>

          <p className="muted text-sm mt-2">
            Manage sender identities and sending limits.
          </p>
        </div>

        <button
          className="btn-primary text-sm"
          onClick={() => {
            setFormError("");
            setForm(initialForm);
            setShowModal(true);
          }}
        >
          <Plus size={15} className="inline mr-2" />
          Add sender
        </button>
      </div>

      {/* LOADING */}

      {loading && (
        <div className="panel p-6 text-center muted">
          <Loader2 className="animate-spin mx-auto mb-2" />
          Loading senders...
        </div>
      )}

      {/* ERROR */}

      {error && (
        <div className="panel p-5 text-red-400">
          {error}

          <button
            onClick={fetchSenders}
            className="ml-3 underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* EMPTY STATE */}

      {!loading && !error && senders.length === 0 && (
        <div className="panel p-8 text-center">
          <Mail size={32} className="mx-auto muted" />

          <p className="font-semibold mt-3">
            No senders connected
          </p>

          <p className="muted text-sm mt-1">
            Add an SMTP sender to start sending emails.
          </p>
        </div>
      )}

      {/* SENDER CARDS */}

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
                    <Loader2
                      size={19}
                      className="animate-spin"
                    />
                  ) : (
                    <Trash2 size={19} />
                  )}
                </button>
              </div>

              <div className="font-semibold mt-4">
                {sender.name}
              </div>

              <div className="muted text-sm mt-1 break-all">
                {sender.email}
              </div>

              <div className="mt-4">
                <StatusBadge status={sender.status} />
              </div>

              <div className="flex justify-between gap-3 text-xs mt-5">
                <span className="muted">
                  SMTP Host
                </span>

                <span className="text-right break-all">
                  {sender.host}:{sender.port}
                </span>
              </div>

              <div className="flex justify-between text-xs mt-3">
                <span className="muted">
                  Daily sending limit
                </span>

                <span>
                  {sender.dailyLimit} emails
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD SENDER MODAL */}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="panel w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">

            {/* MODAL HEADER */}

            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold">
                  Add SMTP Sender
                </h2>

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

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {formFields.map((field) => (
                <div key={field.name}>
                  <label className="block text-sm mb-2 font-medium">
                    {field.label}
                  </label>

                  <input
                    required
                    type={field.type}
                    name={field.name}
                    value={form[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    className="w-full rounded-lg border border-white/10 bg-[#171b29] px-3 py-3 text-sm outline-none focus:border-violet-400"
                  />
                </div>
              ))}

              {/* FORM ERROR */}

              {formError && (
                <p className="text-red-400 text-sm">
                  {formError}
                </p>
              )}

              {/* FORM BUTTONS */}

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
                      <Loader2
                        size={15}
                        className="inline mr-2 animate-spin"
                      />
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
