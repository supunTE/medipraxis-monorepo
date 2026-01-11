import { createFileRoute } from "@tanstack/react-router";
import { FormDemo } from "../pages/FormDemo";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  console.log("Index component rendering");
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <h1>Form Page</h1>
      <FormDemo />
    </div>
  );
}
