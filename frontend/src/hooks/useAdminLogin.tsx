"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/store/admin";
import { AdminLoginFormData } from "@/types/admin";
import toast from "react-hot-toast";
import i18n from "@/shared/lib/i18n";

export const useAdminLogin = () => {
  const [loading, setLoading] = useState(false);
  const { adminLogin: storeAdminLogin, adminLogOut } = useAdminStore();
  const router = useRouter();

  // admin login method
  const adminLogin = async (data: AdminLoginFormData) => {
    setLoading(true);

    try {
      const result = await storeAdminLogin(data.username, data.password);

      if (result.success) {
        // login success, redirect to console
        router.push("/console");
        toast.success(i18n.t("Login successful"));
        return { success: true };
      } else {
        // login failed, show error message
        toast.error(result.error_message || i18n.t("Login failed"));
        return { success: false, message: result.error_message };
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = "An error occurred during login";
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // admin logout method
  const adminLogout = () => {
    // call store logout method
    adminLogOut();
    // redirect to login page
    router.push("/admin-signin");
    toast.success(i18n.t("Logged out successfully"));
  };

  return {
    loading,
    adminLogin,
    adminLogout,
  };
};