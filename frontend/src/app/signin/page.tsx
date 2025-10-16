"use client";

import React, { useEffect, Suspense } from "react";
import { Spinner } from "@nextui-org/react";
import SignInComponent from "./components/SignIn";
import { useSearchParams } from "next/navigation";
import { useLogin } from "@/shared/hooks/useLogin";
import { useSharedStore } from "@/shared/store/share";
import { useGlobalStore } from "@/shared/store/global";

export interface LoginFormData {
  user_email: string;
  password?: string;
  nick_name?: string;
}

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
      <div className="flex flex-col items-center justify-center w-full h-full">
        <SignInComponent />
      </div>
    </>
  );
};

const LoginPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center">
          <Spinner size="lg" color="default" />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
};

export default LoginPage;
