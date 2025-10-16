"use client";

import React, { useEffect, useState } from "react";
import {
  AccordionItem,
  Accordion,
  Textarea,
  Button,
  Switch,
  Alert,
} from "@nextui-org/react";
import { useTranslation } from "@/shared/lib/useTranslation";
import { EmbeddedHtmlConfig } from "@/shared/types/system";

interface EmbeddedHtmlSettingsProps {
  onSave?: (config: EmbeddedHtmlConfig) => Promise<boolean>;
  config?: EmbeddedHtmlConfig | null;
  labelPlacement?: "outside" | "inside";
}

export const EmbeddedHtmlSettings: React.FC<EmbeddedHtmlSettingsProps> = ({
  onSave,
  config = { html: "", is_enabled: false },
  labelPlacement = "inside",
}) => {
  const { t } = useTranslation();
  const [htmlData, setHtmlData] = useState<EmbeddedHtmlConfig>(
    config || { html: "", is_enabled: false }
  );
  const [isSaving, setIsSaving] = useState(false);
  useEffect(() => {
    if (!config) return;
    setHtmlData(config);
  }, [config?.html, config?.is_enabled]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave?.(htmlData);
    } finally {
      setIsSaving(false);
    }
  };

  const handleHtmlChange = (value: string) => {
    setHtmlData((prev) => ({ ...prev, html: value }));
  };
  const handleToggleEnabled = async (enabled: boolean) => {
    const updatedConfig = {
      ...htmlData,
      is_enabled: enabled,
    };
    // when toggle the switch, save directly, same as GoogleAuthConfigForm
    const result = await onSave?.(updatedConfig);
    if (result) {
      setHtmlData((prev) => ({ ...prev, is_enabled: enabled }));
    }
  };
  const panelContent = () => {
    return (
      <>
        <div className="mb-4">
          <div className="space-y-4">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">
                  {t("Enable Custom HTML")}
                </span>
                <span className="text-xs text-gray-500">
                  {t("Toggle to enable or disable custom HTML injection")}
                </span>
              </div>
              <Switch
                isSelected={htmlData.is_enabled}
                onValueChange={handleToggleEnabled}
                color="primary"
                size="sm"
              />
            </div>

            {/* HTML Editor */}
            <div className={`space-y-2 ${htmlData.is_enabled ? "" : "hidden"}`}>
              <Textarea
                value={htmlData.html}
                onValueChange={handleHtmlChange}
                minRows={10}
                maxRows={20}
                description={t(
                  "This HTML will be injected globally into the application. You can include script tags, CSS styles, or any valid HTML."
                )}
                radius="sm"
                className="text-xs"
                isDisabled={!htmlData.is_enabled}
              />
            </div>
          </div>
          {/* Action Buttons */}
          {htmlData.is_enabled && (
            <div className="flex gap-3 mt-4">
              <Button
                color="primary"
                variant="solid"
                onPress={handleSave}
                isLoading={isSaving}
                isDisabled={!htmlData.html.trim()}
                size="sm"
              >
                {t("Save")}
              </Button>
            </div>
          )}
        </div>
        {/* Usage Instructions */}
        <Alert
          color="primary"
          variant="flat"
          title={t("Usage Instructions")}
          description={
            <ul className="text-sm space-y-1 mt-2">
              <li>
                •{" "}
                {t(
                  "You can include Google Analytics, custom CSS, or any tracking scripts"
                )}
              </li>
              <li>
                •{" "}
                {t("The HTML will be injected into the document head section")}
              </li>
              <li>
                •{" "}
                {t(
                  "Make sure your code is valid to avoid breaking the application"
                )}
              </li>
              <li>
                •{" "}
                {t("Changes take effect immediately after saving and enabling")}
              </li>
            </ul>
          }
        />
      </>
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
      defaultExpandedKeys={["embedded-html"]}
    >
      <AccordionItem
        key="embedded-html"
        title={
          <div className="flex flex-col justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              {t("Embedded HTML")}
            </h3>
            <p className="text-sm text-gray-500">
              {t("Configure custom HTML content for global injection")}
            </p>
          </div>
        }
      >
        {panelContent()}
      </AccordionItem>
    </Accordion>
  );
};
