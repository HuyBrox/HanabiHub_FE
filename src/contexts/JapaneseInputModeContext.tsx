"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type JapaneseInputMode = "off" | "hiragana" | "katakana";

interface JapaneseInputModeContextType {
  inputMode: JapaneseInputMode;
  setInputMode: (mode: JapaneseInputMode) => void;
  toggleInputMode: () => void;
}

const JapaneseInputModeContext = createContext<JapaneseInputModeContextType | undefined>(undefined);

const STORAGE_KEY = "hanabi-japanese-input-mode";

export function JapaneseInputModeProvider({ children }: { children: ReactNode }) {
  const [inputMode, setInputModeState] = useState<JapaneseInputMode>(() => {
    // Load from localStorage on mount
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "hiragana" || saved === "katakana" || saved === "off") {
        return saved;
      }
    }
    return "off";
  });

  // Save to localStorage whenever inputMode changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, inputMode);
    }
  }, [inputMode]);

  const setInputMode = (mode: JapaneseInputMode) => {
    setInputModeState(mode);
  };

  const toggleInputMode = () => {
    setInputModeState((prev) => {
      if (prev === "off") return "hiragana";
      if (prev === "hiragana") return "katakana";
      return "off";
    });
  };

  return (
    <JapaneseInputModeContext.Provider
      value={{ inputMode, setInputMode, toggleInputMode }}
    >
      {children}
    </JapaneseInputModeContext.Provider>
  );
}

export function useJapaneseInputMode() {
  const context = useContext(JapaneseInputModeContext);
  if (context === undefined) {
    throw new Error(
      "useJapaneseInputMode must be used within a JapaneseInputModeProvider"
    );
  }
  return context;
}








