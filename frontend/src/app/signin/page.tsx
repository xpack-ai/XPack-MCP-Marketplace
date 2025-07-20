"use client";

import React, { useEffect, Suspense } from "react";
import { Spinner } from "@nextui-org/react";
import { Toaster } from "react-hot-toast";
import SignInComponent from "./components/SignIn";
import { useTranslation } from "@/shared/lib/useTranslation";
import { useSearchParams } from "next/navigation";
import { useLogin } from "@/hooks/useLogin";
import { useSharedStore } from "@/shared/store/share";
import { useGlobalStore } from "@/shared/store/global";
import { DynamicLogo } from "@/shared/components/DynamicLogo";

export interface LoginFormData {
  user_email: string;
  password?: string;
  nick_name?: string;
}

const LoginHeader = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center pb-6">
      <DynamicLogo
        alt="Platform Logo"
        className="h-[40px]"
      />
      <p className="text-xl font-medium mt-4">{t("Welcome")}</p>
      <p className="text-sm text-default-500">
        {t("Log in to your account to continue")}
      </p>
    </div>
  );
};

export type StepState = "init" | "emailForm" | "verifyEmail";

const LoginPageContent = () => {
  const searchParams = useSearchParams();
  const [user_token] = useSharedStore((state: any) => [state.user_token]);
  const [getUser] = useGlobalStore((state) => [state.getUser]);
  const { afterLoginSuccess } = useLogin();

  const handleCheckLogin = async () => {
    const res = await getUser();
    if (res.success) {
      afterLoginSuccess(searchParams, {
        is_register: res.data.register,
        user_token: user_token || "",
      });
    }
  };

  useEffect(() => {
    handleCheckLogin();
  }, []);

  return (
    <>
      <div className="flex flex-col items-center justify-center w-full h-full mt-20">
        <LoginHeader />
        <SignInComponent />
        <Toaster />
      </div>
    </>
  );
};

const LoginPage = () => {
  return (
    <Suspense fallback={<div className="flex justify-center mt-40"><Spinner size="lg" color="default" /></div>}>
      <LoginPageContent />
    </Suspense>
  );
};

export default LoginPage;