"use client";

import React, { Suspense, useEffect } from "react";
import { Spinner } from "@nextui-org/react";
import { Toaster } from "react-hot-toast";
import AdminSignInComponent from "./components/AdminSignIn";
import { useTranslation } from "@/shared/lib/useTranslation";
import { DynamicLogo } from "@/shared/components/DynamicLogo";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/store/admin";

const AdminLoginHeader = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center pb-6">
      <DynamicLogo alt="Platform Logo" className="h-[40px]" />
      <p className="text-xl font-medium mt-4">{t("Welcome")}</p>
      <p className="text-sm text-default-500">
        {t("Log in to your admin account to continue")}
      </p>
    </div>
  );
};

const AdminLoginPageContent = () => {
  const [getAdminUser] = useAdminStore((state) => [state.getAdminUser]);
  const router = useRouter();

  const handleCheckLogin = async () => {
    const res = await getAdminUser();
    if (res.success) {
      router.push("/admin/console");
    }
  };

  useEffect(() => {
    handleCheckLogin();
  }, []);
  return (
    <>
      <div className="flex flex-col items-center justify-center w-full h-full mt-20">
        <AdminLoginHeader />
        <AdminSignInComponent />
        <Toaster />
      </div>
    </>
  );
};

const AdminLoginPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center mt-40">
          <Spinner size="lg" color="default" />
        </div>
      }
    >
      <AdminLoginPageContent />
    </Suspense>
  );
};

export default AdminLoginPage;
