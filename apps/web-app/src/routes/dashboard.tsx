import { ContactDashboard } from "@/pages";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const contactId = sessionStorage.getItem("contact_id") || "";
  return <ContactDashboard contactId={contactId} />;
}
