"use client";

import React, { useMemo } from "react";
import { useTranslation } from "@/shared/lib/useTranslation";
import {
  EmbeddedHtmlConfig,
  FaqItem,
  LoginConfig,
  PlatformConfig,
  Theme,
  TopNavigationItem,
} from "@/shared/types/system";
import { SettingsMenuItem } from "./SystemSettingsSidebar";
import TitleAndDescPanel, {
  TitleAndDescPanelConfig,
} from "./system-setting/TitleAndDescPanel";
import MetaDataPanel from "./system-setting/MetaDataPanel";
import BrandPanel, { BrandPanelConfig } from "./system-setting/BrandPanel";
import { ThemeSelector } from "@/components/system-setting/ThemeSelector";
import { TopNavigationSettings } from "@/components/system-setting/TopNavigationSettings";
import { EmbeddedHtmlSettings } from "@/components/system-setting/EmbeddedHtmlSettings";
import { ExplorePanel } from "./system-setting/ExplorePanel";
import DomainPanel from "./system-setting/DomainPanel";
import PaymentChannelsContent from "@/components/console/PaymentChannelsContent";
import { HomepageConfig } from "@/services/homepageConfigService";
import { FaqSettings } from "@/components/system-setting/FaqSettings";
import { AdminConfigForm } from "./AdminConfigForm";
import { systemConfigService } from "@/services/systemConfigService";
import { md5Encrypt } from "@/shared/utils/crypto";
import { AdminConfig, EmailConfig } from "@/types/system";
import { LoginSettingsContent } from "./LoginSettingsContent";
import { EmailConfigForm } from "@/components/system-setting/EmailConfigForm";
import { LanguageSetting } from "@/components/system-setting/LanguageSetting";
import { TagsBarSetting } from "../system-setting/TagsBarSetting";

interface SystemSettingsRightContentProps {
  filteredKeys: string[];
  settingsMenuItems: SettingsMenuItem[];
  platformConfig: PlatformConfig;
  homepageConfig: HomepageConfig;
  sectionRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
  titleRefs: React.MutableRefObject<Record<string, HTMLElement | null>>; // New: refs for section titles
  onSavePlatformConfig: (config: { [key: string]: any }) => Promise<boolean>;
  onSaveEmbeddedHtml: (config: EmbeddedHtmlConfig) => Promise<boolean>;
  handleThemeChange: (theme: Theme) => Promise<void>;
  uploadImage: any;
  scrollContainerRef?: React.RefObject<HTMLDivElement>;
  saveNavigationConfig: (config: TopNavigationItem[]) => Promise<boolean>;
  saveFaqConfig: (config: FaqItem[]) => Promise<boolean>;
  saveLoginConfig: (config: LoginConfig) => Promise<boolean>;
  emailConfig: EmailConfig;
  loginConfig: LoginConfig;
  onSaveEmailConfig: (config: EmailConfig) => Promise<boolean>;
  emailSubmitLoading: boolean;
}

const SystemSettingsRightContent: React.FC<SystemSettingsRightContentProps> = ({
  filteredKeys,
  settingsMenuItems,
  platformConfig,
  homepageConfig,
  onSaveEmbeddedHtml,
  sectionRefs,
  titleRefs, // New prop
  onSavePlatformConfig,
  handleThemeChange,
  uploadImage,
  scrollContainerRef,
  saveNavigationConfig,
  saveFaqConfig,
  saveLoginConfig,
  emailConfig,
  loginConfig,
  onSaveEmailConfig,
  emailSubmitLoading,
}) => {
  const { t } = useTranslation();
  const menuItems = useMemo(() => {
    return settingsMenuItems.filter((it) => filteredKeys.includes(it.key));
  }, [settingsMenuItems, filteredKeys]);
  const handleChangePassword = async (config: AdminConfig) => {
    const result = await systemConfigService.updateSystemConfig(
      {
        account: {
          ...config,
          password: md5Encrypt(config.password),
        },
      },
      "password"
    );
    return result;
  };
  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto h-full pb-40 space-y-6"
      style={{ scrollBehavior: "auto" }}
    >
      <div className="h-0" aria-hidden="true"></div>
      {menuItems.map((section) => (
        <>
          <section
            key={section.key}
            ref={(el) => {
              if (el) sectionRefs.current[section.key] = el;
            }}
            id={`section-${section.key}`}
            className="px-6 py-6 scroll-mt-16 border-1 rounded-lg shadow-md max-w-2xl mx-auto"
          >
            <div className="mb-4">
              <h2
                className="text-xl font-semibold"
                ref={(el) => {
                  if (el) titleRefs.current[section.key] = el;
                }}
                id={`title-${section.key}`}
              >
                {t(section.label)}
              </h2>
              <p className="text-sm text-default-500">
                {t(section.description || "")}
              </p>
            </div>

            {/* Content sections */}
            {section.key === "title-description" && (
              <TitleAndDescPanel
                config={platformConfig as TitleAndDescPanelConfig}
                onSave={onSavePlatformConfig}
              />
            )}

            {section.key === "meta-data" && (
              <MetaDataPanel
                metaData={platformConfig}
                onSave={onSavePlatformConfig}
                uploadImage={uploadImage}
                platformConfig={platformConfig}
              />
            )}

            {section.key === "custom-domain" && (
              <div className="space-y-4">
                <DomainPanel
                  config={platformConfig}
                  onSave={onSavePlatformConfig}
                />
              </div>
            )}
            {section.key === "platform-language" && (
              <LanguageSetting
                config={platformConfig}
                onSave={onSavePlatformConfig}
              />
            )}

            {section.key === "branding" && (
              <BrandPanel
                config={platformConfig as BrandPanelConfig}
                onSave={onSavePlatformConfig}
                onUploadImage={uploadImage}
              />
            )}

            {section.key === "theme" && (
              <ThemeSelector
                value={platformConfig.theme || Theme.DEFAULT}
                onChange={handleThemeChange}
              />
            )}
            {section.key === "smtp-settings" && (
              <EmailConfigForm
                config={emailConfig}
                onSave={onSaveEmailConfig}
                isLoading={emailSubmitLoading}
              />
            )}

            {section.key === "email-login-settings" && (
              <LoginSettingsContent
                loginConfig={loginConfig}
                saveLoginConfig={saveLoginConfig}
                emailConfig={emailConfig}
                type="email"
              />
            )}

            {section.key === "google-login-settings" && (
              <LoginSettingsContent
                loginConfig={loginConfig}
                saveLoginConfig={saveLoginConfig}
                emailConfig={emailConfig}
                type="google"
              />
            )}

            {section.key === "navigation" && (
              <TopNavigationSettings
                onSave={saveNavigationConfig}
                config={homepageConfig.top_navigation}
                labelPlacement="outside"
              />
            )}

            {section.key === "tagsBar" && (
              <TagsBarSetting
                isEnabled={!!platformConfig.tag_bar_display}
                onSave={onSavePlatformConfig}
              />
            )}

            {section.key === "faq" && (
              <FaqSettings
                onSave={saveFaqConfig}
                config={homepageConfig.faq}
                labelPlacement="outside"
              />
            )}

            {section.key === "payment" && (
              <PaymentChannelsContent labelPlacement="outside" />
            )}

            {section.key === "xpack-explore" && (
              <ExplorePanel
                isEnabled={!!platformConfig.is_showcased}
                onSave={onSavePlatformConfig}
              />
            )}

            {section.key === "code-injection" && (
              <EmbeddedHtmlSettings
                onSave={onSaveEmbeddedHtml}
                config={homepageConfig.embeded_html}
                labelPlacement="outside"
              />
            )}

            {section.key === "change-password" && (
              <AdminConfigForm onSave={handleChangePassword} />
            )}
          </section>
        </>
      ))}
      {/* Bottom spacer to allow last sections to scroll higher into view for better selection */}
      <div className="h-40" aria-hidden="true" />
    </div>
  );
};

export default SystemSettingsRightContent;
