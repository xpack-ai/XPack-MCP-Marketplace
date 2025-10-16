"use client";

import React from "react";
import { Input, Chip, Textarea } from "@nextui-org/react";
import { useTranslation } from "@/shared/lib/useTranslation";
import { MCPServiceFormData } from "@/shared/types/mcp-service";

interface McpConfigTabProps {
  formData: MCPServiceFormData;
  newTag: string;
  setNewTag: (value: string) => void;
  onInputChange: (field: keyof MCPServiceFormData, value: any) => void;
  onAddTag: () => void;
  onRemoveTag: (tagToRemove: string) => void;
}

export const McpConfigTab: React.FC<McpConfigTabProps> = ({
  formData,
  newTag,
  setNewTag,
  onInputChange,
  onAddTag,
  onRemoveTag,
}) => {
  const { t } = useTranslation();

  // For imported servers, show full form
  return (
    <div className="space-y-4">
      <Input
        label={t("Server Name")}
        placeholder={t("Enter server name")}
        value={formData.name}
        onChange={(e) => onInputChange("name", e.target.value)}
        isRequired
      />

      <Input
        label={t("Short Description")}
        placeholder={t("Brief description of the server")}
        value={formData.short_description || ""}
        onChange={(e) => onInputChange("short_description", e.target.value)}
        isRequired
      />

      <Textarea
        label={t("Server Config")}
        placeholder={`{
  "mcpServers": {
    "github": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "GITHUB_PERSONAL_ACCESS_TOKEN",
        "mcp/github"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "<YOUR_TOKEN>"
      }
    }
  }
}`}
        value={formData.server_config || ""}
        onChange={(e) => onInputChange("server_config", e.target.value)}
        minRows={1}
        maxRows={25}
        description={t("JSON configuration for the MCP server")}
        isRequired
        className="text-xs"
      />

      {/* tag management */}
      <div className="space-y-2">
        <label className="text-sm font-medium">{t("Tags")}</label>
        <div className="flex gap-2">
          <Input
            placeholder={t("Add tag")}
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyUp={(e) => e.key === "Enter" && onAddTag()}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(formData.tags || []).map((tag, index) => (
            <Chip key={index} onClose={() => onRemoveTag(tag)} variant="flat">
              {tag}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
};
