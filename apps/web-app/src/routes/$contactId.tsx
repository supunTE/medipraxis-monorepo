import { createFileRoute } from "@tanstack/react-router";
import { ContactDashboard } from "../pages/ContactDashboard";

export const Route = createFileRoute("/$contactId")({
  component: ContactPage,
});

function ContactPage() {
  const { contactId } = Route.useParams();
  return <ContactDashboard contactId={contactId} />;
}
