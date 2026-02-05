import { CheckIcon, CircleNotchIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { ClientRegistrationFormValues } from "@/types/clientRegistration.types";
import {
  GENDER_OPTIONS,
  TITLE_OPTIONS,
  type ServerMessage,
} from "@/types/clientRegistration.types";
import type { UseFormReturn } from "react-hook-form";

type Props = {
  form: UseFormReturn<ClientRegistrationFormValues>;
  onSubmit: (values: ClientRegistrationFormValues) => void | Promise<void>;
  isPending: boolean;
  serverMessage: ServerMessage | null;
  onClearMessage: () => void;
};

const ClientRegistrationForm = ({
  form,
  onSubmit,
  isPending,
  serverMessage,
  onClearMessage,
}: Props) => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-2xl shadow-xl pb-0 border-none">
        <CardHeader>
          <CardTitle>Add your family member</CardTitle>
          <CardDescription>
            Enter your family member's details below to register them.
          </CardDescription>
        </CardHeader>

        <CardContent className="max-h-[70vh] overflow-y-auto">
          <Form {...form}>
            <form
              id="patient-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-5"
            >
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select title" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TITLE_OPTIONS.map((title) => (
                          <SelectItem key={title} value={title}>
                            {title}.
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* First Name */}
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jennifer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Last Name */}
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Gender */}
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="flex gap-4"
                      >
                        {GENDER_OPTIONS.map((gender) => (
                          <FormItem
                            key={gender}
                            className="flex items-center space-x-2"
                          >
                            <FormControl>
                              <RadioGroupItem value={gender} />
                            </FormControl>
                            <FormLabel className="capitalize">
                              {gender.toLowerCase()}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* DOB */}
              <FormField
                control={form.control}
                name="date_of_birth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Server Message */}
              {serverMessage && (
                <div
                  className={`p-3 rounded-lg text-sm flex justify-between ${
                    serverMessage.type === "success"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  <span>{serverMessage.text}</span>
                  <button type="button" onClick={onClearMessage}>
                    &times;
                  </button>
                </div>
              )}
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex justify-end bg-[#E3F0AF] h-16 rounded-b-2xl">
          <Button
            type="submit"
            form="patient-form"
            disabled={isPending}
            className="flex items-center bg-black text-white gap-2 hover:bg-gray-800"
          >
            {isPending ? (
              <>
                <CircleNotchIcon className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckIcon className="h-4 w-4" />
                Save
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ClientRegistrationForm;
