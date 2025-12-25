"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeadlineInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function HeadlineInput({ value, onChange, error }: HeadlineInputProps) {
  const isValid = value.length >= 10 && value.length <= 100;
  const charCount = value.length;

  return (
    <div className="space-y-2">
      <Label htmlFor="headline" className="text-base font-semibold text-gray-900">
        📰 Tiêu đề (Headline)
        <span className="text-red-500 ml-1">*</span>
      </Label>
      <p className="text-sm text-gray-600">
        Viết ngắn gọn, rõ ràng, liên quan đến người học. Ví dụ: "5 Cách Học Từ Vựng Hiệu Quả"
      </p>
      <div className="relative">
        <Input
          id="headline"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ví dụ: Cách cải thiện kỹ năng nghe tiếng Nhật trong 30 ngày"
          className={cn(
            "text-base",
            error && "border-red-500 focus-visible:ring-red-500",
            isValid && !error && "border-green-500 focus-visible:ring-green-500"
          )}
          maxLength={100}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isValid && !error && (
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          )}
          {error && (
            <AlertCircle className="w-4 h-4 text-red-500" />
          )}
        </div>
      </div>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {error && (
            <span className="text-red-600 font-medium">{error}</span>
          )}
          {!error && !isValid && charCount > 0 && (
            <span className="text-amber-600">
              ⚠️ Tiêu đề nên từ 10-100 ký tự
            </span>
          )}
          {isValid && (
            <span className="text-green-600 font-medium">
              ✓ Tiêu đề phù hợp
            </span>
          )}
        </div>
        <span className={cn(
          "font-medium",
          charCount > 100 ? "text-red-600" : "text-gray-500"
        )}>
          {charCount}/100
        </span>
      </div>
    </div>
  );
}

