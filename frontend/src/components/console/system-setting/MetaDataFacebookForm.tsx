"use client";

import React, { useEffect } from "react";
import { Button, Card, CardBody, Input } from "@nextui-org/react";
import { useTranslation } from "@/shared/lib/useTranslation";
import UploadImage from "@/components/common/UploadImage";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlatformConfig } from "@/shared/types/system";
import { FaFacebook } from "react-icons/fa6";

export interface FacebookMetaData {
  facebook_title: string;
  facebook_description: string;
  facebook_image_url?: string;
}

const formSchema = z.object({
  facebook_title: z
    .string()
    .max(200, "Title is too long")
    .optional()
    .default(""),
  facebook_description: z
    .string()
    .max(1000, "Description is too long")
    .optional()
    .default(""),
  facebook_image_url: z.string().optional().or(z.literal("")).default(""),
});

type FormData = z.infer<typeof formSchema>;

interface MetaDataFacebookFormProps {
  metaData: FacebookMetaData;
  onSave: (metaData: FacebookMetaData) => Promise<boolean>;
  onUploadImage: (file: File, sha256?: string) => Promise<string>;
  platformConfig: PlatformConfig;
}

const MetaDataFacebookForm: React.FC<MetaDataFacebookFormProps> = ({
  metaData,
  onSave,
  onUploadImage,
  platformConfig,
}) => {
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: metaData,
  });

  useEffect(() => {
    if (!metaData) return;
    setValue("facebook_title", metaData.facebook_title || "");
    setValue("facebook_description", metaData.facebook_description || "");
    setValue("facebook_image_url", metaData.facebook_image_url || "");
  }, [metaData, setValue]);
  const onSubmit = async (data: FormData) => {
    await onSave(data);
  };

  return (
    <>
      <div className="max-w-2xl">
        <div className="mb-2">
          <div className="flex items-center gap-2">
            <FaFacebook className="text-primary" size={40} />
            <div className="flex flex-col">
              <span className="font-semibold text-default-900">
                {platformConfig.name}
              </span>
              <span className="text-default-400 text-xs">2h</span>
            </div>
          </div>
        </div>
        <div className="mb-2 h-3 w-full rounded-large bg-default-100"></div>
        <div className="mb-4 h-3 w-3/5 rounded-large bg-default-100"></div>
      </div>
      <Card shadow="none" className="border-1 max-w-2xl">
        <CardBody className="px-0 py-4">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4 px-4"
          >
            <Controller
              name="facebook_image_url"
              control={control}
              render={({ field }) => (
                <UploadImage
                  onSave={onUploadImage}
                  imageUrl={field.value}
                  setImageUrl={(imageUrl) => {
                    field.onChange(imageUrl);
                  }}
                  className="h-[280px] w-full bg-default-100"
                  description={t("Upload Facebook Image")}
                />
              )}
            />

            <Controller
              name="facebook_title"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label={t("Facebook Title")}
                  placeholder={platformConfig.headline || " "}
                  isInvalid={!!errors.facebook_title}
                  errorMessage={errors.facebook_title?.message}
                  labelPlacement="outside"
                />
              )}
            />

            <Controller
              name="facebook_description"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label={t("Facebook Description")}
                  placeholder={platformConfig.subheadline || " "}
                  isInvalid={!!errors.facebook_description}
                  errorMessage={errors.facebook_description?.message}
                  labelPlacement="outside"
                />
              )}
            />

            <div className="flex justify-start mt-2">
              <Button
                type="submit"
                color="primary"
                size="sm"
                className="w-fit"
                isLoading={isSubmitting}
                isDisabled={!isValid}
              >
                {t("Save")}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </>
  );
};

export default MetaDataFacebookForm;
