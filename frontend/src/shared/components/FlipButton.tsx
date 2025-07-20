import React, { useState } from "react";
import { Button } from "@nextui-org/react";
import { ArrowRightIcon } from "lucide-react";

interface FlipButtonProps {
  text: string;
  onPress?: () => void;
  className?: string;
}

export const FlipButton: React.FC<FlipButtonProps> = ({
  text,
  onPress,
  className = "",
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const characters = text.split("");
  const STAGGER = 20;

  return (
    <Button
      color="primary"
      radius="full"
      onPress={onPress}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative min-w-[200px] bg-black flex items-center justify-between gap-4 pr-1 md:pr-2 h-[40px] md:h-[50px] overflow-hidden ${className}`.trim()}
    >
      {/* Primary text */}
      <div className="text-md md:text-lg font-bold flex items-center">
        {characters.map((char, index) => (
          <span
            key={index}
            className="inline-block transition-all duration-500 ease-in-out"
            style={{
              transitionProperty: "transform, opacity, filter",
              transform: isHovered
                ? `translateY(-18px) rotateX(80deg)`
                : "none",
              filter: isHovered ? "blur(4px)" : "blur(0px)",
              opacity: isHovered ? 0 : 1,
              transitionDelay: isHovered
                ? `${index * STAGGER}ms`
                : `${(characters.length - index - 1) * STAGGER}ms`,
            }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </div>

      {/* Overlay text (appears on hover) */}
      <div
        className="absolute left-4 text-md md:text-lg font-bold flex items-center"
        aria-hidden="true"
      >
        {characters.map((char, index) => (
          <span
            key={index}
            className="inline-block transition-all duration-500 ease-in-out"
            style={{
              transitionProperty: "transform, opacity, filter",
              transform: isHovered
                ? "none"
                : `translateY(18px) rotateX(-80deg)`,
              filter: isHovered ? "blur(0px)" : "blur(4px)",
              opacity: isHovered ? 1 : 0,
              transitionDelay: isHovered
                ? `${index * STAGGER}ms`
                : `${(characters.length - index - 1) * STAGGER}ms`,
            }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </div>

      {/* Arrow icon */}
      <div className="w-8 h-8 min-w-8 min-h-8 bg-gray-100 flex items-center justify-center rounded-full">
        <ArrowRightIcon size={16} className="text-default-700" />
      </div>
    </Button>
  );
};
