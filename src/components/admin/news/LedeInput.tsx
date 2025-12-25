"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface LedeInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function LedeInput({ value, onChange, error }: LedeInputProps) {
  const isValid = value.length >= 50 && value.length <= 300;
  const charCount = value.length;
  const sentences = value.split(/[.!?]+/).filter(s => s.trim().length > 0).length;

  return (
    <div className="space-y-2">
      <Label htmlFor="lede" className="text-base font-semibold text-gray-900">
        💡 Tóm tắt nhanh (Lede) - Bắt buộc
        <span className="text-red-500 ml-1">*</span>
      </Label>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
        <div className="flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Gợi ý viết Lede:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>2-3 câu giải thích tin này giúp ích gì cho người học</li>
              <li>Trả lời: "Người học đọc tin này sẽ được gì?"</li>
              <li>Ví dụ: "Bài viết này giúp bạn nắm vững 5 cách học từ vựng hiệu quả, áp dụng ngay để cải thiện điểm số trong kỳ thi sắp tới."</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="relative">
        <Textarea
          id="lede"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Viết 2-3 câu giải thích giá trị học tập của bài viết này..."
          rows={4}
          className={cn(
            "text-base resize-none",
            error && "border-red-500 focus-visible:ring-red-500",
            isValid && !error && "border-green-500 focus-visible:ring-green-500"
          )}
          maxLength={300}
        />
        <div className="absolute right-3 top-3 flex items-center gap-2">
          {isValid && !error && (
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          )}
          {error && (
            <AlertCircle className="w-4 h-4 text-red-500" />
          )}
        </div>
      </div>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          {error && (
            <span className="text-red-600 font-medium">{error}</span>
          )}
          {!error && !isValid && charCount > 0 && (
            <span className="text-amber-600">
              ⚠️ Lede nên từ 50-300 ký tự (2-3 câu)
            </span>
          )}
          {isValid && (
            <span className="text-green-600 font-medium">
              ✓ Lede phù hợp ({sentences} câu)
            </span>
          )}
          {charCount === 0 && (
            <span className="text-gray-500">
              Lede là bắt buộc để xuất bản
            </span>
          )}
        </div>
        <span className={cn(
          "font-medium",
          charCount > 300 ? "text-red-600" : "text-gray-500"
        )}>
          {charCount}/300
        </span>
      </div>
    </div>
  );
}

