"use client";

import React, { useState } from "react";
import { Input, Card, CardBody } from "@nextui-org/react";
import { useTranslation } from "@/shared/lib/useTranslation";

interface CustomDomainPanelProps {
  domain: string;
  setDomain: (domain: string) => void;
}

const CustomDomainPanel: React.FC<CustomDomainPanelProps> = ({
  domain,
  setDomain,
}) => {
  const { t } = useTranslation();
  const [validationError, setValidationError] = useState<string | undefined>();

  // Validate domain URL
  const validateDomain = (value: string): string | undefined => {
    if (!value.trim()) {
      return undefined; // Domain is optional
    }

    // Basic domain format validation ,like www.example.com
    const domainRegex =
      /(?=.{1,255}$)(?:(?!-)[a-zA-Z0-9-]{1,63}(?<!-)\.)+[a-zA-Z]{2,}/;
    if (!domainRegex.test(value)) {
      return t("Please enter a valid domain");
    }
    return undefined;
  };

  const handleBlur = () => {
    const error = validateDomain(domain);
    setValidationError(error);
  };

  return (
    <Card shadow="none">
      <CardBody className="flex flex-col p-0">
        <h3 className="font-semibold mb-2">
          {"1. "}
          {t("Enter the domain you want to use")}
        </h3>

        <Input
          label={t("Domain")}
          placeholder={t("Enter your full domain name (e.g., www.example.com)")}
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          onBlur={handleBlur}
          isInvalid={!!validationError}
          errorMessage={validationError}
        />
      </CardBody>
    </Card>
  );
};

export default CustomDomainPanel;
