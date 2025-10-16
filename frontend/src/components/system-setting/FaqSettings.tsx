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
  Textarea,
  Tooltip,
} from "@nextui-org/react";
import { useTranslation } from "@/shared/lib/useTranslation";
import { GripVertical, Trash2, Plus } from "lucide-react";
import { FaqItem } from "@/shared/types/system";

interface FaqSettingsProps {
  onSave?: (config: FaqItem[]) => void;
  config?: FaqItem[];
  labelPlacement?: "inside" | "outside";
}
const defaultFaqs = [{ question: "", answer: "" }];
export const FaqSettings: React.FC<FaqSettingsProps> = ({
  onSave,
  config = [],
  labelPlacement = "inside",
}) => {
  const { t } = useTranslation();
  const [faqs, setFaqs] = useState<FaqItem[]>(
    config && config.length > 0 ? config : defaultFaqs
  );
  const [isSaving, setIsSaving] = useState(false);
  const [focusedAnswer, setFocusedAnswer] = useState<number | null>(null);
  const draggedItem = useRef<number | null>(null);
  const draggedOverItem = useRef<number | null>(null);
  useEffect(() => {
    setFaqs(config && config.length > 0 ? config : defaultFaqs);
  }, [config]);

  const handleQuestionChange = (index: number, value: string) => {
    setFaqs((prev) =>
      prev.map((faq, idx) =>
        idx === index ? { ...faq, question: value } : faq
      )
    );
  };

  const handleAnswerChange = (index: number, value: string) => {
    setFaqs((prev) =>
      prev.map((faq, idx) => (idx === index ? { ...faq, answer: value } : faq))
    );
  };

  const handleDelete = (index: number) => {
    setFaqs((prev) => {
      // Ensure at least one record remains
      if (prev.length <= 1) {
        return defaultFaqs;
      }
      return prev.filter((_, idx) => idx !== index);
    });
  };

  const handleInsertBelow = (index: number) => {
    setFaqs((prev) => {
      const newFaqs = [...prev];
      newFaqs.splice(index + 1, 0, {
        question: "",
        answer: "",
      });
      return newFaqs;
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
        setFaqs((prev) => {
          const newFaqs = [...prev];
          const draggedItemContent = newFaqs[draggedItemIndex];
          newFaqs.splice(draggedItemIndex, 1);
          newFaqs.splice(draggedOverItemIndex, 0, draggedItemContent);
          return newFaqs;
        });
      }
    }
    draggedItem.current = null;
    draggedOverItem.current = null;
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await onSave?.(faqs.filter((faq) => faq.question && faq.answer));
    } finally {
      setIsSaving(false);
    }
  };
  const panelContent = () => {
    return (
      <div className="space-y-4">
        {/* FAQ Table */}
        <Table
          aria-label="FAQ management table"
          className="border-1 rounded-lg overflow-hidden"
          removeWrapper
          classNames={{
            thead: "[&>tr]:first:rounded-none",
            th: "first:rounded-none last:rounded-none",
          }}
        >
          <TableHeader>
            <TableColumn className="w-16">{t("Order")}</TableColumn>
            <TableColumn className="w-1/3">{t("Question")}</TableColumn>
            <TableColumn>{t("Answer")}</TableColumn>
            <TableColumn className="w-32">{t("Actions")}</TableColumn>
          </TableHeader>
          <TableBody emptyContent={t("No FAQ items available.")}>
            {faqs.map((faq, index) => (
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
                    value={faq.question}
                    onValueChange={(value) =>
                      handleQuestionChange(index, value)
                    }
                    size="sm"
                    placeholder={t("Enter question")}
                  />
                </TableCell>
                <TableCell>
                  <div className="relative">
                    <Input
                      value={faq.answer}
                      onValueChange={(value) =>
                        handleAnswerChange(index, value)
                      }
                      onFocus={() => setFocusedAnswer(index)}
                      size="sm"
                      placeholder={t("Enter answer")}
                    />
                    {focusedAnswer === index && (
                      <div className="absolute top-0 left-0 right-0 z-50">
                        <Textarea
                          value={faq.answer}
                          onValueChange={(value) =>
                            handleAnswerChange(index, value)
                          }
                          size="sm"
                          minRows={3}
                          onBlur={() => setFocusedAnswer(null)}
                          autoFocus
                        />
                      </div>
                    )}
                  </div>
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

        <div className="flex ">
          <Button
            color="primary"
            onPress={handleSaveAll}
            isLoading={isSaving}
            isDisabled={faqs.length === 0}
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
      defaultExpandedKeys={["faq"]}
    >
      <AccordionItem
        key="faq"
        title={
          <div className="flex flex-col justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              {t("FAQ Management")}
            </h3>
            <p className="text-sm text-gray-500">
              {t("Configure frequently asked questions for your users")}
            </p>
          </div>
        }
      >
        {panelContent()}
      </AccordionItem>
    </Accordion>
  );
};
