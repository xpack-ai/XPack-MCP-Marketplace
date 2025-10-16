"use client";

import React, { useEffect } from "react";
import { Input, Button } from "@nextui-org/react";
import { useTranslation } from "@/shared/lib/useTranslation";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import UploadImage from "@/components/common/UploadImage";

export type BrandPanelConfig = {
  logo: string;
  name: string;
};

const brandPanelSchema = z.object({
  logo: z.string(),
  name: z.string().min(1, "Name is required"),
});

interface BrandPanelProps {
  config: BrandPanelConfig;
  onSave: (config: BrandPanelConfig) => Promise<boolean>;
  onUploadImage: (file: File, sha256?: string) => Promise<string>;
}

const BrandPanel: React.FC<BrandPanelProps> = ({
  config,
  onSave,
  onUploadImage,
}) => {
  const { t } = useTranslation();

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm<BrandPanelConfig>({
    resolver: zodResolver(brandPanelSchema),
    mode: "onBlur",
    defaultValues: config,
  });
  useEffect(() => {
    setValue("name", config.name);
    setValue("logo", config.logo);
  }, [config]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <form onSubmit={handleSubmit(onSave)} className="flex flex-col gap-4">
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <>
                <Input
                  {...field}
                  label={t("Your brand")}
                  placeholder={t("Enter your brand name")}
                  isInvalid={!!errors.name}
                  errorMessage={errors.name?.message}
                  labelPlacement="outside"
                  isRequired
                />
              </>
            )}
          />
          <Controller
            name="logo"
            control={control}
            render={({ field }) => (
              <div className="flex flex-col gap-2">
                <div>
                  <label className="text-sm font-medium text-foreground">
                    {t("Logo")}
                  </label>
                  <p className="text-xs text-gray-500">
                    {t("Support JPG, PNG, GIF, SVG. Max size 5MB")}
                  </p>
                </div>
                <UploadImage
                  onSave={onUploadImage}
                  setImageUrl={(imageUrl) => field.onChange(imageUrl)}
                  imageUrl={field.value}
                />
              </div>
            )}
          />
          <Button
            color="primary"
            variant="solid"
            type="submit"
            isLoading={isSubmitting}
            size="sm"
            isDisabled={!isValid}
            className="mt-2 w-fit"
          >
            {t("Save")}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default BrandPanel;
