"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useJapaneseInputMode } from "@/contexts/JapaneseInputModeContext";
import { cn } from "@/lib/utils";

interface JapaneseInputModeToggleProps {
  collapsed?: boolean;
}

export function JapaneseInputModeToggle({
  collapsed = false,
}: JapaneseInputModeToggleProps) {
  const { inputMode, toggleInputMode } = useJapaneseInputMode();
  const [isHovered, setIsHovered] = useState(false);

  const modes: Array<{
    value: "off" | "hiragana" | "katakana";
    icon: string;
    label: string;
    tooltip: string;
  }> = [
    { value: "off", icon: "🔤", label: "Tắt", tooltip: "Chế độ nhập bình thường" },
    { value: "hiragana", icon: "ひ", label: "Hiragana", tooltip: "Chế độ Hiragana (romaji → ひらがな)" },
    { value: "katakana", icon: "カ", label: "Katakana", tooltip: "Chế độ Katakana (romaji → カタカナ)" },
  ];

  const currentMode = modes.find((m) => m.value === inputMode) || modes[0];

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            onClick={toggleInputMode}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn(
              "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent px-3 py-2 transition-all duration-200",
              collapsed && "px-2 justify-center w-full",
              inputMode !== "off" && "bg-primary/10 hover:bg-primary/20 border border-primary/20"
            )}
          >
            <span
              className={cn(
                "text-base md:text-lg font-medium transition-all duration-300 ease-in-out inline-block",
                isHovered && "scale-110",
                inputMode === "hiragana" && "text-blue-600 dark:text-blue-400",
                inputMode === "katakana" && "text-purple-600 dark:text-purple-400"
              )}
            >
              {currentMode.icon}
            </span>
            {!collapsed && (
              <span className="font-medium text-sm">
                {currentMode.label}
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" className="z-50">
          <p className="font-medium">{currentMode.tooltip}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Click để chuyển: {modes.map((m, i) => (
              <span key={m.value}>
                {i > 0 && " → "}
                <span className={m.value === inputMode ? "font-bold" : ""}>
                  {m.label}
                </span>
              </span>
            ))}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
