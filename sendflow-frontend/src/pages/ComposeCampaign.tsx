
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  Send,
  Loader2,
  FolderOpen,
  Plus,
  Mail,
} from "lucide-react";
import { Link } from "react-router-dom";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

const API = `${API_BASE.replace(/\/+$/, "").replace(/(?:\/api)+$/i, "")}/api`;

interface Sender {
  id: string;
  name: string;
  email: string;
  status: string;
}

interface Campaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  status: string;
  scheduledAt: string | null;
}

type Mode = "single" | "new" | "existing";

export default function ComposeCampaign() {
  const [mode, setMode] = useState<Mode>("single");

  const [file, setFile] = useState<File | null>(null);
  const [count, setCount] = useState(0);

  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [senderId, setSenderId] = useState("");

  const [recipient, setRecipient] = useState("");
  const [singleSubject, setSingleSubject] = useState("");
  const [singleContent, setSingleContent] = useState("");
  const [singleSenderId, setSingleSenderId] = useState("");

  const [senders, setSenders] = useState<Sender[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState("");

  const [loadingSenders, setLoadingSenders] = useState(true);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [createdCampaignId, setCreatedCampaignId] = useState("");
  const [createdCampaignStatus, setCreatedCampaignStatus] = useState("");

  const input = useRef<HTMLInputElement>(null);
  const token = localStorage.getItem("sendflow_token");

  useEffect(() => {
    async function loadData() {
      if (!token) {
        setError("Please login again.");
        setLoadingSenders(false);
        setLoadingCampaigns(false);
        return;
      }

      try {
        const [senderResponse, campaignResponse] = await Promise.all([
          fetch(`${API}/senders`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API}/campaigns`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const senderResult = await senderResponse.json();
        const campaignResult = await campaignResponse.json();

        if (!senderResponse.ok || !senderResult.success) {
          throw new Error(senderResult.message || "Failed to load senders");
        }

        if (!campaignResponse.ok || !campaignResult.success) {
          throw new Error(campaignResult.message || "Failed to load campaigns");
        }

        const connectedSenders: Sender[] = (
          senderResult.data || []
        ).filter((sender: Sender) => sender.status === "Connected");

        setSenders(connectedSenders);

        if (connectedSenders.length > 0) {
          setSingleSenderId(connectedSenders[0].id);
          setSenderId(connectedSenders[0].id);
        }

        setCampaigns(
          (campaignResult.data || []).filter(
            (campaign: Campaign) => campaign.status === "Draft"
          )
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load data");
      } finally {
        setLoadingSenders(false);
        setLoadingCampaigns(false);
      }
    }

    void loadData();
  }, [token]);

  function handleFile(f?: File) {
    if (!f) return;

    setError("");
    setMessage("");

    if (!f.name.toLowerCase().endsWith(".csv")) {
      setError("Please select a CSV file.");
      return;
    }

    if (f.size > 5 * 1024 * 1024) {
      setError("CSV file must be smaller than 5 MB.");
      return;
    }

    setFile(f);

    const reader = new FileReader();

    reader.onload = () => {
      const lines = String(reader.result)
        .split(/\r?\n/)
        .filter((line) => line.trim());

      setCount(Math.max(0, lines.length - 1));
    };

    reader.readAsText(f);
  }

  async function uploadRecipients(campaignId: string) {
    if (!file || !token) {
      throw new Error("Please select a CSV file.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("campaignId", campaignId);

    const response = await fetch(`${API}/uploads/recipients`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Recipient upload failed");
    }

    return result.data;
  }

  function resetFile() {
    setFile(null);
    setCount(0);

    if (input.current) {
      input.current.value = "";
    }
  }

  async function handleSingleEmail() {
    setError("");
    setMessage("");

    const normalizedRecipient = recipient.trim();

    if (
      !normalizedRecipient ||
      !singleSubject.trim() ||
      !singleContent.trim()
    ) {
      setError("Please fill in recipient, subject and email body.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedRecipient)) {
      setError("Please enter a valid recipient email address.");
      return;
    }

    if (!singleSenderId) {
      setError("Please select a connected email sender.");
      return;
    }

    if (!token) {
      setError("Please login again.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`${API}/emails/send-single`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          senderId: singleSenderId,
          recipient: normalizedRecipient,
          subject: singleSubject.trim(),
          content: singleContent.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to send email.");
      }

      setMessage(`Email successfully sent to ${normalizedRecipient}!`);

      setRecipient("");
      setSingleSubject("");
      setSingleContent("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Email sending failed."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleExistingUpload() {
    setError("");
    setMessage("");

    if (!selectedCampaignId) {
      setError("Please select an existing Draft campaign.");
      return;
    }

    if (!file) {
      setError("Please select a CSV file.");
      return;
    }

    if (!token) {
      setError("Please login again.");
      return;
    }

    try {
      setSaving(true);

      const result = await uploadRecipients(selectedCampaignId);

      setMessage(
        `${result.savedEmails} recipients uploaded successfully. ${result.duplicateEmails} duplicate emails skipped.`
      );

      resetFile();
      setSelectedCampaignId("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setSaving(false);
    }
  }

  async function createCampaign(schedule: boolean) {
    setMessage("");
    setError("");

    if (!name.trim() || !subject.trim() || !content.trim()) {
      setError("Please fill in campaign name, subject and email body.");
      return;
    }

    if (!token) {
      setError("Please login again.");
      return;
    }

    if (!file) {
      setError("Please upload a CSV file containing recipients.");
      return;
    }

    if (schedule && !createdCampaignId && !senderId) {
      setError("Please select a connected email sender.");
      return;
    }

    if (schedule && !createdCampaignId && !scheduledAt) {
      setError("Please select a start date and time.");
      return;
    }

    let scheduleDate: Date | null = null;

    if (schedule && !createdCampaignId) {
      scheduleDate = new Date(scheduledAt);

      if (
        Number.isNaN(scheduleDate.getTime()) ||
        scheduleDate.getTime() <= Date.now()
      ) {
        setError("Please select a valid future date and time.");
        return;
      }
    }

    try {
      setSaving(true);

      let campaignId = createdCampaignId;

      if (!campaignId) {
        const response = await fetch(`${API}/campaigns`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: name.trim(),
            subject: subject.trim(),
            content: content.trim(),
            ...(scheduleDate
              ? {
                  scheduledAt: scheduleDate.toISOString(),
                  senderId,
                }
              : {}),
          }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to create campaign");
        }

        campaignId = result.data.id;

        setCreatedCampaignId(campaignId);
        setCreatedCampaignStatus(result.data.status);
      }

      const uploadResult = await uploadRecipients(campaignId);

      setMessage(
        `Campaign saved! ${uploadResult.savedEmails} recipients uploaded successfully. ${uploadResult.duplicateEmails} duplicates skipped.`
      );

      setName("");
      setSubject("");
      setContent("");
      setScheduledAt("");
      resetFile();

      setCreatedCampaignId("");
      setCreatedCampaignStatus("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  const minDateTime = new Date(
    Date.now() - new Date().getTimezoneOffset() * 60000 + 60000
  )
    .toISOString()
    .slice(0, 16);

  const inputStyle = "field mt-2";

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <Link
          to="/"
          className="muted mb-4 inline-flex items-center gap-2 text-sm"
        >
          <ArrowLeft size={15} /> Back to dashboard
        </Link>

        <h1 className="text-2xl font-semibold">Compose Email</h1>

        <p className="muted mt-2 text-sm">
          Send an individual email or create a bulk campaign.
        </p>
      </div>

      <section className="panel space-y-4 p-5 md:p-6">
        <h2 className="font-semibold">Choose an action</h2>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => {
              setMode("single");
              setError("");
              setMessage("");
            }}
            className={`rounded-xl border p-4 text-left transition ${
              mode === "single"
                ? "border-violet-500 bg-violet-500/10"
                : "border-[#414760] hover:border-violet-400"
            }`}
          >
            <Mail className="mb-2 text-violet-300" size={22} />
            <p className="font-medium">Send Single Email</p>
            <p className="muted mt-1 text-xs">
              Send directly without uploading CSV.
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("new");
              setError("");
              setMessage("");
            }}
            className={`rounded-xl border p-4 text-left transition ${
              mode === "new"
                ? "border-violet-500 bg-violet-500/10"
                : "border-[#414760] hover:border-violet-400"
            }`}
          >
            <Plus className="mb-2 text-violet-300" size={22} />
            <p className="font-medium">Create New Campaign</p>
            <p className="muted mt-1 text-xs">
              Create a campaign and upload recipients.
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("existing");
              setError("");
              setMessage("");
            }}
            className={`rounded-xl border p-4 text-left transition ${
              mode === "existing"
                ? "border-violet-500 bg-violet-500/10"
                : "border-[#414760] hover:border-violet-400"
            }`}
          >
            <FolderOpen className="mb-2 text-violet-300" size={22} />
            <p className="font-medium">Add to Existing Draft</p>
            <p className="muted mt-1 text-xs">
              Upload recipients to a saved draft campaign.
            </p>
          </button>
        </div>
      </section>

      {mode === "single" ? (
        <section className="panel space-y-5 p-5 md:p-6">
          <div>
            <h2 className="font-semibold">Send a single email</h2>
            <p className="muted mt-1 text-xs">
              Enter any recipient address and send directly.
            </p>
          </div>

          <label className="block text-sm">
            Select email sender
            <select
              className={inputStyle}
              value={singleSenderId}
              onChange={(e) => setSingleSenderId(e.target.value)}
              disabled={loadingSenders}
            >
              <option value="">
                {loadingSenders ? "Loading senders..." : "Select sender"}
              </option>

              {senders.map((sender) => (
                <option key={sender.id} value={sender.id}>
                  {sender.name} ({sender.email})
                </option>
              ))}
            </select>
          </label>

          {!loadingSenders && senders.length === 0 && (
            <p className="text-sm text-red-400">
              No connected sender found. Please connect a sender first.
            </p>
          )}

          <label className="block text-sm">
            Recipient email
            <input
              type="email"
              className={inputStyle}
              placeholder="example@gmail.com"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </label>

          <label className="block text-sm">
            Email subject
            <input
              className={inputStyle}
              placeholder="Enter email subject"
              value={singleSubject}
              onChange={(e) => setSingleSubject(e.target.value)}
            />
          </label>

          <label className="block text-sm">
            Email message
            <textarea
              className={`${inputStyle} min-h-[170px] resize-y`}
              placeholder="Write your email message here..."
              value={singleContent}
              onChange={(e) => setSingleContent(e.target.value)}
            />
          </label>

          <div className="flex justify-end">
            <button
              type="button"
              className="btn-primary inline-flex items-center justify-center gap-2"
              onClick={() => void handleSingleEmail()}
              disabled={saving || loadingSenders || senders.length === 0}
            >
              {saving ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={15} />
                  Send Email
                </>
              )}
            </button>
          </div>
        </section>
      ) : mode === "new" ? (
        <>
          <section className="panel space-y-5 p-5 md:p-6">
            <div>
              <h2 className="font-semibold">Campaign details</h2>
              <p className="muted mt-1 text-xs">
                Give your campaign a name and write your email.
              </p>
            </div>

            <label className="block text-sm">
              Campaign name
              <input
                className={inputStyle}
                placeholder="e.g. November product announcement"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>

            <label className="block text-sm">
              Email subject
              <input
                className={inputStyle}
                placeholder="Write a clear subject line"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </label>

            <label className="block text-sm">
              Email body
              <textarea
                className={`${inputStyle} min-h-[170px] resize-y`}
                placeholder="Hi {{first_name}},&#10;&#10;We have some exciting news to share..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </label>
          </section>

          <section className="panel space-y-4 p-5 md:p-6">
            <div>
              <h2 className="font-semibold">Recipients</h2>
              <p className="muted mt-1 text-xs">
                Upload a CSV file containing recipient email addresses.
              </p>
            </div>

            <input
              ref={input}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />

            <button
              type="button"
              onClick={() => input.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFile(e.dataTransfer.files?.[0]);
              }}
              className="w-full rounded-xl border border-dashed border-[#414760] bg-[#0d1019] p-8 text-center hover:border-violet-400"
            >
              <UploadCloud className="mx-auto mb-3 text-violet-300" size={28} />
              <div className="text-sm font-medium">
                Click to upload or drag and drop
              </div>
              <div className="muted mt-2 text-xs">
                CSV only · Maximum 5 MB
              </div>
            </button>

            {file && (
              <div className="flex items-center justify-between rounded-xl bg-[#0d1019] p-3">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="text-emerald-300" />
                  <div>
                    <div className="text-sm">{file.name}</div>
                    <div className="muted text-xs">
                      {count} data rows detected
                    </div>
                  </div>
                </div>
                <CheckCircle2 className="text-emerald-300" />
              </div>
            )}
          </section>

          <section className="panel space-y-5 p-5 md:p-6">
            <div>
              <h2 className="font-semibold">Delivery settings</h2>
              <p className="muted mt-1 text-xs">
                Choose your sending account and delivery time.
              </p>
            </div>

            <label className="block text-sm">
              Select email sender
              <select
                className={inputStyle}
                value={senderId}
                onChange={(e) => setSenderId(e.target.value)}
                disabled={loadingSenders || !!createdCampaignId}
              >
                <option value="">
                  {loadingSenders
                    ? "Loading senders..."
                    : "Select a connected email account"}
                </option>

                {senders.map((sender) => (
                  <option key={sender.id} value={sender.id}>
                    {sender.name} ({sender.email})
                  </option>
                ))}
              </select>

              {!loadingSenders && senders.length === 0 && (
                <p className="mt-2 text-xs text-red-400">
                  No connected senders found. Please connect a sender first.
                </p>
              )}
            </label>

            <label className="block text-sm">
              Start date and time
              <input
                type="datetime-local"
                className={inputStyle}
                value={scheduledAt}
                min={minDateTime}
                onChange={(e) => setScheduledAt(e.target.value)}
                disabled={!!createdCampaignId}
              />
            </label>

            <p className="muted text-xs">
              Save as draft without scheduling, or select a future date to schedule.
            </p>
          </section>

          <div className="flex flex-col justify-end gap-3 sm:flex-row">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => createCampaign(false)}
              disabled={saving}
            >
              Save draft
            </button>

            <button
              type="button"
              className="btn-primary inline-flex items-center justify-center gap-2"
              onClick={() => createCampaign(true)}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Send size={15} />
                  Schedule campaign
                </>
              )}
            </button>
          </div>
        </>
      ) : (
        <section className="panel space-y-5 p-5 md:p-6">
          <div>
            <h2 className="font-semibold">Add recipients to existing Draft</h2>
            <p className="muted mt-1 text-xs">
              Select a draft campaign and upload its recipient CSV.
            </p>
          </div>

          <label className="block text-sm">
            Select Draft campaign
            <select
              className={inputStyle}
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              disabled={loadingCampaigns}
            >
              <option value="">
                {loadingCampaigns
                  ? "Loading campaigns..."
                  : "Choose a Draft campaign"}
              </option>

              {campaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.name} — {campaign.subject}
                </option>
              ))}
            </select>
          </label>

          {!loadingCampaigns && campaigns.length === 0 && (
            <p className="text-sm text-amber-400">
              No Draft campaigns found. Create a new campaign first.
            </p>
          )}

          <input
            ref={input}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />

          <button
            type="button"
            onClick={() => input.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFile(e.dataTransfer.files?.[0]);
            }}
            className="w-full rounded-xl border border-dashed border-[#414760] bg-[#0d1019] p-8 text-center hover:border-violet-400"
          >
            <UploadCloud className="mx-auto mb-3 text-violet-300" size={28} />
            <div className="text-sm font-medium">
              Click to upload or drag and drop
            </div>
            <div className="muted mt-2 text-xs">
              CSV only · Maximum 5 MB
            </div>
          </button>

          {file && (
            <div className="flex items-center justify-between rounded-xl bg-[#0d1019] p-3">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="text-emerald-300" />
                <div>
                  <div className="text-sm">{file.name}</div>
                  <div className="muted text-xs">
                    {count} data rows detected
                  </div>
                </div>
              </div>
              <CheckCircle2 className="text-emerald-300" />
            </div>
          )}

          <p className="muted text-xs">
            Duplicate email addresses already present in this campaign will be skipped.
          </p>

          <div className="flex justify-end">
            <button
              type="button"
              className="btn-primary inline-flex items-center justify-center gap-2"
              onClick={() => void handleExistingUpload()}
              disabled={saving || loadingCampaigns || campaigns.length === 0}
            >
              {saving ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadCloud size={15} />
                  Upload Recipients
                </>
              )}
            </button>
          </div>
        </section>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      {message && (
        <div className="rounded-lg border border-emerald-800 bg-emerald-950/30 p-4 text-sm text-emerald-300">
          {message}
          <div className="mt-2">
            <Link to="/campaigns" className="underline hover:text-white">
              Go to Campaigns
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
