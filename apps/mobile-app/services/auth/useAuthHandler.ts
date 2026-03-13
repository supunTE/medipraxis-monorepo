import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "../../auth/AuthContext";
import {
  loginFormSchema as loginSchema,
  registerFormSchema as registerSchema,
  type LoginFormData,
  type RegisterFormData,
} from "@repo/models";

/**
 * Parses errors from API or Zod into user-friendly strings
 */
const parseError = (error: any): string => {
  if (!error) return "An unknown error occurred";

  // Handle Error object with stringified Zod errors in message
  if (error instanceof Error || (typeof error === "object" && error.message)) {
    const msg = error.message;
    try {
      // Check if message is a JSON array (like Zod errors)
      if (
        typeof msg === "string" &&
        (msg.startsWith("[") || msg.startsWith("{"))
      ) {
        const parsed = JSON.parse(msg);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0].message || "Validation failed";
        }
        if (parsed.message) return parsed.message;
        if (parsed.error) return parsed.error;
      }
    } catch {
      // Not JSON, just return the message
    }
    return msg;
  }

  if (typeof error === "string") return error;

  return error.error || error.message || JSON.stringify(error);
};

/**
 * Centralized hook for auth form handling
 */
export const useAuthHandler = (initialValues?: {
  phoneNumber?: string;
  countryCode?: string;
}) => {
  const { signIn, signUp, isLoading } = useAuth();

  // Login form setup
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      password: "",
      phoneNumber: initialValues?.phoneNumber || "",
      countryCode: initialValues?.countryCode || "+94",
      rememberMe: false,
    },
  });

  // Register form setup
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
      countryCode: "+94",
      agreed: false,
    },
  });

  const handleSignIn = async (data: LoginFormData) => {
    try {
      await signIn(data.phoneNumber, data.countryCode, data.password);
    } catch (error) {
      const message = parseError(error);
      // Map common login errors to fields
      if (
        message.toLowerCase().includes("credentials") ||
        message.toLowerCase().includes("password") ||
        message.toLowerCase().includes("invalid")
      ) {
        loginForm.setError("password", { message });
        return; // Don't re-throw
      } else if (
        message.toLowerCase().includes("phone") ||
        message.toLowerCase().includes("number") ||
        message.toLowerCase().includes("not found")
      ) {
        loginForm.setError("phoneNumber", { message });
        return; // Don't re-throw
      }
      throw new Error(message);
    }
  };

  const handleSignUp = async (data: RegisterFormData) => {
    try {
      await signUp(
        data.phoneNumber,
        data.countryCode,
        data.password,
        data.username
      );
    } catch (error) {
      const message = parseError(error);
      if (message === "Username already exists") {
        registerForm.setError("username", { message });
        return;
      } else if (message === "Mobile number already exists") {
        registerForm.setError("phoneNumber", { message });
        return;
      }
      throw new Error(message);
    }
  };

  return {
    isLoading,
    login: {
      form: loginForm,
      submit: async () => {
        let success = false;
        await loginForm.handleSubmit(async (data) => {
          await handleSignIn(data);
          if (Object.keys(loginForm.formState.errors).length === 0) {
            success = true;
          }
        })();
        return success;
      },
    },
    register: {
      form: registerForm,
      submit: async () => {
        let success = false;
        await registerForm.handleSubmit(async (data) => {
          await handleSignUp(data);
          if (Object.keys(registerForm.formState.errors).length === 0) {
            success = true;
          }
        })();
        return success;
      },
    },
  };
};
