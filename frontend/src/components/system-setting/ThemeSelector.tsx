"use client";

import React from "react";
import { Card, CardBody, CardFooter } from "@nextui-org/react";
import { Theme } from "@/shared/types/system";
import DefaultDemo from "../theme/default/Demo";
import ModernDemo from "../theme/modern/Demo";
import ClassicDemo from "../theme/classic/Demo";
import CreativeDemo from "../theme/creative/Demo";
import TemuDemo from "../theme/temu/Demo";
import "./ThemeCardPanel.css";
import { useTranslation } from "react-i18next";

// Available theme options
export const THEME_OPTIONS = [
  {
    value: Theme.DEFAULT,
    label: "Default",
    description: "Standard layout with clean and simple design",
    component: DefaultDemo,
  },
  {
    value: Theme.MODERN,
    label: "Modern",
    description: "Clean and minimalist design with modern UI elements",
    component: ModernDemo,
  },
  {
    value: Theme.CLASSIC,
    label: "Classic",
    description: "Traditional layout with professional appearance",
    component: ClassicDemo,
  },
  {
    value: Theme.CREATIVE,
    label: "Creative",
    description: "Bold and artistic design with vibrant colors",
    component: CreativeDemo,
  },
  {
    value: Theme.TEMU,
    label: "Temu",
    description: "E-commerce style with vibrant orange gradient background",
    component: TemuDemo,
  },
] as const;

interface ThemeSelectorProps {
  value: Theme;
  onChange: (theme: Theme) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  value,
  onChange,
}) => {
  const { t } = useTranslation();
  return (
    <div className="xpack-theme-card-panel-grid gap-4">
      {THEME_OPTIONS.map((theme) => {
        const DemoComponent = theme.component;
        const isSelected = value === theme.value;
        return (
          <Card
            key={theme.value}
            isPressable
            onPress={() => onChange(theme.value)}
            className={`transition-all duration-200 border-1 hover:border-blue-300 ${
              isSelected
                ? "border-blue-200 ring-1 ring-blue-200"
                : "border-gray-200"
            }`}
            shadow="none"
            radius="lg"
          >
            <CardBody className="p-0">
              {/* Theme Preview */}
              <div className="border-b-1">
                <div className="aspect-video w-full">
                  <DemoComponent />
                </div>
              </div>
            </CardBody>
            <CardFooter>
              {/* Theme Info */}
              <div className="space-y-2 w-full text-left">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">
                    {t(theme.label)}
                  </h4>
                  <div
                    className={`h-4 w-4 rounded-full border-2 transition-colors duration-200 ${
                      isSelected
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300"
                    }`}
                  >
                    {isSelected && (
                      <div className="h-full w-full rounded-full bg-white scale-50"></div>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600">{t(theme.description)}</p>
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};
