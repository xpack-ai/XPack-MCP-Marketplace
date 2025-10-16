"use client";

import React from "react";
import { Switch } from "@nextui-org/react";
import { useTranslation } from "@/shared/lib/useTranslation";

export type ExplorePanelConfig = {
  is_showcased: boolean;
};

interface ExplorePanelProps {
  isEnabled: boolean;
  onSave: (config: ExplorePanelConfig) => void;
}

export const ExplorePanel: React.FC<ExplorePanelProps> = ({
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
              {t("Featured in the XPack showcase")}
            </span>
            <span className="text-xs text-gray-500">
              {t(
                "Enable this option to feature your site in the XPack global showcase and reach users worldwide."
              )}
            </span>
          </div>
          <Switch
            isSelected={isEnabled}
            onValueChange={(value) => {
              onSave({
                is_showcased: value,
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
