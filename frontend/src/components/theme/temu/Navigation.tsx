"use client";

import React from "react";
import { Button } from "@nextui-org/react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { useState } from "react";
import {
  Navbar,
  NavbarContent,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from "@nextui-org/react";
import { DynamicLogo } from "@/shared/components/DynamicLogo";
import { useAuth } from "@/shared/lib/useAuth";
import { NavigationItem } from "@/shared/components/Navigation";
import { ArrowRightIcon } from "lucide-react";

interface NavigationProps {
  items?: NavigationItem[];
}

export const Navigation: React.FC<NavigationProps> = ({ items }) => {
  const { t } = useTranslation();
  const { handleLogin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Temu Style Navigation */}
      <Navbar
        onMenuOpenChange={setIsMenuOpen}
        maxWidth="full"
        className="mt-0 bg-white border-b border-gray-200 shadow-sm fixed top-0 z-50"
        height="70px"
        isBordered={false}
        classNames={{
          wrapper: "max-w-7xl mx-auto",
        }}
      >
        <NavbarContent>
          <NavbarMenuToggle
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="sm:hidden text-gray-700"
          />
          <div className="flex justify-start bg-transparent w-max">
            <Link href="/">
              <DynamicLogo alt="Platform Logo" className="h-[32px]" />
            </Link>
          </div>
          <div className="hidden lg:flex gap-8 justify-center ml-8">
            {items?.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                target={item.target}
                className="text-gray-700 hover:text-orange-500 font-medium transition-colors"
              >
                {t(item.label)}
              </Link>
            ))}
          </div>
        </NavbarContent>
        <NavbarContent justify="end" className="items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <Button onPress={handleLogin} variant="light">
              <b className="text-md"> {t("Sign In")}</b>
            </Button>
            <Button
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 h-[40px] transition-all duration-200"
              radius="md"
              onPress={handleLogin}
            >
              {t("Get Started")}
            </Button>
          </div>
          <div className="sm:hidden">
            <Button
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold"
              onPress={handleLogin}
              size="sm"
            >
              {t("Sign In")}
            </Button>
          </div>
        </NavbarContent>
        <NavbarMenu className="pt-6 pb-6 bg-white border-r border-gray-200">
          <NavbarMenuItem className="mb-4">
            <Link
              href="/"
              className="text-gray-700 hover:text-orange-500 font-medium text-lg"
            >
              Home
            </Link>
          </NavbarMenuItem>
          <NavbarMenuItem className="mt-6">
            <Button
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold h-[45px]"
              radius="md"
              onPress={handleLogin}
            >
              {t("Sign In")}
            </Button>
          </NavbarMenuItem>
        </NavbarMenu>
      </Navbar>
    </>
  );
};
