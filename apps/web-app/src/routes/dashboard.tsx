import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ContactDashboard } from "../pages/ContactDashboard";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const contactId = sessionStorage.getItem("contact_id") || "";

  const location = window.location.pathname;
  const isChildRoute = location.includes("/upload-report/");

  if (isChildRoute) {
    return <Outlet />;
  }

  return <ContactDashboard contactId={contactId} />;
}
