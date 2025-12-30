"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import { Theme, ThemeType } from "@/shared/types/system";
import { useTranslation } from "react-i18next";

interface TagFilterProps {
  tags: string[];
  theme: ThemeType;
  selectedTag: string;
  onTagChange: (tag: string) => void;
  maxWidthPercent?: number; // 最大宽度百分比，默认80%
}

export const TagFilter: React.FC<TagFilterProps> = ({
  tags,
  theme,
  selectedTag,
  onTagChange,
  maxWidthPercent = 80,
}) => {
  const { t } = useTranslation();
  // 是否打开标签筛选弹窗
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 临时选中的标签
  const [tempSelectedTag, setTempSelectedTag] = useState<string | null>(null);
  // 可见的标签
  const [visibleTags, setVisibleTags] = useState<string[]>(["ALL", ...tags]);
  // 是否显示更多按钮
  const [showMore, setShowMore] = useState(false);
  // 从弹窗选择的额外标签
  const [extraTag, setExtraTag] = useState<string | null>(null);
  // 容器引用
  const containerRef = useRef<HTMLDivElement>(null);
  // 标签容器引用
  const tagsContainerRef = useRef<HTMLDivElement>(null);
  

  // 根据主题获取颜色配置
  const getThemeColors = () => {
    switch (theme) {
      case Theme.DEFAULT:
      case Theme.MODERN:
        return {
          selected: "bg-[#C8DCFF] text-[#1E40AF]",
          unselected: "text-gray-700 hover:bg-gray-200",
          shadow: "shadow-lg shadow-[#C8DCFF]/50",
        };
      case Theme.CLASSIC:
        return {
          selected: "bg-[#475569] text-white",
          unselected: "text-gray-700 hover:bg-gray-200",
          shadow: "shadow-lg shadow-[#475569]/50",
        };
      case Theme.TEMU:
        return {
          selected: "bg-[#F97316] text-white",
          unselected: "text-gray-700 hover:bg-gray-200",
          shadow: "shadow-lg shadow-[#F97316]/50",
        };
      case Theme.CREATIVE:
        return {
          selected: "to-orange-500 via-red-500 from-pink-500 bg-gradient-to-r text-white",
          unselected: "text-gray-700 hover:bg-gray-200",
          shadow: "shadow-lg shadow-[#EF5082]/50",
        };
      default:
        return {
          selected: "bg-[#C8DCFF] text-[#1E40AF]",
          unselected: "text-gray-700 hover:bg-gray-200",
          shadow: "shadow-lg shadow-[#C8DCFF]/50",
        };
    }
  };

  const themeColors = getThemeColors();

  // 计算哪些标签可以显示
  useEffect(() => {
    const calculateVisibleTags = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;
      const maxWidth = (containerWidth * maxWidthPercent) / 100;
      
      // More按钮的宽度（估算）
      const moreButtonWidth = 80;
      
      // 创建临时元素来测量标签宽度
      const tempDiv = document.createElement("div");
      tempDiv.style.position = "absolute";
      tempDiv.style.visibility = "hidden";
      tempDiv.style.whiteSpace = "nowrap";
      tempDiv.className = "px-6 py-2 rounded-full text-sm font-medium";
      document.body.appendChild(tempDiv);

      let currentWidth = 0;
      const visible: string[] = ["ALL"];
      let needsMore = false;

      // 先计算常规标签
      for (const tag of tags) {
        if (tag === extraTag) continue; // 跳过额外标签，稍后处理

        tempDiv.textContent = tag;
        const tagWidth = tempDiv.offsetWidth; // 不加间距

        if (currentWidth + tagWidth + moreButtonWidth > maxWidth) {
          needsMore = true;
          break;
        }

        currentWidth += tagWidth;
        visible.push(tag);
      }

      // 处理额外标签或当前选中的标签
      // 如果当前选中的标签不在可见列表中（除了ALL），需要作为额外标签显示
      const tagToShow = extraTag || (selectedTag !== "ALL" && !visible.includes(selectedTag) ? selectedTag : null);
      
      if (tagToShow && tagToShow !== "ALL" && !visible.includes(tagToShow)) {
        tempDiv.textContent = tagToShow;
        const tagWidth = tempDiv.offsetWidth; // 不加间距
        
        // 检查是否还有空间显示额外标签
        if (currentWidth + tagWidth + moreButtonWidth <= maxWidth) {
          // 空间足够，直接添加
          currentWidth += tagWidth;
          visible.push(tagToShow);
        } else {
          // 空间不够，替换掉最后一个常规标签（保留 ALL）
          if (visible.length > 1) {
            visible.pop(); // 移除最后一个标签
            visible.push(tagToShow); // 添加额外标签
            needsMore = true; // 确保显示 More 按钮
          }
        }
      }

      document.body.removeChild(tempDiv);
      
      setVisibleTags(visible);
      setShowMore(needsMore);
    };

    // 延迟执行以确保DOM已渲染
    setTimeout(calculateVisibleTags, 0);
    
    // 监听窗口大小变化
    window.addEventListener("resize", calculateVisibleTags);
    return () => window.removeEventListener("resize", calculateVisibleTags);
  }, [tags, extraTag, selectedTag, maxWidthPercent]);

  const handleTagClick = (tag: string) => {
    // 如果点击的是额外标签以外的标签，清除额外标签
    if (extraTag && tag !== extraTag) {
      setExtraTag(null);
    }
    onTagChange(tag);
  };

  const handleModalOpen = () => {
    // 打开弹窗时，初始化临时选中的标签为当前选中的标签
    setTempSelectedTag(selectedTag);
    setIsModalOpen(true);
  };

  const handleModalConfirm = () => {
    if (tempSelectedTag) {
      // 如果选择的是 ALL 或者已经在可见标签中的标签，不设置为额外标签
      if (tempSelectedTag === "ALL" || visibleTags.includes(tempSelectedTag)) {
        setExtraTag(null);
      } else {
        // 否则设置为额外标签
        setExtraTag(tempSelectedTag);
      }
      onTagChange(tempSelectedTag);
    }
    setIsModalOpen(false);
  };

  const handleModalCancel = () => {
    setTempSelectedTag(null);
    setIsModalOpen(false);
  };

  const handleModalTagClick = (tag: string) => {
    setTempSelectedTag(tag);
  };

  return (
    <>
      <div ref={containerRef} className="w-full px-6 py-6">
        <div className="mx-auto max-w-7xl text-center">
          <div
            ref={tagsContainerRef}
            className="inline-flex items-center border-1 bg-[#fff] rounded-full transition-all duration-300"
          >
            {visibleTags.map((tag) => {
              const isSelected = selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className={`
                    px-6 py-2 rounded-full text-sm font-medium transition-all duration-200
                    whitespace-nowrap
                    ${
                      isSelected
                        ? `${themeColors.selected} ${themeColors.shadow}`
                        : themeColors.unselected
                    }
                  `}
                >
                  {tag}
                </button>
              );
            })}
            
            {showMore && (
              <button
                onClick={handleModalOpen}
                className="px-4 py-2 text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors whitespace-nowrap"
              >
                More
              </button>
            )}
          </div>
        </div>
      </div>

      {/* More Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalCancel}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Tag Filter
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-wrap gap-3 py-4">
              <button
                onClick={() => handleModalTagClick("ALL")}
                className={`
                  px-6 py-2 rounded-full text-sm font-medium transition-all duration-200
                  ${
                    tempSelectedTag === "ALL"
                      ? "bg-blue-500 text-white shadow-lg shadow-blue-500/50"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }
                `}
              >
                ALL
              </button>
              
              {tags.map((tag) => {
                const isSelected = tempSelectedTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => handleModalTagClick(tag)}
                    className={`
                      px-6 py-2 rounded-full text-sm font-medium transition-all duration-200
                      ${
                        isSelected
                          ? "bg-blue-500 text-white shadow-lg shadow-blue-500/50"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }
                    `}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="default"
              variant="light"
              onPress={handleModalCancel}
            >
              {t("Cancel")}
            </Button>
            <Button
              color="primary"
              onPress={handleModalConfirm}
              isDisabled={!tempSelectedTag}
            >
              {t("Confirm")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

