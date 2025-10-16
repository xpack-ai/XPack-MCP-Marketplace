"use client";

import React, { useState } from "react";
import { Input, Button } from "@nextui-org/react";
import { Eye, EyeOff } from "lucide-react";
import { AdminConfig } from "@/types/system";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "@/shared/lib/useTranslation";

const formSchema = z.object({
  password: z
    .string()
    .min(1, "Password is required")
    .max(100, "Password is too long")
    .min(8, "Password must be at least 8 characters"),
  confirmPassword: z
    .string()
    .min(1, "Confirm password is required")
    .max(100, "Confirm password is too long")
    .min(8, "Confirm password must be at least 8 characters"),
});
type FormData = z.infer<typeof formSchema>;

interface AdminConfigFormProps {
  onSave: (config: AdminConfig) => Promise<boolean>;
}

export const AdminConfigForm: React.FC<AdminConfigFormProps> = ({ onSave }) => {
  const { t } = useTranslation();
  const {
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onSubmit = async (data: FormData) => {
    await onSave({
      password: data.password,
    } as AdminConfig);
  };
  const passwordsMatch = watch("password") === watch("confirmPassword");

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 pb-4"
    >
      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            label={t("Administrator Password")}
            placeholder={t("Enter administrator password")}
            description={t("Password must be at least 8 characters long")}
            isInvalid={!!errors.password}
            errorMessage={errors.password?.message}
            type={showPassword ? "text" : "password"}
            endContent={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-400" />
                )}
              </button>
            }
            isRequired
            autoComplete="new-password"
            labelPlacement="outside"
          />
        )}
      />
      <Controller
        name="confirmPassword"
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            label={t("Confirm Password")}
            placeholder={t("Confirm administrator password")}
            description={t("Re-enter the password to confirm")}
            isInvalid={
              !!errors.confirmPassword ||
              (!passwordsMatch && (field.value?.length || 0) > 0)
            }
            errorMessage={
              errors.confirmPassword?.message || t("Passwords do not match")
            }
            type={showConfirmPassword ? "text" : "password"}
            endContent={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="focus:outline-none"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-400" />
                )}
              </button>
            }
            autoComplete="new-password"
            isRequired
            labelPlacement="outside"
          />
        )}
      />

      <div className="flex mt-2">
        <Button
          type="submit"
          color="primary"
          isLoading={isSubmitting}
          isDisabled={!isValid}
          className="w-fit"
          size="sm"
        >
          {t("Save")}
        </Button>
      </div>
    </form>
  );
};
