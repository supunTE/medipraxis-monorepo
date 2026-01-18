import { CheckCircleIcon } from "@phosphor-icons/react";
import { XIcon } from "@phosphor-icons/react/dist/ssr";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group text-balance"
      position="top-center"
      icons={{
        success: <CheckCircleIcon className="size-4" />,
        error: <XIcon className="size-4" />,
      }}
      toastOptions={{
        classNames: {
          toast: "px-6 py-4 min-w-[200px]",
          title: "text-base font-semibold",
          description: "text-base",
          icon: "px-4",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
