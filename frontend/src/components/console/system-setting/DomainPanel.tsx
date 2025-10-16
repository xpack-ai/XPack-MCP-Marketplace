"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@nextui-org/react";
import { useTranslation } from "@/shared/lib/useTranslation";
import { EditIcon } from "lucide-react";
import DomainActivationPanel from "../custom-domain/DomainActivationPanel";

export type DomainPanelConfig = {
  subdomain?: string;
  domain?: string;
  cname_a_ip?: string;
};

interface DomainPanelProps {
  config: DomainPanelConfig;
  onSave: (config: DomainPanelConfig) => Promise<boolean>;
}

const DomainPanel: React.FC<DomainPanelProps> = ({ config, onSave }) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState<DomainPanelConfig>(config);
  const [showCustomDomainModal, setShowCustomDomainModal] = useState(false);
  // when context config updated, sync to form
  useEffect(() => {
    setFormData(config);
  }, [config]);

  const handleCustomDomainSave = async (config: DomainPanelConfig) => {
    const result = await onSave(config);
    if (!result) return;
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">{t("Custom Domain")}</span>
            <span className="text-xs text-gray-500">
              {formData.domain || t("Set your custom domain for the platform")}
            </span>
          </div>
          <Button
            size="sm"
            onPress={() => setShowCustomDomainModal(true)}
            isIconOnly
            startContent={<EditIcon size={16} />}
            variant="flat"
          ></Button>
        </div>
      </div>
      {showCustomDomainModal && (
        <DomainActivationPanel
          config={{
            subdomain: formData.subdomain,
            domain: formData.domain,
            cname_a_ip: config.cname_a_ip,
          }}
          onSave={handleCustomDomainSave}
          isOpen={showCustomDomainModal}
          onClose={() => setShowCustomDomainModal(false)}
        />
      )}
    </>
  );
};

export default DomainPanel;
