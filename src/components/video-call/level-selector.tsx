"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/lib/language-context";
import { Star, BookOpen, GraduationCap, Trophy, Crown } from "lucide-react";

interface LevelSelectorProps {
  selectedLevel: string;
  onLevelChange: (level: string) => void;
  className?: string;
}

const levels = [
  {
    code: "N5",
    name: "Beginner",
    description: "Basic greetings and simple phrases",
    icon: Star,
    color: "text-green-500",
  },
  {
    code: "N4",
    name: "Elementary",
    description: "Daily conversations and basic grammar",
    icon: BookOpen,
    color: "text-blue-500",
  },
  {
    code: "N3",
    name: "Intermediate",
    description: "Complex topics and detailed discussions",
    icon: GraduationCap,
    color: "text-yellow-500",
  },
  {
    code: "N2",
    name: "Upper Intermediate",
    description: "Abstract topics and nuanced expressions",
    icon: Trophy,
    color: "text-orange-500",
  },
  {
    code: "N1",
    name: "Advanced",
    description: "Native-level fluency and complex texts",
    icon: Crown,
    color: "text-red-500",
  },
];

export function LevelSelector({
  selectedLevel,
  onLevelChange,
  className = "",
}: LevelSelectorProps) {
  const { t } = useLanguage();
  const selectedLevelData = levels.find(
    (level) => level.code === selectedLevel
  );

  return (
    <Card
      className={`p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm ${className}`}
    >
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
          {t("levels.title")}
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-300">
          {t("levels.subtitle")}
        </p>
      </div>

      <Select value={selectedLevel} onValueChange={onLevelChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={t("levels.placeholder")}>
            {selectedLevelData && (
              <div className="flex items-center gap-2">
                <selectedLevelData.icon
                  className={`h-4 w-4 ${selectedLevelData.color}`}
                />
                <span className="font-medium">{selectedLevelData.code}</span>
                <span className="text-sm text-gray-600">
                  - {t(`levels.${selectedLevelData.code}.name`)}
                </span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {levels.map((level) => {
            const IconComponent = level.icon;
            return (
              <SelectItem key={level.code} value={level.code}>
                <div className="flex items-center gap-3 py-1">
                  <IconComponent className={`h-4 w-4 ${level.color}`} />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{level.code}</span>
                      <span className="text-sm">{t(`levels.${level.code}.name`)}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {t(`levels.${level.code}.desc`)}
                    </span>
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </Card>
  );
}
