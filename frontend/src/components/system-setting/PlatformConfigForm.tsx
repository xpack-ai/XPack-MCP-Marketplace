"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Input,
  Button,
  AccordionItem,
  Accordion,
  Select,
  SelectItem,
  Switch,
  Card,
  Spinner,
} from "@nextui-org/react";
import { PlatformConfig, Theme } from "@/shared/types/system";
import { useTranslation } from "@/shared/lib/useTranslation";
import { SUPPORTED_LANGUAGES } from "@/shared/lib/i18n";
import { ThemeSelector } from "./ThemeSelector";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import toast from "react-hot-toast";
import { UploadIcon } from "lucide-react";
import { calculateFileSha256 } from "@/shared/utils/crypto";
import { withComponentInjection } from "@/shared/hooks/useComponentInjection";

interface PlatformConfigFormProps {
  config: PlatformConfig;
  onSave: (config: PlatformConfig) => void;
  onThemeChange?: (theme: Theme) => Promise<void>;
  isLoading?: boolean;
  uploadImage: (file: File, sha256?: string) => Promise<string>;
}

const PlatformConfigFormBase: React.FC<PlatformConfigFormProps> = ({
  config,
  onSave,
  onThemeChange,
  isLoading = false,
  uploadImage,
}) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState<PlatformConfig>(config);
  const [validationErrors, setValidationErrors] = useState<{
    domain?: string;
    mcp_server_prefix?: string;
  }>({});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isValidate = useMemo(() => {
    return formData.name.trim().length > 0 && !isUploading;
  }, [formData, isUploading]);

  // when context config updated, sync to form
  useEffect(() => {
    setFormData(config);
  }, [config]);

  // URL validation function with strict regex
  const validateUrl = (url: string): boolean => {
    if (!url.trim()) return true; // Empty is valid (optional field)

    // Strict regex for domain validation
    const domainRegex = /^https?:\/\/(?:[-\w.])+(?:\:[0-9]+)?(?:\/.*)?$/;

    // First check with regex
    if (!domainRegex.test(url)) {
      return false;
    }

    // Then validate with URL constructor for additional checks
    try {
      const urlObj = new URL(url);
      return (
        (urlObj.protocol === "http:" || urlObj.protocol === "https:") &&
        urlObj.hostname.length > 0 &&
        urlObj.hostname.includes(".")
      );
    } catch {
      return false;
    }
  };

  // Validate field and update errors
  const validateField = (
    field: "domain" | "mcp_server_prefix",
    value: string
  ) => {
    const isValid = validateUrl(value);
    setValidationErrors((prev) => ({
      ...prev,
      [field]: isValid
        ? undefined
        : t("Please enter a valid URL with http:// or https://"),
    }));
    return isValid;
  };

  const handleInputChange = (
    field: keyof PlatformConfig,
    value: string | boolean
  ) => {
    // Validate URL fields
    if (field === "domain" || field === "mcp_server_prefix") {
      validateField(field, value as string);
    }

    setFormData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
      };

      return newData;
    });
  };

  const handleSave = async () => {
    // Validate all URL fields before saving
    const domainValid = validateField("domain", formData.domain || "");
    const mcpServerValid = validateField(
      "mcp_server_prefix",
      formData.mcp_server_prefix || ""
    );

    if (!domainValid || !mcpServerValid) {
      toast.error(t("Please fix validation errors before saving"));
      return;
    }

    onSave(formData);
  };

  const handleThemeChange = async (theme: Theme) => {
    handleInputChange("theme", theme);
    onThemeChange?.(theme);
  };
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error(t("Please select a valid image file"));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("Image size should be less than 5MB"));
      return;
    }

    setIsUploading(true);
    try {
      const sha256 = await calculateFileSha256(file);
      const imageUrl = await uploadImage(file, sha256);
      handleInputChange("logo", imageUrl);
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error(t("Failed to upload image"));
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
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
                {t("Configure platform logo, name, titles, language")}
              </p>
            </div>
          }
        >
          <div className="flex flex-col gap-4">
            {/* platform name */}
            <Input
              label={t("Platform Name")}
              placeholder={t("Enter platform name")}
              description={t("The name displayed across the platform")}
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              isRequired
              labelPlacement="outside"
            />

            {/* platform logo */}
            <div className="space-y-2">
              <div>
                <label className="text-sm font-medium text-foreground">
                  {t("Platform Logo")}
                </label>
                <p className="text-xs text-gray-500">
                  {t("Support JPG, PNG, GIF. Max size 5MB")}
                </p>
              </div>
              <Card
                className={`w-32 h-32 relative group border-1 ${isUploading ? "cursor-not-allowed" : "cursor-pointer"}`}
                style={{
                  backgroundImage: formData.logo
                    ? `url(${formData.logo})`
                    : "none",
                  backgroundSize: "contain",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
                onPress={handleImageClick}
                isPressable={!isUploading}
                shadow="none"
              >
                <div
                  className={`absolute top-0 right-0 bg-default-500/50 w-full h-full flex items-center justify-center transition-opacity duration-300 ${formData.logo && !isUploading ? "opacity-0" : "opacity-100"
                    } group-hover:opacity-100`}
                >
                  {isUploading ? (
                    <Spinner size="lg" color="white" />
                  ) : (
                    <UploadIcon size={48} className="text-white" />
                  )}
                </div>
              </Card>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

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
              labelPlacement="outside"
            />

            {/* homepage headline */}
            <Input
              label={t("Headline")}
              placeholder={t("Enter homepage headline")}
              description={t("Main headline displayed on the homepage")}
              value={formData.headline || ""}
              onChange={(e) => handleInputChange("headline", e.target.value)}
              labelPlacement="outside"
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
              labelPlacement="outside"
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
              labelPlacement="outside"
            >
              {SUPPORTED_LANGUAGES.map((language) => (
                <SelectItem key={language.name} value={language.name}>
                  {language.label}
                </SelectItem>
              ))}
            </Select>

            {/* platform domain */}
            <Input
              label={t("Platform Domain")}
              placeholder={t(
                "Enter platform domain (e.g., https://example.com)"
              )}
              description={t("The domain name of your platform")}
              value={formData.domain || ""}
              onChange={(e) => handleInputChange("domain", e.target.value)}
              isInvalid={!!validationErrors.domain}
              errorMessage={validationErrors.domain}
              labelPlacement="outside"
            />

            {/* mcp server prefix */}
            <Input
              label={t("MCP Server Domain")}
              placeholder={t(
                "Enter MCP server domain (e.g., https://mcp.example.com)"
              )}
              description={t("The domain for MCP server API calls")}
              value={formData.mcp_server_prefix || ""}
              onChange={(e) =>
                handleInputChange("mcp_server_prefix", e.target.value)
              }
              isInvalid={!!validationErrors.mcp_server_prefix}
              errorMessage={validationErrors.mcp_server_prefix}
              labelPlacement="outside"
            />

            {/* showcase in xpack */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">
                  {t("Featured in the XPack showcase")}
                </span>
                <span className="text-xs text-gray-500">
                  {t(
                    "Enable this option to feature your site in the XPack global showcase and reach users worldwide."
                  )}
                </span>
              </div>
              <Switch
                isSelected={formData.is_showcased ?? false}
                onValueChange={(value) => {
                  handleInputChange("is_showcased", value);
                }}
                color="primary"
                size="sm"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 py-4">
            <Button
              color="primary"
              variant="solid"
              onPress={handleSave}
              isLoading={isLoading}
              size="sm"
              isDisabled={!isValidate}
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
        defaultExpandedKeys={["theme-config"]}
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

// Export the base component for direct use (avoiding circular dependency)
export { PlatformConfigFormBase };

// Export with component injection support
export const PlatformConfigForm = withComponentInjection(
  "forms/PlatformConfigForm",
  PlatformConfigFormBase
);
