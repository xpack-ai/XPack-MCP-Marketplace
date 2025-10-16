"use client";

import React, { useEffect } from "react";
import { Input, Button } from "@nextui-org/react";
import { useTranslation } from "@/shared/lib/useTranslation";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export type TitleAndDescPanelConfig = {
  headline: string;
  subheadline: string;
};

const titleAndDescPanelSchema = z.object({
  headline: z.string().min(1, "Title is required"),
  subheadline: z.string(),
});

interface TitleAndDescPanelProps {
  config: TitleAndDescPanelConfig;
  onSave: (config: TitleAndDescPanelConfig) => Promise<boolean>;
}

const TitleAndDescPanel: React.FC<TitleAndDescPanelProps> = ({
  config,
  onSave,
}) => {
  const { t } = useTranslation();

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm<TitleAndDescPanelConfig>({
    resolver: zodResolver(titleAndDescPanelSchema),
    mode: "onBlur",
    defaultValues: config,
  });
  useEffect(() => {
    setValue("headline", config.headline);
    setValue("subheadline", config.subheadline);
  }, [config]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <form onSubmit={handleSubmit(onSave)} className="flex flex-col gap-4">
          <Controller
            name="headline"
            control={control}
            render={({ field }) => (
              <>
                {/* homepage headline */}
                <Input
                  {...field}
                  label={t("Site title")}
                  placeholder={t("Enter site title")}
                  description={t("Main title displayed on the home page")}
                  isInvalid={!!errors.headline}
                  errorMessage={errors.headline?.message}
                  labelPlacement="outside"
                  isRequired
                />
              </>
            )}
          />
          <Controller
            name="subheadline"
            control={control}
            render={({ field }) => (
              <>
                {/* homepage subheadline */}
                <Input
                  {...field}
                  label={t("Site description")}
                  placeholder={t("Enter site description")}
                  description={t(
                    "Secondary description displayed below the main title"
                  )}
                  isInvalid={!!errors.subheadline}
                  errorMessage={errors.subheadline?.message}
                  labelPlacement="outside"
                />
              </>
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

export default TitleAndDescPanel;
