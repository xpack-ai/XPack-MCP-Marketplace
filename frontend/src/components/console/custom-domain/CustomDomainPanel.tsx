"use client";

import React, { useState } from "react";
import { Input, Card, CardBody } from "@nextui-org/react";
import { useTranslation } from "@/shared/lib/useTranslation";

interface CustomDomainPanelProps {
  domain: string;
  setDomain: (domain: string) => void;
  onValidationChange?: (isValid: boolean) => void;
}

const CustomDomainPanel: React.FC<CustomDomainPanelProps> = ({
  domain,
  setDomain,
  onValidationChange,
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
      /^(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,})$/;
    if (!domainRegex.test(value)) {
      return t("Please enter a valid domain");
    }
    return undefined;
  };

  const handleBlur = () => {
    const error = validateDomain(domain);
    setValidationError(error);
    // 通知父组件校验状态
    onValidationChange?.(!error);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDomain(value);
    // 实时校验
    const error = validateDomain(value);
    setValidationError(error);
    onValidationChange?.(!error);
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
          onChange={handleChange}
          onBlur={handleBlur}
          isInvalid={!!validationError}
          errorMessage={validationError}
        />
      </CardBody>
    </Card>
  );
};

export default CustomDomainPanel;
