"use client";

import { Button } from "@nextui-org/react";
import { Icon } from "@iconify/react/dist/iconify.js";

interface LoginButtonProps {
  title: string;
  icon?: string;
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger";
  variant?:
    | "solid"
    | "bordered"
    | "light"
    | "flat"
    | "faded"
    | "shadow"
    | "ghost";
  onClick?: () => void;
}

export const LoginButton = ({
  title,
  icon,
  color = "default",
  variant = "bordered",
  onClick,
}: LoginButtonProps) => {
  return (
    <Button
      color={color}
      variant={variant}
      startContent={icon && <Icon icon={icon} width={20} />}
      onClick={onClick}
      className="w-full"
    >
      {title}
    </Button>
  );
};
