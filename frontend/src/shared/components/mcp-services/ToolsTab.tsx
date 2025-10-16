"use client";

import React, { useCallback } from "react";
import {
  Input,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react";
import { useTranslation } from "@/shared/lib/useTranslation";
import {
  MCPServiceAPIItem,
  MCPServiceFormData,
} from "@/shared/types/mcp-service";

interface ToolsTabProps {
  formData: MCPServiceFormData;
  onInputChange: (field: keyof MCPServiceFormData, value: any) => void;
  hideUrl?: boolean;
}

export const ToolsTab: React.FC<ToolsTabProps> = ({
  formData,
  onInputChange,
  hideUrl = false,
}) => {
  const { t } = useTranslation();

  const handleToolChange = useCallback(
    (index: number, field: keyof MCPServiceAPIItem, value: string) => {
      onInputChange(
        "apis",
        (formData.apis || []).map((api, i) =>
          i === index ? { ...api, [field]: value } : api
        )
      );
    },
    [formData.apis, onInputChange]
  );

  return (
    <div className="space-y-4">
      <Table
        aria-label="APIs table"
        removeWrapper
        className="border-1 rounded-lg overflow-hidden"
        classNames={{
          thead: "[&>tr]:first:rounded-none",
          th: "first:rounded-none last:rounded-none",
        }}
      >
        <TableHeader>
          <TableColumn className="w-1/4">{t("Tool Name")}</TableColumn>
          <TableColumn className="w-1/4" hidden={hideUrl}>
            {t("Tool URL")}
          </TableColumn>
          <TableColumn>{t("Description")}</TableColumn>
        </TableHeader>
        <TableBody
          emptyContent={t(
            "No tools added yet. Add your first tool using the input above."
          )}
        >
          {(formData.apis || []).map((tool, index) => (
            <TableRow key={`tool-${index}`}>
              <TableCell>
                <Input value={tool.name} size="sm" isDisabled />
              </TableCell>
              <TableCell hidden={hideUrl}>
                <Input value={tool.url} size="sm" isDisabled />
              </TableCell>
              <TableCell>
                <Input
                  value={tool.description || ""}
                  onChange={(e) =>
                    handleToolChange(index, "description", e.target.value)
                  }
                  size="sm"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
