"use client";

import React, { useEffect, useState } from "react";
import {
  Navbar,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Button,
} from "@nextui-org/react";
import { useTranslation } from "@/shared/lib/useTranslation";
import { useAuth } from "@/shared/lib/useAuth";
import { ArrowRightIcon } from "lucide-react";
import { DynamicLogo } from "@/shared/components/DynamicLogo";
import Link from "next/link";
import { useSharedStore } from "../store/share";
export type NavigationItem = {
  label: string;
  href: string;
  target?: string;
};

interface NavigationProps {
  items?: NavigationItem[];
  langNode?: React.ReactNode;
  navbarBrand?: React.ReactNode;
  onLogin?: () => void;
  classNames?: {
    logo?: string;
  };
  signinText?: string;
}

// Client-side wrapper for interactive functionality
function NavigationClient({
  items = [],
  langNode,
  navbarBrand,
  onLogin,
  classNames,
  signinText = "Get Started",
}: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useTranslation();
  const { handleLogin } = useAuth();

  const [userToken, setUserToken] = useState<string | null>(null);

  useEffect(() => {
    const userToken = useSharedStore?.getState?.().user_token
    setUserToken(userToken);
  }, []);

  return (
    <>
      {/* Main Navigation */}
      <Navbar
        onMenuOpenChange={setIsMenuOpen}
        maxWidth="full"
        /*
         * Rounded-pill navigation container with subtle border & backdrop blur
         * Matches the reference design that features a floating white bar with full-round corners.
         */
        className="mt-2 sm:mt-5 rounded-full bg-background/50 backdrop-blur-[10px] border-1 border-gray-100 top-2 sm:top-5 max-w-7xl mx-auto"
        height="66px"
        isBordered={false}
      >
        <NavbarContent>
          <NavbarMenuToggle
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="sm:hidden"
          />
          <div className="flex items-center gap-2 justify-start bg-transparent w-max">
            {/* Logo using dynamic platform config */}
            <Link href="/" prefetch>
              <DynamicLogo
                alt="Platform Logo"
                className={classNames?.logo || "h-[32px]"}
              />
            </Link>
            {navbarBrand}
          </div>
          {/* Desktop Navigation */}
          <div className="hidden lg:flex gap-2 justify-center">
            {items?.map((item) => (
              <NavbarItem key={item.href}>
                <Link
                  color="foreground"
                  href={item.href}
                  className="font-medium text-foreground-600 hover:text-foreground transition-colors px-2 py-1"
                  target={item?.target || "_self"}
                  prefetch={!item.target}
                >
                  {t(item.label)}
                </Link>
              </NavbarItem>
            ))}
          </div>
        </NavbarContent>

        {/* Right Side Actions */}
        <NavbarContent justify="end" className="items-center gap-2 sm:gap-4">
          {langNode ? (
            langNode
          ) : (
            <>
              {
                !userToken && (
                  <>
                  <Button onPress={handleLogin} variant="light">
                    <b className="text-md"> {t("Sign In")}</b>
                  </Button>
                  </>
                )
              }
            </>
          )}

          {/* Desktop Auth Button */}
          <div className="hidden sm:block">
            <Button
              color="primary"
              className="bg-black flex items-center justify-center gap-4 pr-1 h-[45px]"
              radius="full"
              onPress={onLogin || handleLogin}
            >
              <b className="text-md"> {userToken ? t("Dashboard") : t(signinText) }</b>
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-[#9ab0f2] flex items-center justify-center rounded-full">
                <ArrowRightIcon
                  size={16}
                  className="transition-transform duration-200 ease-in-out group-hover:translate-x-[3px]"
                />
              </div>
            </Button>
          </div>

          {/* Mobile Auth Button */}
          {!langNode && (
            <div className="sm:hidden">
              <Button
                color="primary"
                onPress={onLogin || handleLogin}
                size="sm"
              >
                <b className="text-md"> {userToken ? t("Dashboard") : t(signinText) }</b>
              </Button>
            </div>
          )}
        </NavbarContent>

        {/* Mobile Menu */}
        <NavbarMenu className="pt-6 pb-6">
          {items?.map((item, index) => (
            <NavbarMenuItem key={`${item.href}-${index}`}>
              <Link
                color="foreground"
                href={item.href}
                className="w-full py-2 font-medium text-sm"
                target={item?.target || "_self"}
                prefetch={!item.target}
              >
                {t(item.label)}
              </Link>
            </NavbarMenuItem>
          ))}
          <NavbarMenuItem className="mt-4">
            <Button
              color="primary"
              className="w-full bg-black flex items-center justify-between gap-4 pr-1 h-[45px]"
              radius="full"
              onPress={onLogin || handleLogin}
            >
              <b className="text-md"> {userToken ? t("Dashboard") : t(signinText) }</b>
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-[#9ab0f2] flex items-center justify-center rounded-full">
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
}

// Export the client component
export function Navigation(props: NavigationProps) {
  return <NavigationClient {...props} />;
}
