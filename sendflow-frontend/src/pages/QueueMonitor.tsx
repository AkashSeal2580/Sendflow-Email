
import {
  Activity,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";

const metrics = [
  ["Waiting", "1,204", Clock3],
  ["Active", "12", Activity],
  ["Completed", "8,492", CheckCircle2],
  ["Failed", "3", AlertTriangle],
];

const API_URL = import.meta.env.VITE_API_URL;

export default function QueueMonitor() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Queue monitor</h1>
        <p className="muted text-sm mt-2">
          Queue processing overview.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map(([label, value, Icon]) => {
          const I = Icon as typeof Activity;

          return (
            <div className="panel p-5" key={String(label)}>
              <div className="flex justify-between muted text-sm">
                <span>{String(label)}</span>
                <I size={18} />
              </div>

              <div className="text-3xl font-semibold mt-4">
                {String(value)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="panel p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Worker status</h2>
            <p className="muted text-xs mt-1">
              Demo snapshot · Live queue API not connected
            </p>
          </div>

          <span className="text-amber-300 text-xs">
            ● Demo data
          </span>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-[#0d1019] rounded-xl p-4">
            <div className="muted text-xs">Concurrency</div>
            <div className="text-xl font-semibold mt-2">5 workers</div>
          </div>

          <div className="bg-[#0d1019] rounded-xl p-4">
            <div className="muted text-xs">Minimum send delay</div>
            <div className="text-xl font-semibold mt-2">2 seconds</div>
          </div>

          <div className="bg-[#0d1019] rounded-xl p-4">
            <div className="muted text-xs">Rate limit</div>
            <div className="text-xl font-semibold mt-2">100 / hour</div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-dashed border-[#414760] p-8 text-center">
          <Activity
            className="mx-auto text-violet-300 mb-3"
            size={28}
          />

          <div className="font-medium">
            Bull Board integration point
          </div>

          <p className="muted text-sm mt-2 max-w-lg mx-auto">
            Live queue monitoring requires Bull Board to be configured
            in the backend and protected with administrator authentication.
          </p>

          <a
            href={`${API_URL}/admin/queues`}
            target="_blank"
            rel="noreferrer"
            className="text-violet-300 text-sm inline-flex items-center gap-2 mt-4"
          >
            Open queue dashboard
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
