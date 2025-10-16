"use client";

import React, { useEffect } from "react";
import { Button, Card, CardBody, Input } from "@nextui-org/react";
import { useTranslation } from "@/shared/lib/useTranslation";
import UploadImage from "@/components/common/UploadImage";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlatformConfig } from "@/shared/types/system";
import { FaXTwitter } from "react-icons/fa6";

export interface XMetaData {
  x_title: string;
  x_description: string;
  x_image_url?: string;
}

const formSchema = z.object({
  x_title: z.string().max(200, "Title is too long").optional().default(""),
  x_description: z
    .string()
    .max(1000, "Description is too long")
    .optional()
    .or(z.literal(""))
    .default(""),
  x_image_url: z.string().optional().or(z.literal("")).default(""),
});

type FormData = z.infer<typeof formSchema>;

interface MetaDataXFormProps {
  metaData: XMetaData;
  onSave: (metaData: XMetaData) => Promise<boolean>;
  onUploadImage: (file: File, sha256?: string) => Promise<string>;
  platformConfig: PlatformConfig;
}

const MetaDataXForm: React.FC<MetaDataXFormProps> = ({
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
    setValue("x_title", metaData.x_title || "");
    setValue("x_description", metaData.x_description || "");
    setValue("x_image_url", metaData.x_image_url || "");
  }, [metaData, setValue]);

  const onSubmit = async (data: FormData) => {
    await onSave(data);
  };

  return (
    <>
      <div className="flex items-start gap-2 w-full">
        <FaXTwitter size={40} />
        <div className="w-full">
          <div className="max-w-2xl">
            <div className="mb-2">
              <div className="flex">
                <span className="mr-1 font-semibold text-default-900">
                  {platformConfig.name}
                </span>
                <span className="text-default-400">· 2h</span>
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
                  name="x_image_url"
                  control={control}
                  render={({ field }) => (
                    <UploadImage
                      onSave={onUploadImage}
                      imageUrl={field.value}
                      setImageUrl={(imageUrl) => {
                        field.onChange(imageUrl);
                      }}
                      className="h-[280px] w-full bg-default-100"
                      description={t("Upload X Image")}
                    />
                  )}
                />

                <Controller
                  name="x_title"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label={t("X Title")}
                      placeholder={platformConfig.headline || " "}
                      isInvalid={!!errors.x_title}
                      errorMessage={errors.x_title?.message}
                      labelPlacement="outside"
                    />
                  )}
                />

                <Controller
                  name="x_description"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label={t("X Description")}
                      placeholder={platformConfig.subheadline || " "}
                      isInvalid={!!errors.x_description}
                      errorMessage={errors.x_description?.message}
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
        </div>
      </div>
    </>
  );
};

export default MetaDataXForm;
