import { createFileRoute } from "@tanstack/react-router";
import { PhoneEntry } from "../pages/PhoneEntry";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return <PhoneEntry />;
}
