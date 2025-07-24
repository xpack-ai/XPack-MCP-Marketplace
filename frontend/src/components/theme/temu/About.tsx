"use client";

import React from "react";
import { AboutContent } from "@/components/about/AboutContent";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { NavigationItem } from "@/shared/components/Navigation";

interface AboutProps {
  navItems?: NavigationItem[];
}

export const About: React.FC<AboutProps> = ({ navItems = [] }) => {
  return (
    <div className="min-h-screen bg-gray-50 absolute top-0 left-0 right-0 bottom-0 flex flex-col justify-between bg-white">
      <Navigation items={navItems} />

      <main className="flex-1 pt-32">
        <div className="max-w-7xl mx-auto px-6 pb-12">
          <AboutContent />
        </div>
      </main>

      <Footer />
    </div>
  );
};
