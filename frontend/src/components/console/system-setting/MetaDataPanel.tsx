"use client";

import React, { useEffect } from "react";
import { Tabs, Tab } from "@nextui-org/react";
import { useTranslation } from "@/shared/lib/useTranslation";
import MetaDataFacebookForm from "./MetaDataFacebookForm";
import MetaDataXForm from "./MetaDataXForm";
import MetaDataSearchForm from "./MetaDataSearchForm";
import { FacebookMetaData } from "./MetaDataFacebookForm";
import { SearchMetaData } from "./MetaDataSearchForm";
import { XMetaData } from "./MetaDataXForm";
import { PlatformConfig } from "@/shared/types/system";

interface MetaData {
  website_title?: string;
  meta_description?: string;
  x_title?: string;
  x_description?: string;
  x_image_url?: string;
  facebook_title?: string;
  facebook_description?: string;
  facebook_image_url?: string;
}

interface MetaDataPanelProps {
  metaData: MetaData;
  onSave: (metaData: MetaData) => Promise<boolean>;
  uploadImage: (file: File, sha256?: string) => Promise<string>;
  platformConfig: PlatformConfig;
}

const MetaDataPanel: React.FC<MetaDataPanelProps> = ({
  metaData,
  onSave,
  uploadImage,
  platformConfig,
}) => {
  const { t } = useTranslation();

  const handleSave = async (data: MetaData) => {
    return await onSave({
      ...metaData,
      ...data,
    });
  };
  return (
    <Tabs
      aria-label="Meta data options"
      variant="solid"
      className="w-full"
      destroyInactiveTabPanel={false}
    >
      <Tab key="search" title={t("Search")} className="pb-0">
        <MetaDataSearchForm
          metaData={metaData as SearchMetaData}
          onSave={handleSave}
          platformConfig={platformConfig}
        />
      </Tab>

      <Tab key="x" title={t("X Card")} className="pb-0">
        <MetaDataXForm
          metaData={metaData as XMetaData}
          onSave={handleSave}
          onUploadImage={uploadImage}
          platformConfig={platformConfig}
        />
      </Tab>

      <Tab key="facebook" title={t("Facebook Card")} className="pb-0">
        <MetaDataFacebookForm
          metaData={metaData as FacebookMetaData}
          onSave={handleSave}
          onUploadImage={uploadImage}
          platformConfig={platformConfig}
        />
      </Tab>
    </Tabs>
  );
};

export default MetaDataPanel;
