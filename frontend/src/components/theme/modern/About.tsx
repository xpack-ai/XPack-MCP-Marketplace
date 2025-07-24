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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col justify-between">
      <Navigation items={navItems} />
      <div className="relative z-10 mt-20">
        {/* Clean Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        {/* Main Content */}
        <main className="flex-1 relative z-10">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <Card className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-lg rounded-2xl">
              <CardBody className="p-8">
                <AboutContent />
              </CardBody>
            </Card>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};
