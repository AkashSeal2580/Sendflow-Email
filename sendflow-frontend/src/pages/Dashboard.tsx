
import { useEffect, useState } from "react";
import {
  Mail,
  Send,
  Clock3,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Activity {
  day: string;
  sent: number;
  scheduled: number;
}

interface DashboardStats {
  totalEmails: number;
  sentEmails: number;
  scheduledEmails: number;
  failedEmails: number;
  deliveryRate: number;
  activity: Activity[];
}

const initialStats: DashboardStats = {
  totalEmails: 0,
  sentEmails: 0,
  scheduledEmails: 0,
  failedEmails: 0,
  deliveryRate: 0,
  activity: [],
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchStats() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("sendflow_token");

      if (!token) {
        throw new Error("Please login again.");
      }

      const response = await fetch(
        "http://localhost:5000/api/emails/stats",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const text = await response.text();

      let result;

      try {
        result = JSON.parse(text);
      } catch {
        throw new Error(
          `API returned HTML instead of JSON. Check API URL. Response: ${text.slice(0, 100)}`
        );
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to fetch dashboard statistics"
        );
      }

      setStats(result.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStats();
  }, []);

  const cards = [
    {
      label: "Total emails",
      value: stats.totalEmails,
      icon: Mail,
      color: "text-violet-300",
    },
    {
      label: "Emails sent",
      value: stats.sentEmails,
      icon: Send,
      color: "text-emerald-400",
    },
    {
      label: "Scheduled emails",
      value: stats.scheduledEmails,
      icon: Clock3,
      color: "text-yellow-400",
    },
    {
      label: "Failed emails",
      value: stats.failedEmails,
      icon: AlertCircle,
      color: "text-red-400",
    },
  ];

  return (
    <div className="space-y-7">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-sm muted mb-2">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>

          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Dashboard
          </h1>

          <p className="muted mt-2 text-sm">
            Here's what's happening with your email campaigns.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchStats}
            disabled={loading}
            className="btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm"
          >
            <RefreshCw
              size={15}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <a
            href="/compose"
            className="btn-primary inline-flex items-center gap-2 w-fit text-sm px-4 py-2"
          >
            <Mail size={16} />
            Compose campaign
          </a>
        </div>
      </div>

      {error && (
        <div className="panel p-4 text-red-400 text-sm">
          {error}
          <button onClick={fetchStats} className="underline ml-2">
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div className="panel p-5" key={card.label}>
            <div className="flex justify-between items-center">
              <span className="muted text-sm">{card.label}</span>
              <card.icon size={18} className={card.color} />
            </div>

            <div className="text-3xl font-semibold mt-4">
              {loading ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                card.value.toLocaleString()
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-4">
        <section className="panel p-5">
          <div className="mb-5">
            <h2 className="font-semibold">Email activity</h2>
            <p className="muted text-xs mt-1">
              Sending performance over the last 7 days
            </p>
          </div>

          <div className="h-[260px]">
            {loading ? (
              <div className="h-full flex items-center justify-center muted">
                <Loader2 className="animate-spin mr-2" />
                Loading activity...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.activity}>
                  <defs>
                    <linearGradient
                      id="sent"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#8b75ff" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#8b75ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid stroke="#252a39" vertical={false} />

                  <XAxis
                    dataKey="day"
                    stroke="#777f94"
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    stroke="#777f94"
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip
                    contentStyle={{
                      background: "#171b28",
                      border: "1px solid #30364a",
                      borderRadius: 10,
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="sent"
                    name="Sent"
                    stroke="#9b87ff"
                    fill="url(#sent)"
                    strokeWidth={2}
                  />

                  <Area
                    type="monotone"
                    dataKey="scheduled"
                    name="Scheduled"
                    stroke="#42c8b4"
                    fill="transparent"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="flex gap-5 text-xs muted mt-3">
            <span>
              <i className="inline-block w-2 h-2 rounded-full bg-violet-400 mr-2" />
              Sent
            </span>
            <span>
              <i className="inline-block w-2 h-2 rounded-full bg-teal-400 mr-2" />
              Scheduled
            </span>
          </div>
        </section>

        <section className="panel p-5">
          <div>
            <h2 className="font-semibold">Delivery overview</h2>
            <p className="muted text-xs mt-1">
              Actual email delivery statistics
            </p>
          </div>

          <div className="mt-7">
            <div className="flex justify-between items-center">
              <span className="muted text-sm">Delivery rate</span>
              <span className="text-2xl font-semibold text-emerald-400">
                {loading ? "--" : `${stats.deliveryRate}%`}
              </span>
            </div>

            <div className="mt-3 h-2 rounded-full bg-[#292e3e] overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all"
                style={{
                  width: `${Math.min(stats.deliveryRate, 100)}%`,
                }}
              />
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="muted">Successfully sent</span>
              <span>{loading ? "--" : stats.sentEmails}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="muted">Waiting / Scheduled</span>
              <span>{loading ? "--" : stats.scheduledEmails}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="muted">Failed deliveries</span>
              <span className="text-red-400">
                {loading ? "--" : stats.failedEmails}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
