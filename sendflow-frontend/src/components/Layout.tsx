
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Activity,
  CalendarClock,
  LayoutDashboard,
  MailPlus,
  Send,
  Settings,
  Users,
  Zap,
  LogOut,
  FolderOpen,
} from "lucide-react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/campaigns", label: "Campaigns", icon: FolderOpen },
  { to: "/scheduled", label: "Scheduled emails", icon: CalendarClock },
  { to: "/sent", label: "Sent emails", icon: Send },
  { to: "/compose", label: "Compose campaign", icon: MailPlus },
  { to: "/senders", label: "Senders", icon: Users },
  { to: "/queue", label: "Queue monitor", icon: Activity },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Layout() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("sendflow_token");
    localStorage.removeItem("sendflow_user");

    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-[#0b0d14] text-[#eef0f8] md:flex">
      <aside className="w-full md:w-[250px] md:min-h-screen border-b md:border-b-0 md:border-r border-[#242838] bg-[#0e111a] px-4 py-5 flex md:flex-col">
        <div className="flex items-center gap-3 px-2 mb-7">
          <div className="h-9 w-9 rounded-xl bg-violet-500 flex items-center justify-center">
            <Zap size={20} />
          </div>
          <div>
            <div className="font-bold tracking-tight text-lg">SendFlow</div>
            <div className="text-[11px] muted">EMAIL AUTOMATION</div>
          </div>
        </div>

        <div className="hidden md:block text-[10px] tracking-[.16em] muted px-3 mb-3">
          WORKSPACE
        </div>

        <nav className="flex md:flex-col gap-1 flex-wrap">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  isActive
                    ? "nav-active"
                    : "text-[#a3a9ba] hover:bg-[#191d29] hover:text-white"
                }`
              }
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:block mt-auto panel p-3">
          <div className="text-xs font-semibold mb-1">Need a hand?</div>
          <p className="text-xs muted leading-relaxed">
            Explore the docs to get the most out of SendFlow.
          </p>
          <button className="text-xs text-violet-300 mt-3">
            View documentation ↗
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="h-[72px] border-b border-[#242838] flex items-center justify-between px-5 md:px-8">
          <div className="text-sm muted">
            Workspace <span className="mx-2">/</span>
            <span className="text-white">Overview</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <div className="text-sm font-medium">Akash Seal</div>
              <div className="text-xs muted">Workspace admin</div>
            </div>

            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-400 to-indigo-700 flex items-center justify-center text-sm font-bold">
              AS
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition"
            >
              <LogOut size={17} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        <div className="p-5 md:p-8 max-w-[1500px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
