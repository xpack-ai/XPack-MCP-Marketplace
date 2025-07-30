"use client";

import React, { useState, useEffect } from "react";
import { Button, AccordionItem, Accordion } from "@nextui-org/react";
import MDEditor, { commands } from "@uiw/react-md-editor";
import { PlatformConfig } from "@/shared/types/system";
import { useTranslation } from "@/shared/lib/useTranslation";
import { calculateFileSha256 } from "@/shared/utils/crypto";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

interface AboutPageSettingsProps {
  config: PlatformConfig;
  onAboutSave: (aboutContent: string) => Promise<void>;
  onImageUpload?: (file: File, sha256?: string) => Promise<string>;
  isAboutLoading?: boolean;
}

export const AboutPageSettings: React.FC<AboutPageSettingsProps> = ({
  config,
  onAboutSave,
  onImageUpload,
  isAboutLoading = false,
}) => {
  const { t } = useTranslation();
  const [aboutContent, setAboutContent] = useState(config.about_page || "");

  useEffect(() => {
    setAboutContent(config.about_page || "");
  }, [config.about_page]);

  const handleAboutSave = async () => {
    await onAboutSave(aboutContent);
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
    <div className="flex flex-col gap-4 justify-between h-full">
      <div className="flex-1">
        <MDEditor
          value={aboutContent}
          onChange={(value?: string) => setAboutContent(value || "")}
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
          height="100%"
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
      <div className="flex gap-3 pb-4">
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
    </div>
  );
};
