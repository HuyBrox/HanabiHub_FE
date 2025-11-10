"use client";

import { useEffect, useRef, forwardRef } from "react";
import { Input, InputProps } from "@/components/ui/input";
import { useJapaneseInputMode } from "@/contexts/JapaneseInputModeContext";
import * as wanakana from "wanakana";

interface JapaneseInputProps extends InputProps {
  enableJapanese?: boolean; // Optional prop to enable/disable Japanese input for specific inputs
}

export const JapaneseInput = forwardRef<HTMLInputElement, JapaneseInputProps>(
  ({ enableJapanese = true, ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const { inputMode } = useJapaneseInputMode();
    const boundModeRef = useRef<string | null>(null);

    // Combine refs
    useEffect(() => {
      if (typeof ref === "function") {
        ref(inputRef.current);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLInputElement | null>).current = inputRef.current;
      }
    }, [ref]);

    useEffect(() => {
      const inputElement = inputRef.current;

      if (!inputElement) {
        return;
      }

      // Determine target mode
      const targetMode = enableJapanese && inputMode !== "off" ? inputMode : "off";

      // Only update if mode actually changed
      if (boundModeRef.current === targetMode) {
        return;
      }

      // Unbind previous mode
      if (boundModeRef.current && boundModeRef.current !== "off") {
        try {
          // Use try-catch to handle any potential errors
          wanakana.unbind(inputElement);
        } catch (error) {
          // Silently ignore unbind errors
          // Element might be unmounted or already unbound
        }
        boundModeRef.current = null;
      }

      // Bind new mode if needed
      if (targetMode !== "off") {
        try {
          if (targetMode === "hiragana") {
            wanakana.bind(inputElement, {
              IMEMode: false,
              useObsoleteKana: false,
            });
            boundModeRef.current = "hiragana";
          } else if (targetMode === "katakana") {
            wanakana.bind(inputElement, {
              IMEMode: "toKatakana",
              useObsoleteKana: false,
            });
            boundModeRef.current = "katakana";
          }
        } catch (error) {
          console.warn("Error binding wanakana:", error);
          boundModeRef.current = null;
        }
      } else {
        boundModeRef.current = "off";
      }

      // Cleanup on unmount
      return () => {
        if (boundModeRef.current && boundModeRef.current !== "off" && inputElement) {
          try {
            wanakana.unbind(inputElement);
          } catch (error) {
            // Ignore cleanup errors
          }
          boundModeRef.current = null;
        }
      };
    }, [inputMode, enableJapanese]);

    return <Input ref={inputRef} {...props} />;
  }
);

JapaneseInput.displayName = "JapaneseInput";
