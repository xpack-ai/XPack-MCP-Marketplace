"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@nextui-org/react";
import { useTranslation } from "react-i18next";

import { DynamicLogo } from "@/shared/components/DynamicLogo";
import { useAuth } from "@/shared/lib/useAuth";
import { NavigationItem } from "@/shared/components/Navigation";
import Link from "next/link";
import { useSharedStore } from "@/shared/store/share";

interface NavigationProps {
  items?: NavigationItem[];
}

export const Navigation: React.FC<NavigationProps> = ({ items }) => {
  const { t } = useTranslation();
  const { handleLogin } = useAuth();

  const [userToken, setUserToken] = useState<string | null>(null);

  useEffect(() => {
    const userToken = useSharedStore?.getState?.().user_token
    setUserToken(userToken);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Classic Header */}
      <div className="bg-slate-800 text-white px-4 py-2 ">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <DynamicLogo alt="Platform Logo" className="h-[32px] text-white" />
          </div>
          <div className="flex space-x-2">
            {
              !userToken && (
                <>
                  <Button
                    onPress={handleLogin}
                    variant="light"
                    className="hidden sm:block text-white text-sm px-4 py-1 rounded-sm font-medium"
                    size="sm"
                  >
                    <b className="text-md"> {t("Sign In")}</b>
                  </Button>
                </>
              )
            }
            <Button
              color="primary"
              className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-1 rounded-sm font-medium"
              size="sm"
              onPress={handleLogin}
            >
              {userToken ? t("Dashboard") : t("Get Started")}
            </Button>
          </div>
        </div>
      </div>

      {/* Classic Navigation */}
      <div className="bg-gray-100 border-b border-gray-300 px-4 py-2">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex space-x-6">
            {(
              items || [
                {
                  label: "Home",
                  href: "/",
                },
              ]
            )?.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                target={item.target}
                className="text-sm text-gray-500"
              >
                {t(item.label)}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
