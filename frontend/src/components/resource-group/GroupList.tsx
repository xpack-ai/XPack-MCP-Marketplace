"use client";

import React, { useRef, useCallback, useEffect } from "react";
import { Button, Card, CardBody, CardHeader, Chip, Divider, Listbox, ListboxItem, Spinner } from "@nextui-org/react";
import { useTranslation } from "@/shared/lib/useTranslation";
import { Plus } from "lucide-react";

// 资源组类型定义
export interface ResourceGroup {
  id: string;
  name: string;
  description?: string;
  isDefault?: boolean;
  serviceCount?: number;
  createdAt?: string;
}

interface GroupListProps {
  groups: ResourceGroup[];
  selectedGroup: ResourceGroup | null;
  onSelectGroup: (group: ResourceGroup) => void;
  onCreateGroup: () => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
  shouldScrollToTop?: boolean;
  onScrolledToTop?: () => void;
}

const GroupList: React.FC<GroupListProps> = ({
  groups,
  selectedGroup,
  onSelectGroup,
  onCreateGroup,
  onLoadMore,
  hasMore = false,
  loading = false,
  shouldScrollToTop = false,
  onScrolledToTop,
}) => {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null);
  const hasLoadedMoreRef = useRef(false);

  // 使用 IntersectionObserver 监听滚动到底部
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasMore && !loading && onLoadMore) {
        hasLoadedMoreRef.current = true; // 标记已触发过加载更多
        onLoadMore();
      }
    },
    [hasMore, loading, onLoadMore]
  );

  useEffect(() => {
    const element = loadMoreTriggerRef.current;
    if (!element || !onLoadMore) return;

    // 创建 IntersectionObserver
    observerRef.current = new IntersectionObserver(handleObserver, {
      root: scrollRef.current,
      rootMargin: "100px", // 提前 100px 触发加载
      threshold: 0.1,
    });

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current && element) {
        observerRef.current.unobserve(element);
      }
    };
  }, [handleObserver, onLoadMore]);

  // 监听 shouldScrollToTop 变化，滚动到顶部
  useEffect(() => {
    if (shouldScrollToTop && scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      // 通知父组件已完成滚动
      onScrolledToTop?.();
    }
  }, [shouldScrollToTop, onScrolledToTop]);

  return (
    <div className="min-w-[300px] w-[300px] bg-default-100/50 h-full">
      <Card shadow="none"
        radius="none"
        className="bg-transparent flex flex-col h-full">
        <CardHeader className="flex justify-between items-center px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">{t("Group List")}</h2>
          <Button
            size="sm"
            color="primary"
            startContent={<Plus size={16} />}
            onPress={onCreateGroup}
          >
            {t("New")}
          </Button>
        </CardHeader>
        <Divider />
        <CardBody className="flex-grow p-0">
          <div ref={scrollRef} className="overflow-y-auto h-full px-4 py-4">
            <Listbox
            aria-label="Group list"
            items={groups || []}
            emptyContent={loading ? <></> : <div className="flex items-center justify-center h-full">{t("No groups found")}</div>}
            selectionMode="single"
            selectedKeys={selectedGroup ? [selectedGroup.id] : []}
            onSelectionChange={(keys) => {
              const selectedId = Array.from(keys)[0];
              const selectedKey = (groups || []).find(
                (k) => k.id === selectedId
              );
              if (selectedKey) onSelectGroup(selectedKey);
            }}
            itemClasses={{
              title: "text-md font-medium",
              base: "bg-white p-6 transition-colors border-1 data-[selected=true]:focus:bg-primary-50 data-[selected=true]:data-[hover=true]:bg-primary-50 data-[selected=true]:border-primary-500 data-[selected=true]:bg-primary-50 data-[hover=true]:bg-default/50 data-[selectable=true]:focus:bg-default/50 [&>span]:w-full",
            }}
            classNames={{
              list: "gap-4",
            }}
            hideSelectedIcon
          >
            {(group) => (
              <ListboxItem key={group.id} textValue={group.name}>
                <div className="flex items-center gap-2 w-full overflow-hidden">
                  <span className="truncate flex-1 min-w-0">{group.name}</span>
                  {group.isDefault && (
                    <Chip size="sm" color="warning" variant="flat" className="shrink-0 ml-auto">
                      {t("Default")}
                    </Chip>
                  )}
                </div>
              </ListboxItem>
            )}
          </Listbox>

          {/* 加载更多触发器 */}
          {onLoadMore && (
            <div ref={loadMoreTriggerRef} className="py-4 flex justify-center">
              {loading && hasMore && (
                <Spinner size="sm" color="primary" />
              )}
              {!hasMore && groups.length > 0 && hasLoadedMoreRef.current && (
                <p className="text-sm text-default-400">{t("No more groups")}</p>
              )}
            </div>
          )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default GroupList;

