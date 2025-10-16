"use client";

import React, { useEffect } from "react";
import { Button, Card, CardBody, CardFooter, Input } from "@nextui-org/react";
import { useTranslation } from "@/shared/lib/useTranslation";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlatformConfig } from "@/shared/types/system";

export interface SearchMetaData {
  website_title: string;
  meta_description: string;
}

const formSchema = z.object({
  website_title: z.string().max(75, "Title is too long").optional().default(""),
  meta_description: z
    .string()
    .max(156, "Description is too long")
    .optional()
    .or(z.literal(""))
    .default(""),
});

type FormData = z.infer<typeof formSchema>;

interface MetaDataSearchFormProps {
  metaData: SearchMetaData;
  platformConfig: PlatformConfig;
  onSave: (metaData: SearchMetaData) => Promise<boolean>;
}

const MetaDataSearchForm: React.FC<MetaDataSearchFormProps> = ({
  metaData,
  platformConfig,
  onSave,
}) => {
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: metaData,
  });

  useEffect(() => {
    if (!metaData) return;
    setValue("meta_description", metaData.meta_description || "");
    setValue("website_title", metaData.website_title || "");
  }, [metaData, setValue]);

  const onSubmit = async (data: FormData) => {
    await onSave(data);
  };

  const metaDescription = watch("meta_description");
  const websiteTitle = watch("website_title");

  return (
    <Card shadow="none" className="border-1 max-w-2xl">
      <CardBody className="px-0 py-4">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 px-4"
        >
          <Controller
            name="website_title"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label={t("Meta Title")}
                placeholder={platformConfig.headline || " "}
                isInvalid={!!errors.website_title}
                errorMessage={errors.website_title?.message}
                labelPlacement="outside"
                defaultValue={t("Recommended: 70 characters")}
              />
            )}
          />

          <Controller
            name="meta_description"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label={t("Meta Description")}
                placeholder={platformConfig.subheadline || " "}
                isInvalid={!!errors.meta_description}
                errorMessage={errors.meta_description?.message}
                labelPlacement="outside"
                defaultValue={t("Recommended: 156 characters")}
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
      <CardFooter className="p-0">
        <div className="w-full bg-default-100">
          <div className="mt-4 mb-2 text-grey-500 px-5 uppercase text-xs">
            {t("Preview")}
          </div>
          <div className="mx-5 -mb-5 overflow-hidden rounded-b-xl bg-grey-50 pt-2 ">
            <div className="rounded-t-lg bg-white px-5 py-3 shadow-lg mb-5">
              <div className="mt-3 flex items-center">
                <div>
                  <svg fill="none" viewBox="0 0 92 31" className="mr-7 h-7">
                    <title>google</title>
                    <path
                      d="M39.15 15.898c0 4.303-3.378 7.473-7.525 7.473s-7.526-3.17-7.526-7.473c0-4.334 3.38-7.474 7.526-7.474 4.147 0 7.526 3.14 7.526 7.474zm-3.294 0c0-2.69-1.958-4.529-4.231-4.529-2.273 0-4.231 1.84-4.231 4.529 0 2.662 1.958 4.528 4.231 4.528 2.273 0 4.231-1.87 4.231-4.528z"
                      fill="#EA4335"
                    ></path>
                    <path
                      d="M55.386 15.898c0 4.303-3.379 7.473-7.526 7.473-4.146 0-7.526-3.17-7.526-7.473 0-4.33 3.38-7.474 7.526-7.474 4.147 0 7.526 3.14 7.526 7.474zm-3.294 0c0-2.69-1.959-4.529-4.232-4.529s-4.231 1.84-4.231 4.529c0 2.662 1.958 4.528 4.231 4.528 2.273 0 4.232-1.87 4.232-4.528z"
                      fill="#FBBC05"
                    ></path>
                    <path
                      d="M70.945 8.875v13.418c0 5.52-3.267 7.774-7.13 7.774-3.636 0-5.825-2.423-6.65-4.404l2.868-1.19c.511 1.217 1.763 2.652 3.779 2.652 2.472 0 4.004-1.52 4.004-4.38V21.67h-.115c-.737.906-2.158 1.698-3.95 1.698-3.751 0-7.188-3.255-7.188-7.443 0-4.22 3.437-7.501 7.188-7.501 1.789 0 3.21.792 3.95 1.671h.115V8.88h3.129v-.004zm-2.895 7.05c0-2.632-1.763-4.556-4.005-4.556-2.273 0-4.177 1.924-4.177 4.556 0 2.604 1.904 4.501 4.177 4.501 2.242 0 4.005-1.897 4.005-4.501z"
                      fill="#4285F4"
                    ></path>
                    <path
                      d="M76.103 1.01v21.903H72.89V1.011h3.213z"
                      fill="#34A853"
                    ></path>
                    <path
                      d="M88.624 18.357l2.558 1.699c-.826 1.216-2.815 3.312-6.251 3.312-4.262 0-7.445-3.282-7.445-7.474 0-4.444 3.21-7.473 7.076-7.473 3.893 0 5.798 3.086 6.42 4.754l.341.85-10.028 4.137c.768 1.5 1.962 2.264 3.636 2.264 1.678 0 2.841-.822 3.693-2.069zm-7.87-2.688l6.703-2.774c-.368-.933-1.478-1.583-2.783-1.583-1.674 0-4.005 1.472-3.92 4.357z"
                      fill="#EA4335"
                    ></path>
                    <path
                      d="M11.936 13.953v-3.17h10.726c.105.552.159 1.206.159 1.914 0 2.378-.653 5.32-2.757 7.416-2.046 2.123-4.66 3.255-8.124 3.255-6.42 0-11.818-5.21-11.818-11.605C.122 5.368 5.52.158 11.94.158c3.551 0 6.081 1.389 7.982 3.198l-2.246 2.237c-1.363-1.273-3.21-2.264-5.74-2.264-4.688 0-8.354 3.764-8.354 8.434s3.666 8.434 8.354 8.434c3.041 0 4.773-1.216 5.882-2.322.9-.896 1.492-2.176 1.725-3.925l-7.607.003z"
                      fill="#4285F4"
                    ></path>
                  </svg>
                </div>
                <div className="grow">
                  <div className="flex w-full items-center justify-end rounded-full bg-white p-3 px-4 shadow dark:bg-grey-900">
                    <svg
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      stroke-width="1.5"
                      className="pointer-events-none size-4 stroke-[2px] text-blue-600"
                    >
                      <path
                        d="M0.750 9.812 A9.063 9.063 0 1 0 18.876 9.812 A9.063 9.063 0 1 0 0.750 9.812 Z"
                        fill="none"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        transform="translate(-3.056 4.62) rotate(-23.025)"
                      ></path>
                      <path
                        d="M16.221 16.22L23.25 23.25"
                        fill="none"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 border-t border-grey-200 pt-4 dark:border-grey-900">
                <div
                  className="flex size-7 items-center justify-center rounded-full bg-grey-200 dark:bg-grey-700"
                  style={{
                    backgroundImage: `url("${platformConfig.logo}")`,
                    backgroundSize: "contain",
                  }}
                ></div>
                <div className="flex flex-col text-sm">
                  <span>{platformConfig.domain || window.location.host}</span>
                  <span className="-mt-0.5 inline-block text-xs text-grey-600">
                    https://
                    {platformConfig.domain || window.location.host}
                  </span>
                </div>
              </div>
              <div className="mt-1 flex flex-col">
                <span className="text-lg text-[#1a0dab] dark:text-blue">
                  {websiteTitle || platformConfig.headline}
                </span>
                <span className="text-sm text-grey-900 dark:text-grey-700">
                  {metaDescription || platformConfig.subheadline}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default MetaDataSearchForm;
