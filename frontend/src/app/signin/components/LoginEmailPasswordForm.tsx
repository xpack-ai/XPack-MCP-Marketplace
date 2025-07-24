"use client";

import { Button, Input } from "@nextui-org/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTranslation } from "@/shared/lib/useTranslation";
import { useLogin } from "@/hooks/useLogin";
import { md5Encrypt } from "@/shared/utils/crypto";

const emailPasswordSchema = z.object({
  email: z
    .string()
    .email({ message: "Invalid email address" })
    .min(1, { message: "Email is required" }),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type EmailPasswordFormData = z.infer<typeof emailPasswordSchema>;

interface LoginEmailPasswordFormProps {
  onSuccess?: () => void;
}

export const LoginEmailPasswordForm = ({
  onSuccess,
}: LoginEmailPasswordFormProps) => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const { emailPasswordLogin } = useLogin();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<EmailPasswordFormData>({
    resolver: zodResolver(emailPasswordSchema),
    mode: "all",
  });

  const onSubmit = async (data: EmailPasswordFormData) => {
    try {
      await emailPasswordLogin({
        user_email: data.email,
        password: md5Encrypt(data.password),
      });
      onSuccess?.();
    } catch (error) {
      console.error("Login failed:", error);
    }
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
      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            type={showPassword ? "text" : "password"}
            label={t("Password")}
            placeholder={t("Enter your password")}
            isInvalid={!!errors.password}
            errorMessage={errors.password?.message}
            variant="bordered"
            color={errors.password ? "danger" : "default"}
            className={errors.password ? "border-danger" : ""}
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
          />
        )}
      />
      <Button
        type="submit"
        color="primary"
        isLoading={isSubmitting}
        className="w-full"
      >
        {t("Sign In")}
      </Button>
    </form>
  );
};
