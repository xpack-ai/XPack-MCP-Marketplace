"use client";

import React, { useState, useEffect } from "react";
import { Button, Select, SelectItem } from "@nextui-org/react";
import { PlatformConfig } from "@/shared/types/system";
import { useTranslation } from "@/shared/lib/useTranslation";
import i18n, { SUPPORTED_LANGUAGES } from "@/shared/lib/i18n";

interface LanguageSettingProps {
  config: PlatformConfig;
  onSave: (config: PlatformConfig) => void;
}

export const LanguageSetting: React.FC<LanguageSettingProps> = ({
  config,
  onSave,
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<PlatformConfig>(config);

  // when context config updated, sync to form
  useEffect(() => {
    setFormData(config);
  }, [config]);

  const handleInputChange = (
    field: keyof PlatformConfig,
    value: string | boolean
  ) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
      };

      return newData;
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    await onSave(formData);
    i18n.changeLanguage(formData.language);
    setIsLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        {/* platform language */}
        <Select
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
    </div>
  );
};
