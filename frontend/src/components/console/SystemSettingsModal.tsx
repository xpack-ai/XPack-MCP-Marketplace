"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  Button,
} from "@nextui-org/react";
import { useSystemConfigManagement } from "@/hooks/useSystemConfigManagement";
import { usePlatformConfig } from "@/shared/contexts/PlatformConfigContext";
import { Theme } from "@/shared/types/system";
import SystemSettingsSidebar, {
  SettingsGroup,
  SettingsMenuItem,
} from "./SystemSettingsSidebar";
import {
  AppWindow,
  Captions,
  Code,
  CreditCard,
  GhostIcon,
  GlobeIcon,
  LockIcon,
  Mail,
  Package,
  Palette,
  SquareMenu,
  TableOfContents,
  Trello,
  XIcon,
} from "lucide-react";
import SystemSettingsRightContent from "./SystemSettingsRightContent";
import { SettingModalTab } from "./console.type";
import { useHomepageConfigManagement } from "@/hooks/useHomepageConfigManagement";
import { FcGoogle } from "react-icons/fc";
import { useTranslation } from "@/shared/lib/useTranslation";

interface SystemSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  keyword?: string;
}

const SystemSettingsModal: React.FC<SystemSettingsModalProps> = ({
  isOpen,
  onClose,
  keyword,
}) => {
  // Left menu active state
  const [activeSubTab, setActiveSubTab] = useState<SettingModalTab>(
    SettingModalTab.BRANDING
  );
  const { t } = useTranslation();

  // Search state (pure frontend)
  const [searchQuery, setSearchQuery] = useState<string>(keyword || "");

  // Scroll container and section refs
  const rightContentRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const titleRefs = useRef<Record<string, HTMLElement | null>>({});
  const scrollingByClickRef = useRef(false);
  const activeKeyRef = useRef<SettingModalTab>(SettingModalTab.BRANDING);

  useEffect(() => {
    activeKeyRef.current = activeSubTab;
  }, [activeSubTab]);

  // Load and manage config once here to avoid duplicate network calls
  const { updateClientConfig } = usePlatformConfig();
  const {
    // platform config
    platformConfig,
    savePlatformConfig,

    // image upload
    uploadImage,

    // login config
    loginConfig,
    saveLoginConfig,

    // email config
    emailConfig,
    saveEmailConfig,
    emailLoading,
  } = useSystemConfigManagement();
  const {
    homepageConfig,
    saveNavigationConfig,
    saveEmbeddedHtmlConfig,
    saveFaqConfig,
  } = useHomepageConfigManagement();

  const handleSavePlatformConfig = async (config: { [key: string]: any }) => {
    const newConfig = { ...platformConfig, ...config };
    const result = await savePlatformConfig(newConfig);
    if (!result) return false;
    updateClientConfig({ platform: newConfig });
    return result;
  };

  const handleThemeChange = async (theme: Theme) => {
    const updatedConfig = { ...platformConfig, theme };
    const result = await savePlatformConfig(updatedConfig, "theme");
    if (!result) return;
    updateClientConfig({ platform: updatedConfig });
  };

  const settingsMenuItems: SettingsMenuItem[] = [
    // General settings

    {
      key: SettingModalTab.BRANDING,
      label: "Branding",
      icon: <Trello size={16} />,
      description: "Logo, colors, and brand identity",
    },
    {
      key: SettingModalTab.TITLE_DESCRIPTION,
      label: "Title & description",
      icon: <Captions size={16} />,
      description: "Configure your site title and description",
    },
    {
      key: SettingModalTab.META_DATA,
      label: "Meta data",
      icon: <AppWindow size={16} />,
      description: "Extra content for search engines and social accounts",
    },
    {
      key: SettingModalTab.CUSTOM_DOMAIN,
      label: "Domain",
      icon: <GhostIcon size={16} />,
      description: "Configure your custom domain settings",
    },
    {
      key: SettingModalTab.PLATFORM_LANGUAGE,
      label: "Platform Language",
      icon: <GlobeIcon size={16} />,
      description: "Configure platform language",
    },
    // Site
    {
      key: SettingModalTab.THEME,
      label: "Theme",
      icon: <Palette size={16} />,
      description: "Visual theme and appearance settings",
    },
    {
      key: SettingModalTab.NAVIGATION,
      label: "Navigation",
      icon: <SquareMenu size={16} />,
      description: "Configure site navigation and menus",
    },
    {
      key: SettingModalTab.FAQ,
      label: "FAQ",
      icon: <TableOfContents size={16} />,
      description: "Configure FAQ",
    },
    // Business
    {
      key: SettingModalTab.PAYMENT,
      label: "Payment",
      icon: <CreditCard size={16} />,
      description: "Configure payment channels",
    },
    {
      key: SettingModalTab.XPACK_EXPLORE,
      label: "XPack Explore",
      icon: <Package size={16} />,
      description: "Explore XPack features and integrations",
    },
    // Advanced
    {
      key: SettingModalTab.SMTP_SETTINGS,
      label: "Email Configuration",
      icon: <Mail size={16} />,
      description: "Configure SMTP settings for email notifications",
    },

    {
      key: SettingModalTab.EMAIL_LOGIN_SETTINGS,
      label: "Email Login Settings",
      icon: <LockIcon size={16} />,
      description: "Configure email-based authentication",
    },
    {
      key: SettingModalTab.GOOGLE_LOGIN_SETTINGS,
      label: "Google Login Settings",
      icon: <FcGoogle size={16} />,
      description: "Configure Google OAuth integration",
    },
    {
      key: SettingModalTab.CODE_INJECTION,
      label: "Code injection",
      icon: <Code size={16} />,
      description: "Custom code injection and scripts",
    },
    // Account
    {
      key: SettingModalTab.CHANGE_PASSWORD,
      label: "Password",
      icon: <LockIcon size={16} />,
      description: "Change your password",
    },
  ];

  // Hierarchical groups for the sidebar
  const settingsGroups: SettingsGroup[] = useMemo(() => {
    const mapByKey = Object.fromEntries(
      settingsMenuItems.map((it) => [it.key, it])
    );
    const groupItems = (keys: SettingModalTab[]) =>
      keys.map((k) => mapByKey[k]).filter(Boolean) as SettingsMenuItem[];
    return [
      {
        key: "general-settings",
        title: "General settings",
        items: groupItems([
          SettingModalTab.BRANDING,
          SettingModalTab.TITLE_DESCRIPTION,
          SettingModalTab.META_DATA,
          SettingModalTab.CUSTOM_DOMAIN,
          SettingModalTab.PLATFORM_LANGUAGE,
        ]),
      },
      {
        key: "site",
        title: "Site",
        items: groupItems([
          SettingModalTab.THEME,
          SettingModalTab.NAVIGATION,
          SettingModalTab.FAQ,
        ]),
      },
      {
        key: "business",
        title: "Business",
        items: groupItems([
          SettingModalTab.PAYMENT,
          SettingModalTab.XPACK_EXPLORE,
        ]),
      },
      {
        key: "advanced",
        title: "Advanced",
        items: groupItems([
          SettingModalTab.SMTP_SETTINGS,
          SettingModalTab.EMAIL_LOGIN_SETTINGS,
          SettingModalTab.GOOGLE_LOGIN_SETTINGS,
          SettingModalTab.CODE_INJECTION,
        ]),
      },
      {
        key: "account",
        title: "Account",
        items: groupItems([SettingModalTab.CHANGE_PASSWORD]),
      },
    ];
  }, []);

  // Filter keys by search (pure frontend)
  const filteredKeys = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return settingsMenuItems.map((it) => it.key);
    return settingsMenuItems
      .filter(
        (it) =>
          t(it.label).toLowerCase().includes(q) ||
          t(it.description || "")
            ?.toLowerCase()
            .includes(q)
      )
      .map((it) => it.key);
  }, [searchQuery]);

  // Optimized scroll to section function
  const scrollToSection = useCallback((key: SettingModalTab) => {
    const container = rightContentRef.current;
    const el = titleRefs.current[key];
    if (!container || !el) return;

    // Prevent multiple rapid calls
    if (scrollingByClickRef.current) return;

    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    // scroll so that the title is aligned near the top of the container viewport
    const TOP_OFFSET = 16; // small padding
    const offset =
      elRect.top - containerRect.top + container.scrollTop - TOP_OFFSET;

    scrollingByClickRef.current = true;
    setActiveSubTab(key);

    // Use CSS-based scroll with better performance
    const prevBehavior = container.style.scrollBehavior;
    container.style.scrollBehavior = "smooth";
    container.scrollTo({ top: Math.max(0, offset) });

    // Reset scroll behavior and stop suppressing after animation completes
    window.setTimeout(() => {
      if (container) {
        container.style.scrollBehavior = prevBehavior || "auto";
      }
      scrollingByClickRef.current = false;
    }, 400);
  }, []);

  // Scroll-based scrollspy using rAF to avoid IO jitter
  useEffect(() => {
    const container = rightContentRef.current;
    if (!container || !isOpen) return;

    let ticking = false;

    const computeActive = () => {
      if (!container) return;
      const keys = filteredKeys;
      const rect = container.getBoundingClientRect();
      const containerTop = rect.top;
      const TOP_OFFSET = 16;

      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const containerHeight = container.clientHeight;

      // Bottom stickiness
      if (scrollTop + containerHeight >= scrollHeight - 2) {
        const lastKey = keys[keys.length - 1];
        if (lastKey && activeKeyRef.current !== lastKey) {
          setActiveSubTab(lastKey);
        }
        return;
      }

      // Determine the last section whose title top is above the top + offset
      let currentKey: SettingModalTab | null = null;
      for (const k of keys) {
        const el = titleRefs.current[k];
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top - containerTop <= TOP_OFFSET + 1) {
          currentKey = k;
        } else {
          break;
        }
      }

      if (!currentKey) {
        const firstKey = keys[0];
        if (firstKey && activeKeyRef.current !== firstKey) {
          setActiveSubTab(firstKey);
        }
        return;
      }

      if (currentKey && activeKeyRef.current !== currentKey) {
        setActiveSubTab(currentKey);
      }
    };

    const onScroll = () => {
      if (scrollingByClickRef.current) return;
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          computeActive();
          ticking = false;
        });
      }
    };

    // Initial compute and bind listeners
    computeActive();
    container.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", onScroll);
    };
  }, [isOpen, filteredKeys]);

  // When searching, auto-jump to first matched section
  useEffect(() => {
    if (!searchQuery.trim()) return;
    if (filteredKeys.length > 0) {
      const firstKey = filteredKeys[0];
      if (firstKey !== activeSubTab) {
        scrollToSection(firstKey);
      }
    }
  }, [searchQuery]); // Only depend on searchQuery, not filteredKeys

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      classNames={{
        base: "h-screen !max-w-none !w-screen p-0",
        body: "flex-1 overflow-hidden",
      }}
      isDismissable={false}
      hideCloseButton={true}
    >
      <ModalContent>
        <ModalHeader className="flex justify-between border-b border-default">
          <h2 className="text-2xl font-bold">{t("System Settings")}</h2>
          <Button onPress={onClose} isIconOnly size="sm" variant="light">
            <XIcon size={24} className="text-gray-500" />
          </Button>
        </ModalHeader>
        <ModalBody className="p-0">
          <div className="flex h-full">
            {/* Left Navigation */}
            <SystemSettingsSidebar
              activeKey={activeSubTab}
              onSelect={scrollToSection}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              groups={settingsGroups}
              filteredKeys={filteredKeys}
            />

            {/* Right Content: stacked sections with anchors */}
            <div className="flex-1">
              <SystemSettingsRightContent
                filteredKeys={filteredKeys}
                settingsMenuItems={settingsMenuItems}
                platformConfig={platformConfig}
                homepageConfig={homepageConfig}
                onSaveEmbeddedHtml={saveEmbeddedHtmlConfig}
                sectionRefs={sectionRefs}
                titleRefs={titleRefs}
                onSavePlatformConfig={handleSavePlatformConfig}
                handleThemeChange={handleThemeChange}
                uploadImage={uploadImage}
                scrollContainerRef={rightContentRef}
                saveNavigationConfig={saveNavigationConfig}
                saveFaqConfig={saveFaqConfig}
                saveLoginConfig={saveLoginConfig}
                emailConfig={emailConfig}
                loginConfig={loginConfig}
                onSaveEmailConfig={saveEmailConfig}
                emailSubmitLoading={emailLoading}
              />
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default SystemSettingsModal;
