import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { useRegisterPatient } from "@/services/ClientRegistration/useRegisterPatient";
import {
  clientRegistrationFormSchema,
  type ClientRegistrationFormValues,
  type ServerMessage,
} from "@/types/clientRegistration.types";

export const useClientRegistrationForm = (onClose: () => void) => {
  const [serverMessage, setServerMessage] = useState<ServerMessage | null>(
    null
  );

  const defaultValues: ClientRegistrationFormValues = {
    title: "Mr",
    first_name: "",
    last_name: "",
    gender: "MALE",
    date_of_birth: "",
    user_id: "",
    contact_id: "",
  };

  const form = useForm<ClientRegistrationFormValues>({
    resolver: zodResolver(clientRegistrationFormSchema),
    defaultValues,
  });

  const { mutate, isPending, reset } = useRegisterPatient({
    onSuccess: () => {
      setServerMessage({
        type: "success",
        text: "Patient registered successfully!",
      });
      setTimeout(onClose, 3000);
    },
    onError: (message) => {
      setServerMessage({
        type: "error",
        text: message,
      });
    },
  });

  const onSubmit = (values: ClientRegistrationFormValues) => {
    if (isPending) return;

    setServerMessage(null);
    reset();

    mutate({
      ...values,
      user_id: "2a3c19b8-d352-4b30-a2ac-1cdf993d310c",
      contact_id: "57e0f5d8-92ad-44c9-b546-ccd3502af7d0",
    });
  };

  return {
    form,
    onSubmit,
    isPending,
    serverMessage,
    clearServerMessage: () => setServerMessage(null),
  };
};
