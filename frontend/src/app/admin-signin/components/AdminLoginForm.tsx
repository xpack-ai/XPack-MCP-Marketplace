"use client";

import { Button, Input } from "@nextui-org/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "@/shared/lib/useTranslation";
import { useAdminLogin } from "@/hooks/useAdminLogin";
import toast from "react-hot-toast";

const adminLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// 使用本地定义的类型，与schema保持一致
type AdminLoginFormData = z.infer<typeof adminLoginSchema>;

export const AdminLoginForm = () => {
  const { t } = useTranslation();
  const { loading, adminLogin } = useAdminLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginFormData>({
    resolver: zodResolver(adminLoginSchema),
  });

  const onSubmit = async (data: AdminLoginFormData) => {
    await adminLogin(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        {...register("username")}
        type="text"
        label={t("Username")}
        placeholder={t("Enter your username")}
        isInvalid={!!errors.username}
        errorMessage={errors.username?.message}
        variant="bordered"
      />
      <Input
        {...register("password")}
        type="password"
        label={t("Password")}
        placeholder={t("Enter your password")}
        isInvalid={!!errors.password}
        errorMessage={errors.password?.message}
        variant="bordered"
      />
      <Button
        type="submit"
        color="primary"
        isLoading={loading}
        className="w-full mt-2"
      >
        {t("Login")}
      </Button>
    </form>
  );
};