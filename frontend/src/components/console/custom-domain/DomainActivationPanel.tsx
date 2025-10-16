"use client";

import React, { useState } from "react";
import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  Card,
  CardBody,
} from "@nextui-org/react";
import { useTranslation } from "@/shared/lib/useTranslation";
import CustomDomainPanel from "./CustomDomainPanel";
import DNSRecordsPanel from "./DNSRecordsPanel";

export type DomainActivationPanelConfig = {
  domain?: string;
  subdomain?: string;
  cname_a_ip?: string;
};

interface DomainActivationPanelProps {
  config: DomainActivationPanelConfig;
  onSave: (config: DomainActivationPanelConfig) => void;
  isOpen: boolean;
  onClose: () => void;
}

const DomainActivationPanel: React.FC<DomainActivationPanelProps> = ({
  config,
  onSave,
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [domain, setDomain] = useState(config.domain || "");
  const handleActivate = async () => {
    setIsLoading(true);
    try {
      await onSave({
        domain,
      });
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalContent>
          <ModalHeader>{t("Set Custom Domain")}</ModalHeader>
          <ModalBody className="flex flex-col gap-4">
            <CustomDomainPanel domain={domain} setDomain={setDomain} />
            <DNSRecordsPanel
              cnameTarget={`${config.subdomain || ""}${process.env.NEXT_PUBLIC_DOMAIN_HOST || ""}`}
              apexATarget={config.cname_a_ip}
            />
            <Card shadow="none">
              <CardBody className="p-0 flex flex-col gap-2 pb-4">
                <h3 className="font-semibold mb-2">
                  {"3. "}
                  {t("Activate your domain")}
                </h3>
                <Button
                  color="primary"
                  isDisabled={!domain}
                  isLoading={isLoading}
                  onPress={handleActivate}
                  size="sm"
                >
                  {t("Activate")}
                </Button>
              </CardBody>
            </Card>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default DomainActivationPanel;
