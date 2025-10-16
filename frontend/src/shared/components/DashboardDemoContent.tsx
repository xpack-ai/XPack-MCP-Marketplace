"use client";

import React from "react";
import { useTranslation } from "@/shared/lib/useTranslation";

interface DashboardDemoContentProps {
  children: React.ReactNode;
  title: string | React.ReactNode;
  description: string;
}

const DashboardDemoContent: React.FC<DashboardDemoContentProps> = ({
  children,
  title,
  description,
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col  h-full overflow-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {typeof title === "string" ? t(title) : title}
        </h1>
        <p className="text-default-600">{t(description)}</p>
      </div>
      {children}
    </div>
  );
};

export default DashboardDemoContent;
