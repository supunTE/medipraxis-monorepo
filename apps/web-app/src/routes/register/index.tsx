import { useClientRegistrationForm } from "@/services/ClientRegistration/useClientRegistrationForm";
import { createFileRoute } from "@tanstack/react-router";
import ClientRegistrationForm from "./ClientRegistrationForm";

export const Route = createFileRoute("/register/")({
  component: Index,
});

function Index() {
  const onClose = () => {
    console.log("close modal / navigate / whatever");
  };

  const { form, onSubmit, isPending, serverMessage, clearServerMessage } =
    useClientRegistrationForm(onClose);

  return (
    <ClientRegistrationForm
      form={form}
      onSubmit={onSubmit}
      isPending={isPending}
      serverMessage={serverMessage}
      onClearMessage={clearServerMessage}
    />
  );
}
