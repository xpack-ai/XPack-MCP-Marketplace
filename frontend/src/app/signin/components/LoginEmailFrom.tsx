"use client";

import { Button, Input } from "@nextui-org/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { StepState } from "../page";
import { useTranslation } from "@/shared/lib/useTranslation";

const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type EmailFormData = z.infer<typeof emailSchema>;

interface LoginEmailFromProps {
  setEmail: (email: string) => void;
  setStep: (step: StepState) => void;
}

export const LoginEmailFrom = ({ setEmail, setStep }: LoginEmailFromProps) => {
  const { t } = useTranslation();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  const onSubmit = async (data: EmailFormData) => {
    setEmail(data.email);
    setStep("verifyEmail");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        {...register("email")}
        type="email"
        label={t("Email")}
        placeholder={t("Enter your email")}
        isInvalid={!!errors.email}
        errorMessage={errors.email?.message}
        variant="bordered"
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