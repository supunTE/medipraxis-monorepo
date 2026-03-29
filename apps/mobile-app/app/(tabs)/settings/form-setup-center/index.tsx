import { useRouter } from "expo-router";
import React from "react";
import { FormSetupCenter } from "../components/form-setup-center";

export default function FormSetupCenterScreen() {
  const router = useRouter();

  return <FormSetupCenter onClose={() => router.push("/settings")} />;
}
