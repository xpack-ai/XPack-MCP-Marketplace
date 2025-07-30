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
      {/* Creative Navigation */}
      <Navbar
        onMenuOpenChange={setIsMenuOpen}
        maxWidth="full"
        className="bg-white/95 backdrop-blur-[15px] border-b border-pink-200/50 shadow-sm fixed top-0 left-0 right-0 z-50 "
        height="66px"
        isBordered={false}
        position="static"
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
              className="bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 hover:from-pink-600 hover:via-red-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-4 pr-1 h-[45px]"
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
              className="bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 text-white"
              onPress={handleLogin}
              size="sm"
            >
              <b className="text-md">{t("Get Started")}</b>
            </Button>
          </div>
        </NavbarContent>
        <NavbarMenu className="pt-6 pb-6 bg-white/95 backdrop-blur-sm border-l border-pink-200/50">
          <NavbarMenuItem className="mt-4">
            <Button
              color="primary"
              className="w-full bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 text-white flex items-center justify-between gap-4 pr-1 h-[45px]"
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
        {/* Floating Elements - Demo Style */}
        <div className="absolute top-4 -right-12 w-8 h-8 bg-gradient-to-r from-pink-400/30 to-red-400/30 rounded-full transform rotate-45 z-50"></div>
        <div className="absolute top-12 -right-8 w-4 h-4 bg-gradient-to-r from-orange-400/40 to-yellow-400/40 rounded-full z-50"></div>
        <div className="absolute bottom-8 left-2 w-6 h-6 bg-gradient-to-r from-red-400/30 to-pink-400/30 rounded-full transform -rotate-12 z-50"></div>
        <div className="absolute bottom-4 left-8 w-3 h-3 bg-gradient-to-r from-yellow-400/40 to-orange-400/40 rounded-full z-50"></div>
        {/* Decorative Shapes - Demo Style */}
        <div className="absolute top-0 left-1/2 w-16 h-16 bg-gradient-to-br from-pink-300/20 to-orange-300/20 rounded-full transform -translate-x-1/2 -translate-y-8 rotate-45 z-50"></div>
        <div className="absolute bottom-0 -right-10 w-12 h-12 bg-gradient-to-tl from-orange-300/20 to-yellow-300/20 transform translate-x-6 translate-y-6 rotate-12 z-50">
          <div className="w-full h-full rounded-2xl"></div>
        </div>
      </Navbar>
    </>
  );
};
