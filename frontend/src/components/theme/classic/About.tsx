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
    <div className="min-h-screen flex flex-col justify-between">
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 text-white">
        <Navigation items={navItems} />
      </div>

      <main className="flex-1 bg-gray-100 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <Card className="border border-gray-200 shadow-md rounded-md">
            <CardBody className="p-8">
              <AboutContent />
            </CardBody>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};
