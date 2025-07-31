"use client";

import React from "react";
import { usePlatformConfig } from "@/shared/contexts/PlatformConfigContext";
import { Theme } from "@/shared/types/system";
import { About as ModernAbout } from "@/components/theme/modern/About";
import { About as ClassicAbout } from "@/components/theme/classic/About";
import { About as CreativeAbout } from "@/components/theme/creative/About";
import { About as TemuAbout } from "@/components/theme/temu/About";
import { Navigation } from "@/shared/components/Navigation";
import { Footer } from "@/shared/components/Footer";
import { NavigationItems } from "@/components/theme/Theme.const";
import { AboutContent } from "@/components/about/AboutContent";

export const AboutThemeSelector: React.FC = () => {
  const { platformConfig, topNavigation } = usePlatformConfig();
  const currentTheme = platformConfig.theme || Theme.DEFAULT;
  const navigationItems = [
    ...NavigationItems,
    ...topNavigation.map((item) => ({
      label: item.title,
      href: item.link,
      target: item.target,
    })),
  ];

  // Render the About page based on the current theme
  switch (currentTheme) {
    case Theme.MODERN:
      return <ModernAbout navItems={navigationItems} />;
    case Theme.CLASSIC:
      return <ClassicAbout navItems={navigationItems} />;
    case Theme.CREATIVE:
      return <CreativeAbout navItems={navigationItems} />;
    case Theme.TEMU:
      return <TemuAbout navItems={navigationItems} />;
    case Theme.DEFAULT:
    default:
      return (
        <div className="min-h-screen bg-background flex flex-col justify-between">
          <Navigation items={navigationItems} />
          <main className="flex-1 max-w-7xl mx-auto px-4 py-8">
            <AboutContent />
          </main>
          <div>
            <Footer />
          </div>
        </div>
      );
  }
};
