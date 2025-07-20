"use client";

import { Suspense } from "react";
import { AdminLoginForm } from "./AdminLoginForm";

const AdminSignInComponent = () => {

  return (
    <>
      <div className="mt-2 flex w-full max-w-sm flex-col gap-8 rounded-large bg-content1 px-8 py-6 shadow-small backdrop-blur-sm">
        <AdminLoginForm />
      </div>
    </>
  );
};

export default function AdminSignInWrapper() {
  return (
    <Suspense fallback={<></>}>
      <AdminSignInComponent />
    </Suspense>
  );
}