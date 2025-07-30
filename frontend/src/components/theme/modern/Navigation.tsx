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
import { ArrowRightIcon } from "lucide-react";
import { DynamicLogo } from "@/shared/components/DynamicLogo";
import { useAuth } from "@/shared/lib/useAuth";
import { NavigationItem } from "@/shared/components/Navigation";

interface NavigationProps {
  items?: NavigationItem[];
}

export const Navigation: React.FC<NavigationProps> = ({ items }) => {
  const { t } = useTranslation();
  const { handleLogin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Modern Navigation */}
      <Navbar
        onMenuOpenChange={setIsMenuOpen}
        maxWidth="full"
        className="mt-0 rounded-full bg-white/95 backdrop-blur-[10px] border-1 border-white/20 fixed top-2 sm:top-5 max-w-7xl mx-auto"
        height="66px"
        isBordered={false}
      >
        <NavbarContent>
          <NavbarMenuToggle
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="sm:hidden text-gray-700"
          />
          <div className="flex justify-start bg-transparent w-max">
            <Link href="/">
              <DynamicLogo alt="Platform Logo" className="h-[20px]" />
            </Link>
          </div>
          <div className="hidden lg:flex gap-6 justify-center">
            {items?.map((item) => (
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
        </NavbarContent>
        <NavbarContent justify="end" className="items-center gap-2 sm:gap-4">
          <div className="hidden sm:block">
            <Button
              color="primary"
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 flex items-center justify-center gap-4 pr-1 h-[45px] shadow-lg"
              radius="full"
              onPress={handleLogin}
            >
              <b className="text-md">{t("Get Started")}</b>
              <div className="w-8 h-8 bg-white/20 flex items-center justify-center rounded-full">
                <ArrowRightIcon
                  size={16}
                  className="transition-transform duration-200 ease-in-out group-hover:translate-x-[3px] text-white"
                />
              </div>
            </Button>
          </div>
          <div className="sm:hidden">
            <Button
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
              onPress={handleLogin}
              size="sm"
            >
              <b className="text-md">{t("Get Started")}</b>
            </Button>
          </div>
        </NavbarContent>
        <NavbarMenu className="pt-6 pb-6 bg-white/95 backdrop-blur-sm">
          <NavbarMenuItem className="mt-4">
            <Button
              color="primary"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-between gap-4 pr-1 h-[45px]"
              radius="full"
              onPress={handleLogin}
            >
              <b className="text-md">{t("Get Started")}</b>
              <div className="w-8 h-8 bg-white/20 flex items-center justify-center rounded-full">
                <ArrowRightIcon
                  size={16}
                  className="transition-transform duration-200 ease-in-out group-hover:translate-x-[3px]"
                />
              </div>
            </Button>
          </NavbarMenuItem>
        </NavbarMenu>
      </Navbar>
    </>
  );
};
