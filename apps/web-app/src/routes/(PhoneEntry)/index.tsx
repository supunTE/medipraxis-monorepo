import { PhoneEntry } from "@/routes/(PhoneEntry)/PhoneEntry";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(PhoneEntry)/")({
  component: Index,
});

function Index() {
  return <PhoneEntry />;
}
