"use client";

import { Button, Input } from "@nextui-org/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { StepState } from "../page";
import { useTranslation } from "@/shared/lib/useTranslation";

const emailSchema = z.object({
  email: z
    .string()
    .email({ message: "Invalid email address" })
    .min(1, { message: "Email is required" }),
});

type EmailFormData = z.infer<typeof emailSchema>;

interface LoginEmailFromProps {
  setEmail: (email: string) => void;
  setStep: (step: StepState) => void;
}

export const LoginEmailFrom = ({ setEmail, setStep }: LoginEmailFromProps) => {
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    mode: "all",
  });

  const onSubmit = async (data: EmailFormData) => {
    setEmail(data.email);
    setStep("verifyEmail");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            type="email"
            label={t("Email")}
            placeholder={t("Enter your email")}
            isInvalid={!!errors.email}
            errorMessage={t(errors.email?.message || "")}
            variant="bordered"
            color={errors.email ? "danger" : "default"}
            className={errors.email ? "border-danger" : ""}
          />
        )}
      />
      <Button
        type="submit"
        color="primary"
        isLoading={isSubmitting}
        className="w-full"
      >
        {t("Continue")}
      </Button>
    </form>
  );
};
