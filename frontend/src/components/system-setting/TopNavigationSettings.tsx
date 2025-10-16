"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  AccordionItem,
  Accordion,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Input,
  Tooltip,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { useTranslation } from "@/shared/lib/useTranslation";
import { Plus, Trash2, GripVertical } from "lucide-react";
import {
  TopNavigationItem,
  TopNavigationTargetEnum,
} from "@/shared/types/system";

interface TopNavigationSettingsProps {
  onSave?: (config: TopNavigationItem[]) => void;
  config?: TopNavigationItem[];
  labelPlacement?: "outside" | "inside";
}
const defaultNavigationItems = [
  { title: "", link: "", target: TopNavigationTargetEnum.BLANK },
];
export const TopNavigationSettings: React.FC<TopNavigationSettingsProps> = ({
  onSave,
  config = [],
  labelPlacement = "inside",
}) => {
  const { t } = useTranslation();
  const [navigationItems, setNavigationItems] = useState<TopNavigationItem[]>(
    config && config.length > 0 ? config : defaultNavigationItems
  );
  const [isSaving, setIsSaving] = useState(false);
  const draggedItem = useRef<number | null>(null);
  const draggedOverItem = useRef<number | null>(null);
  useEffect(() => {
    setNavigationItems(
      config && config.length > 0 ? config : defaultNavigationItems
    );
  }, [config]);

  const handleTitleChange = (index: number, value: string) => {
    setNavigationItems((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, title: value } : item
      )
    );
  };

  const handleHrefChange = (index: number, value: string) => {
    setNavigationItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, link: value } : item))
    );
  };

  const handleTargetChange = (
    index: number,
    target: TopNavigationTargetEnum
  ) => {
    setNavigationItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, target } : item))
    );
  };

  const handleDelete = (index: number) => {
    setNavigationItems((prev) => {
      // Ensure at least one record remains
      if (prev.length <= 1) {
        return defaultNavigationItems;
      }
      return prev.filter((_, idx) => idx !== index);
    });
  };

  const handleInsertBelow = (index: number) => {
    setNavigationItems((prev) => {
      const newItem: TopNavigationItem = {
        title: "",
        link: "",
        target: TopNavigationTargetEnum.BLANK,
      };
      const newItems = [...prev];
      newItems.splice(index + 1, 0, newItem);
      return newItems;
    });
  };

  const handleDragStart = (index: number) => {
    draggedItem.current = index;
  };

  const handleDragEnter = (index: number) => {
    draggedOverItem.current = index;
  };

  const handleDragEnd = () => {
    if (draggedItem.current !== null && draggedOverItem.current !== null) {
      const draggedItemIndex = draggedItem.current;
      const draggedOverItemIndex = draggedOverItem.current;

      if (draggedItemIndex !== draggedOverItemIndex) {
        setNavigationItems((prev) => {
          const newItems = [...prev];
          const draggedItemContent = newItems[draggedItemIndex];
          newItems.splice(draggedItemIndex, 1);
          newItems.splice(draggedOverItemIndex, 0, draggedItemContent);
          return newItems;
        });
      }
    }
    draggedItem.current = null;
    draggedOverItem.current = null;
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await onSave?.(navigationItems.filter((item) => item.title && item.link));
    } finally {
      setIsSaving(false);
    }
  };

  const panelContent = () => {
    return (
      <div className="space-y-4">
        {/* Navigation Table */}
        <Table
          aria-label="Navigation items management table"
          className="border-1 rounded-lg overflow-hidden"
          removeWrapper
          classNames={{
            thead: "[&>tr]:first:rounded-none",
            th: "first:rounded-none last:rounded-none",
          }}
        >
          <TableHeader>
            <TableColumn className="w-8">{t("Order")}</TableColumn>
            <TableColumn className="w-1/4">{t("Title")}</TableColumn>
            <TableColumn>{t("Link")}</TableColumn>
            <TableColumn className="w-32">{t("Target")}</TableColumn>
            <TableColumn className="w-8">{t("Actions")}</TableColumn>
          </TableHeader>
          <TableBody emptyContent={t("No navigation items available.")}>
            {navigationItems.map((item, index) => (
              <TableRow
                key={index}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                className="cursor-move"
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                  </div>
                </TableCell>
                <TableCell>
                  <Input
                    value={item.title}
                    onValueChange={(value) => handleTitleChange(index, value)}
                    placeholder={t("Enter title")}
                    size="sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={item.link}
                    onValueChange={(value) => handleHrefChange(index, value)}
                    placeholder={t("Enter link URL")}
                    size="sm"
                  />
                </TableCell>
                <TableCell>
                  <Select
                    selectedKeys={[item.target]}
                    onSelectionChange={(keys) => {
                      const target = Array.from(keys)[0] as
                        | TopNavigationTargetEnum.SELF
                        | TopNavigationTargetEnum.BLANK;
                      handleTargetChange(index, target);
                    }}
                    size="sm"
                    className="min-w-24"
                  >
                    <SelectItem
                      key={TopNavigationTargetEnum.SELF}
                      value={TopNavigationTargetEnum.SELF}
                    >
                      {t("Same Tab")}
                    </SelectItem>
                    <SelectItem
                      key={TopNavigationTargetEnum.BLANK}
                      value={TopNavigationTargetEnum.BLANK}
                    >
                      {t("New Tab")}
                    </SelectItem>
                  </Select>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Tooltip content={t("Insert below")}>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => handleInsertBelow(index)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </Tooltip>
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex">
          <Button
            color="primary"
            onPress={handleSaveAll}
            isLoading={isSaving}
            isDisabled={navigationItems.length === 0}
            size="sm"
          >
            {t("Save")}
          </Button>
        </div>
      </div>
    );
  };

  if (labelPlacement === "outside") {
    return panelContent();
  }

  return (
    <Accordion
      variant="splitted"
      itemClasses={{
        base: "shadow-none border-1",
      }}
      className="px-0"
      defaultExpandedKeys={["top-navigation"]}
    >
      <AccordionItem
        key="top-navigation"
        title={
          <div className="flex flex-col justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              {t("Top Navigation")}
            </h3>
            <p className="text-sm text-gray-500">
              {t("Configure top navigation menu items and links")}
            </p>
          </div>
        }
      >
        {panelContent()}
      </AccordionItem>
    </Accordion>
  );
};
