import { PhoneEntry } from "@/routes/(PhoneEntry)/PhoneEntry";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const phoneEntrySearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/(PhoneEntry)/")({
  component: Index,
  validateSearch: phoneEntrySearchSchema,
});

function Index() {
  const search = Route.useSearch();
  return <PhoneEntry redirect={search.redirect} />;
}
