"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Input,
  Tooltip,
} from "@nextui-org/react";
import { useTranslation } from "@/shared/lib/useTranslation";
import { Plus, Trash2, GripVertical } from "lucide-react";
import {
  MCPAuthHeaderItem,
  MCPServiceFormData,
} from "@/shared/types/mcp-service";

interface HeadersManagementSettingsProps {
  formData: MCPServiceFormData;
  onInputChange: (field: keyof MCPServiceFormData, value: any) => void;
}

const defaultHeaderItem: MCPAuthHeaderItem = {
  name: "",
  value: "",
  description: "",
};

export const HeadersManagementSettings: React.FC<
  HeadersManagementSettingsProps
> = ({ formData, onInputChange }) => {
  const { t } = useTranslation();
  const draggableRef = useRef<HTMLTableRowElement>(null);
  const currentPointerDownElement = useRef<any>(null);

  // 保证最后一行始终为空的工具函数
  function isHeaderEmpty(h: MCPAuthHeaderItem): boolean {
    return !(
      (h.name ?? "").trim() ||
      (h.value ?? "").trim() ||
      (h.description ?? "").trim()
    );
  }
  function ensureLastEmptyRow(list: MCPAuthHeaderItem[]): MCPAuthHeaderItem[] {
    const arr =
      list && list.length > 0 ? [...list] : [{ ...defaultHeaderItem }];

    // 移除多余的尾部空行，最多保留一个
    while (
      arr.length > 1 &&
      isHeaderEmpty(arr[arr.length - 1]) &&
      isHeaderEmpty(arr[arr.length - 2])
    ) {
      arr.pop();
    }

    const last = arr[arr.length - 1];
    if (!isHeaderEmpty(last)) {
      arr.push({ ...defaultHeaderItem });
    }
    return arr;
  }

  const [headers, setHeaders] = useState<MCPAuthHeaderItem[]>(
    ensureLastEmptyRow(
      formData.headers && formData.headers.length > 0
        ? formData.headers
        : [{ ...defaultHeaderItem }]
    )
  );
  const draggedItem = useRef<number | null>(null);
  const draggedOverItem = useRef<number | null>(null);

  useEffect(() => {
    setHeaders(
      ensureLastEmptyRow(
        formData.headers && formData.headers.length > 0
          ? formData.headers
          : [{ ...defaultHeaderItem }]
      )
    );
  }, [formData.headers]);

  const handleHeaderChange = (
    index: number,
    field: keyof MCPAuthHeaderItem,
    value: string
  ) => {
    const newHeaders = headers.map((header, idx) =>
      idx === index ? { ...header, [field]: value } : header
    );

    const ensured = ensureLastEmptyRow(newHeaders);
    setHeaders(ensured);
    onInputChange(
      "headers",
      ensured.filter((h) => !isHeaderEmpty(h))
    );
  };

  const handleDelete = (index: number) => {
    const next =
      headers.length <= 1
        ? [{ ...defaultHeaderItem }]
        : headers.filter((_, idx) => idx !== index);

    const ensured = ensureLastEmptyRow(next);
    setHeaders(ensured);
    onInputChange(
      "headers",
      ensured.filter((h) => !isHeaderEmpty(h))
    );
  };

  const handleDragStart = (e: DragEvent, index: number) => {
    if (currentPointerDownElement.current.tagName === "INPUT") {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    draggedItem.current = index;
  };

  const handleDragEnter = (index: number) => {
    draggedOverItem.current = index;
  };

  const watchDragStart = (e: PointerEvent) => {
    currentPointerDownElement.current = e.target;
  };
  useEffect(() => {
    if (!draggableRef.current) return;
    draggableRef.current.addEventListener("pointerdown", watchDragStart);
    return () => {
      draggableRef.current?.removeEventListener("pointerdown", watchDragStart);
    };
  }, [draggableRef.current]);

  const handleDragEnd = () => {
    if (draggedItem.current !== null && draggedOverItem.current !== null) {
      const draggedItemIndex = draggedItem.current;
      const draggedOverItemIndex = draggedOverItem.current;

      if (draggedItemIndex !== draggedOverItemIndex) {
        const newHeaders = [...headers];
        const draggedItemContent = newHeaders[draggedItemIndex];
        newHeaders.splice(draggedItemIndex, 1);
        newHeaders.splice(draggedOverItemIndex, 0, draggedItemContent);
        const ensured = ensureLastEmptyRow(newHeaders);
        setHeaders(ensured);
        onInputChange(
          "headers",
          ensured.filter((h) => !isHeaderEmpty(h))
        );
      }
    }
    draggedItem.current = null;
    draggedOverItem.current = null;
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{t("Request Headers")}</label>

      {/* Headers Table */}
      <Table
        aria-label="Headers management table"
        className="border-1 rounded-lg overflow-hidden"
        removeWrapper
        classNames={{
          thead: "[&>tr]:first:rounded-none",
          th: "first:rounded-none last:rounded-none",
        }}
        ref={draggableRef}
      >
        <TableHeader>
          <TableColumn className="w-8">{t("Order")}</TableColumn>
          <TableColumn className="w-1/4">{t("Key")}</TableColumn>
          <TableColumn className="w-1/4">{t("Value")}</TableColumn>
          <TableColumn>{t("Description")}</TableColumn>
          <TableColumn className="w-8">{t("Actions")}</TableColumn>
        </TableHeader>
        <TableBody emptyContent={t("No headers available.")}>
          {headers.map((header, index) => (
            <TableRow
              key={index}
              draggable
              onDragStart={(e) =>
                handleDragStart(e as unknown as DragEvent, index)
              }
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className="[&>*:not(:first-child)]:pointer-events-none"
              style={{ cursor: "default" }}
            >
              <TableCell>
                <div className="flex items-center gap-2 cursor-move pointer-events-auto">
                  <GripVertical className="w-4 h-4 text-gray-400" />
                </div>
              </TableCell>
              <TableCell>
                <Input
                  value={header.name}
                  onValueChange={(value) =>
                    handleHeaderChange(index, "name", value)
                  }
                  placeholder={t("Enter header key")}
                  size="sm"
                  className="pointer-events-auto"
                />
              </TableCell>
              <TableCell>
                <Input
                  value={header.value}
                  onValueChange={(value) =>
                    handleHeaderChange(index, "value", value)
                  }
                  placeholder={t("Enter header value")}
                  size="sm"
                  className="pointer-events-auto"
                />
              </TableCell>
              <TableCell>
                <Input
                  value={header.description || ""}
                  onValueChange={(value) =>
                    handleHeaderChange(index, "description", value)
                  }
                  placeholder={t("Enter description")}
                  size="sm"
                  className="pointer-events-auto"
                />
              </TableCell>
              <TableCell>
                {index < headers.length - 1 && (
                  <div className="flex gap-1 pointer-events-auto">
                    <Tooltip content={t("Delete")} color="danger">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        onPress={() => handleDelete(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </Tooltip>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
