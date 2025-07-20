"use client";

import React, { useEffect, Suspense } from "react";
import { Spinner, Button } from "@nextui-org/react";
import { useLogin } from "@/hooks/useLogin";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useTranslation } from "@/shared/lib/useTranslation";

function LoginSuccessContent() {
  const { t } = useTranslation();
  const { loading, status, googleLoginRedirect } = useLogin();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams?.get("status") === "success") {
      return;
    }
    googleLoginRedirect();
  }, []);

  const backHome = () => {
    const dynamicParams = new URLSearchParams(searchParams?.get("state") || "");
    router.push(`/login?${dynamicParams.toString()}`);
  };

  return (
    <div className="flex flex-col items-center w-1/3 gap-4 mx-auto mt-40 xl:w-1/4 light">
      {loading ? (
        <Spinner size="lg" color="default" />
      ) : status === "success" ? (
        <>
          <Icon
            fontSize={70}
            className="text-success"
            icon="mi:circle-check"
          />
          <div className="text-xl font-bold text-success">
            {t("Login Success")}
          </div>
        </>
      ) : (
        <>
          <Icon
            fontSize={70}
            className="text-danger"
            icon="mi:circle-error"
          />
          <div className="text-xl font-bold text-danger">
            {t("Login Error")}
          </div>
          <Button onClick={backHome}>{t("Back Home")}</Button>
        </>
      )}
    </div>
  );
}

export default function LoginSuccessPage() {
  return (
    <Suspense fallback={<div className="flex justify-center mt-40"><Spinner size="lg" color="default" /></div>}>
      <LoginSuccessContent />
    </Suspense>
  );
}