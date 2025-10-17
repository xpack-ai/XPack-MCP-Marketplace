"use client";

import { Button, Input } from "@nextui-org/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { StepState } from "../page";
import { useTranslation } from "@/shared/lib/useTranslation";
import i18n from "@/shared/lib/i18n";

const emailSchema = z.object({
  email: z
    .string()
    .email({ message: i18n.t("Invalid email address") })
    .min(1, { message: i18n.t("Email is required") }),
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
    mode: "onBlur",
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
        size="lg"
        className="w-full font-semibold bg-default-900"
        isDisabled={!isValid}
      >
        {t("Continue")}
      </Button>
    </form>
  );
};
