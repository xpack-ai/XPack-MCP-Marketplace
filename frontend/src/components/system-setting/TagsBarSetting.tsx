"use client";

import React from "react";
import { Switch } from "@nextui-org/react";
import { useTranslation } from "@/shared/lib/useTranslation";

export type TagsBarSettingConfig = {
    tag_bar_display: boolean;
};

interface TagsBarSettingProps {
  isEnabled: boolean;
  onSave: (config: TagsBarSettingConfig) => void;
}

export const TagsBarSetting: React.FC<TagsBarSettingProps> = ({
  isEnabled,
  onSave,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        {/* showcase in xpack */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">
              {t("Display tags bar")}
            </span>
            <span className="text-xs text-gray-500">
              {t(
                "Front end displays tags bar and allows users to filter products based on tags."
              )}
            </span>
          </div>
          <Switch
            isSelected={isEnabled}
            onValueChange={(value) => {
              onSave({
                tag_bar_display: value
              });
            }}
            color="primary"
            size="sm"
          />
        </div>
      </div>
    </div>
  );
};
