"use client";

import React from "react";
import { useTranslation } from "@/shared/lib/useTranslation";
import { Link as LinkIcon } from "lucide-react";
import {
  Modal,
  ModalContent,
  ModalBody,
  Button,
  Image,
} from "@nextui-org/react";
import { usePlatformConfig } from "@/shared/contexts/PlatformConfigContext";
import { FaFacebook } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa6";
import { FaXTwitter } from "react-icons/fa6";
import { copyToClipboard } from "@/shared/utils/clipboard";
import toast from "react-hot-toast";

interface SharePlatformModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShareComplete: () => void;
}

const SharePlatformModal: React.FC<SharePlatformModalProps> = ({
  isOpen,
  onClose,
  onShareComplete,
}) => {
  const { t } = useTranslation();
  const { platformConfig } = usePlatformConfig();

  const handleCopyLink = async () => {
    try {
      const res = await copyToClipboard(window.location.origin);
      onShareComplete();
      if (res.success) {
        toast.success(t("Copied to clipboard"));
      }
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleSocialShare = (platform: "x" | "facebook" | "linkedin") => {
    const text = t(
      `Just launched my first MCP Platform:{{name}} with xpack.ai 🚀
Built in minutes, no coding, ready for AI Agents 🤖

👉Go and try my MCP: {{link}}
#MCP #AI #APIs #XPack #AIagents #DevTools`,
      {
        name: platformConfig.name,
        link: window.location.origin,
      }
    );
    let url = "";
    const shareUrl = encodeURIComponent(window.location.origin);

    switch (platform) {
      case "x":
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${shareUrl}`;
        break;
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
        break;
      case "linkedin":
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`;
        break;
    }
    if (url) {
      window.open(url, "_blank", "width=600,height=400");
      onShareComplete();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalContent>
        <ModalBody>
          {/* Header */}
          <div className="my-6 flex flex-col gap-2 ">
            <h2 className="text-2xl font-extrabold text-primary md:text-4xl">
              {t("Your MCP Market is ready.")}
            </h2>
            <p className="text-2xl font-bold text-gray-900">
              {t("Share your MCP to the world")}
            </p>
          </div>

          {/* Preview Card */}
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900">
                {platformConfig.website_title || platformConfig.name}
              </h3>
              <p className="text-gray-700">{platformConfig.meta_description}</p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-800">
              {platformConfig.logo && (
                <Image
                  src={platformConfig.logo}
                  alt={platformConfig.name}
                  width={20}
                  height={20}
                />
              )}
              <span className="font-semibold">{platformConfig.name}</span>
              <span>•</span>
              <span className="text-gray-600">{window.location.hostname}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
            {/* Social buttons */}
            <div className="flex items-center gap-2">
              <Button
                onPress={() => handleSocialShare("x")}
                title={t("Share on X")}
                isIconOnly
                size="lg"
                variant="flat"
              >
                <FaXTwitter size={20} />
              </Button>
              <Button
                onPress={() => handleSocialShare("facebook")}
                title={t("Share on Facebook")}
                isIconOnly
                size="lg"
                variant="flat"
              >
                <FaFacebook size={20} className="text-primary" />
              </Button>
              <Button
                onPress={() => handleSocialShare("linkedin")}
                title={t("Share on LinkedIn")}
                isIconOnly
                size="lg"
                variant="flat"
              >
                <FaLinkedin size={20} className="text-blue-500" />
              </Button>
            </div>

            {/* Copy link button */}
            <Button
              onPress={handleCopyLink}
              size="lg"
              color="primary"
              className="gap-1 w-full bg-default-900"
            >
              <LinkIcon size={20} />
              <span className="text-base font-semibold">{t("Copy link")}</span>
            </Button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default SharePlatformModal;
