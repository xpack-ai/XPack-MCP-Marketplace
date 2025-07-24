"use client";

import React, { useState, useEffect } from "react";
import { calculateFileSha256 } from "@/shared/utils/crypto";
import {
  Input,
  Button,
  AccordionItem,
  Accordion,
  Select,
  SelectItem,
} from "@nextui-org/react";
import MDEditor, { commands } from "@uiw/react-md-editor";
import { PlatformConfig, Theme } from "@/shared/types/system";
import { useTranslation } from "@/shared/lib/useTranslation";
import { SUPPORTED_LANGUAGES } from "@/shared/lib/i18n";
import { ThemeSelector } from "./ThemeSelector";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

interface PlatformConfigFormProps {
  config: PlatformConfig;
  onSave: (config: PlatformConfig) => void;
  onThemeChange?: (theme: Theme) => Promise<void>;
  onAboutSave?: (aboutContent: string) => Promise<void>;
  onImageUpload?: (file: File, sha256?: string) => Promise<string>;
  isLoading?: boolean;
  isAboutLoading?: boolean;
}

export const PlatformConfigForm: React.FC<PlatformConfigFormProps> = ({
  config,
  onSave,
  onThemeChange,
  onAboutSave,
  onImageUpload,
  isLoading = false,
  isAboutLoading = false,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<PlatformConfig>(config);

  // when context config updated, sync to form
  useEffect(() => {
    setFormData(config);
  }, [config]);

  const handleInputChange = (field: keyof PlatformConfig, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    onSave(formData);
  };

  const handleThemeChange = async (theme: Theme) => {
    handleInputChange("theme", theme);
    onThemeChange?.(theme);
  };

  const handleAboutSave = async () => {
    onAboutSave?.(formData.about_page || "");
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      // 计算文件的 SHA256 哈希值
      const sha256 = await calculateFileSha256(file);
      return await onImageUpload!(file, sha256);
    } catch (error) {
      console.error("Image upload failed:", error);
      throw error;
    }
  };

  return (
    <div className="space-y-4">
      {/* Platform Information Accordion */}
      <Accordion
        variant="splitted"
        itemClasses={{
          base: "shadow-none border-1",
        }}
        defaultExpandedKeys={["platform-config"]}
        className="px-0"
      >
        <AccordionItem
          key="platform-config"
          title={
            <div className="flex flex-col justify-between">
              <h3 className="text-lg font-semibold">
                {t("Platform Information")}
              </h3>
              <p className="text-sm text-gray-500">
                {t("Configure platform logo, name, titles, and language")}
              </p>
            </div>
          }
        >
          <div className="space-y-4">
            {/* platform name */}
            <Input
              label={t("Platform Name")}
              placeholder={t("Enter platform name")}
              description={t("The name displayed across the platform")}
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
            />

            {/* platform logo */}
            <Input
              label={t("Platform Logo URL")}
              placeholder="https://example.com/logo.png"
              description={t("URL of the platform logo image (optional)")}
              value={formData.logo || ""}
              onChange={(e) => handleInputChange("logo", e.target.value)}
            />

            {/* website title */}
            <Input
              label={t("Website Title")}
              placeholder={t("Enter website title")}
              description={t(
                "The title displayed in browser tab and search results"
              )}
              value={formData.website_title || ""}
              onChange={(e) =>
                handleInputChange("website_title", e.target.value)
              }
            />

            {/* homepage headline */}
            <Input
              label={t("Headline")}
              placeholder={t("Enter homepage headline")}
              description={t("Main headline displayed on the homepage")}
              value={formData.headline || ""}
              onChange={(e) => handleInputChange("headline", e.target.value)}
            />

            {/* homepage subheadline */}
            <Input
              label={t("Subheadline")}
              placeholder={t("Enter homepage subheadline")}
              description={t(
                "Secondary headline displayed below the main headline"
              )}
              value={formData.subheadline || ""}
              onChange={(e) => handleInputChange("subheadline", e.target.value)}
            />

            {/* platform language */}
            <Select
              label={t("Platform Language")}
              placeholder={t("Select platform language")}
              selectedKeys={formData.language ? [formData.language] : ["en"]}
              onSelectionChange={(keys) => {
                const selectedKey = Array.from(keys)[0] as string;
                if (selectedKey) {
                  handleInputChange("language", selectedKey);
                }
              }}
            >
              {SUPPORTED_LANGUAGES.map((language) => (
                <SelectItem key={language.name} value={language.name}>
                  {language.label}
                </SelectItem>
              ))}
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 py-4">
            <Button
              color="primary"
              variant="solid"
              onPress={handleSave}
              isLoading={isLoading}
              size="sm"
            >
              {t("Save")}
            </Button>
          </div>
        </AccordionItem>
      </Accordion>

      {/* About Page Accordion */}
      <Accordion
        variant="splitted"
        itemClasses={{
          base: "shadow-none border-1",
        }}
        className="px-0"
      >
        <AccordionItem
          key="about-config"
          title={
            <div className="flex flex-col justify-between">
              <h3 className="text-lg font-semibold">
                {t("About Page Content")}
              </h3>
              <p className="text-sm text-gray-500">
                {t("Configure about page content")}
              </p>
            </div>
          }
        >
          <div className="space-y-4">
            <MDEditor
              value={formData.about_page || ""}
              onChange={(value?: string) =>
                handleInputChange("about_page", value || "")
              }
              preview="live"
              hideToolbar={false}
              visibleDragbar={false}
              data-color-mode="light"
              textareaProps={{
                placeholder: t("Enter about page content (supports Markdown)"),
                style: {
                  fontSize: 14,
                  lineHeight: 1.6,
                  fontFamily:
                    'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                },
              }}
              height={300}
              commands={[
                // 默认命令
                commands.bold,
                commands.italic,
                commands.strikethrough,
                commands.hr,
                commands.title,
                commands.divider,
                commands.link,
                commands.quote,
                commands.code,
                commands.codeBlock,
                commands.comment,
                commands.divider,
                commands.unorderedListCommand,
                commands.orderedListCommand,
                commands.checkedListCommand,
                commands.divider,
                // 自定义图片上传命令
                {
                  name: "image-upload",
                  keyCommand: "image-upload",
                  buttonProps: {
                    "aria-label": "Upload image",
                    title: "Upload image",
                  },
                  icon: (
                    <svg width="12" height="12" viewBox="0 0 20 20">
                      <path
                        fill="currentColor"
                        d="M15 9c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm4-7H1c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1h18c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1zM2 17l4.5-6 3.5 4.51 2.5-3.01L17 17H2z"
                      />
                    </svg>
                  ),
                  execute: (state, api) => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.onchange = async (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        try {
                          const dataUrl = await handleImageUpload(file);
                          const imageMarkdown = `![${file.name}](${window.location.origin}${dataUrl})`;
                          api.replaceSelection(imageMarkdown);
                        } catch (error) {
                          console.error("Image upload failed:", error);
                        }
                      }
                    };
                    input.click();
                  },
                },
              ]}
            />
          </div>

          {/* About Save Button */}
          <div className="flex gap-3 py-4">
            <Button
              color="primary"
              variant="solid"
              onPress={handleAboutSave}
              isLoading={isAboutLoading}
              size="sm"
            >
              {t("Save")}
            </Button>
          </div>
        </AccordionItem>
      </Accordion>

      {/* Theme Accordion */}
      <Accordion
        variant="splitted"
        itemClasses={{
          base: "shadow-none border-1",
        }}
        className="px-0"
      >
        <AccordionItem
          key="theme-config"
          title={
            <div className="flex flex-col justify-between">
              <h3 className="text-lg font-semibold">{t("Theme")}</h3>
              <p className="text-sm text-gray-500">
                {t("Choose your preferred theme style")}
              </p>
            </div>
          }
        >
          <div className="space-y-4">
            <ThemeSelector
              value={formData.theme || Theme.DEFAULT}
              onChange={handleThemeChange}
            />
          </div>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
