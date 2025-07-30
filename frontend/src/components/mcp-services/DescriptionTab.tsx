"use client";

import React from "react";
import { useTranslation } from "@/shared/lib/useTranslation";
import { MCPServiceFormData } from "@/types/mcp-service";
import dynamic from "next/dynamic";

// dynamic import MDEditor to avoid SSR problem
const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false }
);

interface DescriptionTabProps {
  formData: MCPServiceFormData;
  onInputChange: (field: keyof MCPServiceFormData, value: any) => void;
}

export const DescriptionTab: React.FC<DescriptionTabProps> = ({
  formData,
  onInputChange,
}) => {
  const { t } = useTranslation();

  const handleMarkdownChange = (value?: string) => {
    onInputChange("long_description", value || "");
  };

  return (
    <div className="space-y-4 h-full">
      <div className="w-full h-full">
        <MDEditor
          value={formData.long_description || ""}
          onChange={handleMarkdownChange}
          preview="live"
          hideToolbar={false}
          visibleDragbar={true}
          textareaProps={{
            placeholder: t("Detailed description of the service"),
            style: {
              fontSize: 14,
              lineHeight: 1.5,
              fontFamily:
                'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
            },
          }}
          height="100%"
          data-color-mode="light"
        />
      </div>
    </div>
  );
};
