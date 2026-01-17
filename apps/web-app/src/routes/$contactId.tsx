import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ContactDashboard } from "../pages/ContactDashboard";

export const Route = createFileRoute("/$contactId")({
  component: ContactPage,
});

function ContactPage() {
  const { contactId } = Route.useParams();

  // Check if we're on a child route
  const location = window.location.pathname;
  const isChildRoute = location.includes("/upload-report/");

  if (isChildRoute) {
    return <Outlet />;
  }

  return <ContactDashboard contactId={contactId} />;
}
