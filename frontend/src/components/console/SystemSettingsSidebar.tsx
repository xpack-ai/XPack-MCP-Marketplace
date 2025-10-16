"use client";

import React, { useMemo, useRef, useEffect } from "react";
import { Input, Button, ScrollShadow } from "@nextui-org/react";
import { Search } from "lucide-react";
import { useTranslation } from "@/shared/lib/useTranslation";
import { SettingModalTab } from "./console.type";

export interface SettingsMenuItem {
  key: SettingModalTab;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface SettingsGroup {
  key: string;
  title: string;
  items: SettingsMenuItem[];
}

interface Props {
  activeKey: SettingModalTab;
  onSelect: (key: SettingModalTab) => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  groups: SettingsGroup[];
  filteredKeys: SettingModalTab[]; // which item keys match the current search
}

const SystemSettingsSidebar: React.FC<Props> = ({
  activeKey,
  onSelect,
  searchQuery,
  onSearchChange,
  groups,
  filteredKeys,
}) => {
  const { t } = useTranslation();
  const sidebarScrollRef = useRef<HTMLDivElement | null>(null);
  const activeItemRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // filter groups based on filteredKeys
  const visibleGroups = useMemo(() => {
    const keySet = new Set(filteredKeys);
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter((it) => keySet.has(it.key)),
      }))
      .filter((g) => g.items.length > 0);
  }, [groups, filteredKeys]);

  const hasResults = visibleGroups.length > 0;

  // Auto-scroll to active item when activeKey changes
  useEffect(() => {
    const activeElement = activeItemRefs.current[activeKey];
    const scrollContainer = sidebarScrollRef.current;

    if (activeElement && scrollContainer) {
      // Get the scroll container element (ScrollShadow wraps content)
      const scrollElement =
        (scrollContainer.querySelector(
          '[data-scrollable="true"]'
        ) as HTMLElement) || scrollContainer;

      const containerRect = scrollElement.getBoundingClientRect();
      const elementRect = activeElement.getBoundingClientRect();

      // Check if element is visible in container
      const isElementVisible =
        elementRect.top >= containerRect.top &&
        elementRect.bottom <= containerRect.bottom;

      if (!isElementVisible) {
        // Calculate scroll position to center the active item
        const containerHeight = containerRect.height;
        const elementTop = activeElement.offsetTop;
        const elementHeight = activeElement.offsetHeight;
        const scrollTop = elementTop - containerHeight / 2 + elementHeight / 2;

        scrollElement.scrollTo({
          top: Math.max(0, scrollTop),
          behavior: "smooth",
        });
      }
    }
  }, [activeKey]);

  return (
    <ScrollShadow
      ref={sidebarScrollRef}
      className="w-[300px] border-r border-divider bg-content1/50 scrollbar-thin"
    >
      <div className="p-4 space-y-4">
        <Input
          size="sm"
          aria-label={t("Search settings")}
          placeholder={t("Search settings")}
          value={searchQuery}
          onValueChange={onSearchChange}
          startContent={<Search size={16} className="text-default-400" />}
          isClearable
          onClear={() => onSearchChange("")}
        />

        {!hasResults ? (
          <div className="text-xs text-default-400 px-1 py-2">
            {t("No results")}
          </div>
        ) : (
          <nav className="space-y-6">
            {visibleGroups.map((group) => (
              <div key={group.key} className="space-y-1">
                <div className="px-2 text-[11px] tracking-wide text-default-400">
                  {t(group.title)}
                </div>
                <div className="flex flex-col gap-2">
                  {group.items.map((item) => {
                    const isActive = activeKey === item.key;
                    return (
                      <Button
                        key={item.key}
                        ref={(el) => {
                          if (el) activeItemRefs.current[item.key] = el;
                        }}
                        variant={isActive ? "flat" : "light"}
                        color={isActive ? "primary" : "default"}
                        size="sm"
                        className={`w-full border-1 justify-start h-auto py-3 px-3 text-left rounded-md ${
                          isActive
                            ? "bg-primary/10  border-primary/20"
                            : "hover:bg-default-100 border-transparent"
                        }`}
                        onPress={() => onSelect(item.key)}
                        startContent={item.icon}
                      >
                        <div className="flex flex-col items-start w-full">
                          <div className="font-medium text-sm">
                            {t(item.label)}
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        )}
      </div>
    </ScrollShadow>
  );
};

export default SystemSettingsSidebar;
