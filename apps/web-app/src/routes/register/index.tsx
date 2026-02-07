import { useClientRegistrationForm } from "@/services/ClientRegistration/useClientRegistrationForm";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import ClientRegistrationForm from "./ClientRegistrationForm";

export const Route = createFileRoute("/register/")({
  component: Index,
});

function Index() {
  const navigate = useNavigate();

  const onClose = () => {
    navigate({ to: "/dashboard" });
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
