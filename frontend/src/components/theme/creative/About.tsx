"use client";

import React from "react";
import { Card, CardBody } from "@nextui-org/react";
import { AboutContent } from "@/components/about/AboutContent";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { NavigationItem } from "@/shared/components/Navigation";

interface AboutProps {
  navItems?: NavigationItem[];
}

export const About: React.FC<AboutProps> = ({ navItems = [] }) => {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-pink-50 via-white to-blue-50">
      <Navigation items={navItems} />

      <main className="flex-1 relative mt-20">
        {/* Creative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-pink-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute top-1/3 -left-24 w-80 h-80 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-200 rounded-full opacity-20 blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
          <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white/80 backdrop-blur-sm">
            <CardBody className="p-8">
              <AboutContent />
            </CardBody>
          </Card>
        </div>
      </main>

      <div>
        <Footer />
      </div>
    </div>
  );
};
