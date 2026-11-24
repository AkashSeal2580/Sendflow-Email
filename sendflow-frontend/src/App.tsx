
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import Campaigns from "./pages/Campaigns";
import { ScheduledEmails, SentEmails } from "./pages/EmailPages";
import ComposeCampaign from "./pages/ComposeCampaign";
import Senders from "./pages/Senders";
import QueueMonitor from "./pages/QueueMonitor";
import Settings from "./pages/Settings";
import Login from "./pages/Login";

export default function App() {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<Login />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/scheduled" element={<ScheduledEmails />} />
          <Route path="/sent" element={<SentEmails />} />
          <Route path="/compose" element={<ComposeCampaign />} />
          <Route path="/senders" element={<Senders />} />
          <Route path="/queue" element={<QueueMonitor />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
