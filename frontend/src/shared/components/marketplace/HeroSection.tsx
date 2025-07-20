import React, { useState, useEffect, useRef } from "react";
import { Input, Button } from "@nextui-org/react";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { _DefaultPlatformConfig, usePlatformConfig } from "@/shared/contexts/PlatformConfigContext";

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearch?: () => void;
}



export const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  onSearchChange,
  onSearch,
}) => {
  const { platformConfig } = usePlatformConfig();
  const { t } = useTranslation();
  const [isFocused, setIsFocused] = useState(false);
  const [animatedText, setAnimatedText] = useState("");
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchSuggestions = [
    t("get latest documentation for libraries"),
    t("execute terminal commands safely"),
    t("find latest scientific research papers"),
    t("tools to enhance thinking and reasoning"),
    t("find flight tickets and airbnb listings"),
    t("automate web browser interactions"),
    t("send messages and receive notifications")
  ];

  useEffect(() => {
    if (isFocused || searchQuery) {
      return;
    }

    const currentSuggestion = searchSuggestions[currentSuggestionIndex];
    let timeoutId: NodeJS.Timeout;

    if (isTyping) {
      // typing effect
      if (animatedText.length < currentSuggestion.length) {
        timeoutId = setTimeout(() => {
          setAnimatedText(currentSuggestion.slice(0, animatedText.length + 1));
        }, 100);
      } else {
        // typing completed, wait for a while then start deleting
        timeoutId = setTimeout(() => {
          setIsTyping(false);
        }, 2000);
      }
    } else {
      // deleting effect
      if (animatedText.length > 0) {
        timeoutId = setTimeout(() => {
          setAnimatedText(animatedText.slice(0, -1));
        }, 50);
      } else {
        // deleting completed, switch to next suggestion
        setCurrentSuggestionIndex((prev) => (prev + 1) % searchSuggestions.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeoutId);
  }, [animatedText, currentSuggestionIndex, isTyping, isFocused, searchQuery]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch?.();
    }
  };

  const handleSearchClick = () => {
    onSearch?.();
  };

  return (
    <div className="relative overflow-hidden mx-auto p-6 py-24 max-w-7xl">
      <div className="text-center mb-12">
        <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight text-primary">
          {platformConfig.headline || t(_DefaultPlatformConfig.headline || "")}
        </h1>
        <p className="text-2xl font-medium max-w-3xl mx-auto leading-relaxed">
          {platformConfig.subheadline || t(_DefaultPlatformConfig.subheadline || "")}
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-4xl mx-auto relative">
        <Input
          ref={inputRef}
          size="lg"
          placeholder={isFocused || searchQuery ? "" : animatedText}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyPress}
          endContent={
            searchQuery && (
              <Button
                isIconOnly
                onPress={handleSearchClick}
                variant="flat"
                color="primary"
              >
                <Search size={20} />
              </Button>
            )
          }
          className="w-full"
          classNames={{
            input: "text-lg text-gray-900 placeholder:text-gray-500",
            inputWrapper: "h-16 shadow-none px-4 bg-white",
          }}
          variant="faded"
        />
      </div>
    </div>
  );
};