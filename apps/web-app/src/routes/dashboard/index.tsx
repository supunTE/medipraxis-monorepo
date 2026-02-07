import { ContactDashboard } from "@/routes/dashboard/ContactDashboard";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/")({
  component: Dashboard,
});

function Dashboard() {
  const contactId = sessionStorage.getItem("contact_id") || "";
  return <ContactDashboard contactId={contactId} />;
}
