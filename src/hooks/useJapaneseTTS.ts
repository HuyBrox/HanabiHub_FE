"use client";

import { useState, useCallback, useEffect } from "react";
import {
  speakJapanese,
  getJapaneseVoices,
  getVietnameseVoices,
  getAllVoices,
  waitForVoices,
  isWebSpeechSupported,
  stopSpeech,
  type WebSpeechVoice,
} from "@/lib/web-speech-tts";
import { useToast } from "@/hooks/use-toast";

export interface UseJapaneseTTSReturn {
  speak: (text: string) => Promise<void>;
  isSpeaking: boolean;
  currentVoiceName: string;
  setVoiceName: (voiceName: string) => void;
  voices: WebSpeechVoice[];
  isSupported: boolean;
  stop: () => void;
}

/**
 * Hook for Japanese Text-to-Speech using Web Speech API
 */
export function useJapaneseTTS(
  initialVoiceName?: string
): UseJapaneseTTSReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentVoiceName, setCurrentVoiceName] = useState<string>(
    initialVoiceName || ""
  );
  const [voices, setVoices] = useState<WebSpeechVoice[]>([]);
  const [isSupported, setIsSupported] = useState(false);
  const { toast } = useToast();

  // Load voices on mount
  useEffect(() => {
    const checkSupport = async () => {
      if (!isWebSpeechSupported()) {
        setIsSupported(false);
        console.warn("Web Speech API not supported");
        return;
      }

      setIsSupported(true);

      try {
        // Wait for voices to load
        await waitForVoices();

        // Get both Japanese and Vietnamese voices
        const japaneseVoices = getJapaneseVoices();
        const vietnameseVoices = getVietnameseVoices();
        const allAvailableVoices = getAllVoices();

        setVoices(allAvailableVoices);

        // If no voices found, try to get all voices as fallback
        if (allAvailableVoices.length === 0) {
          const allVoices = window.speechSynthesis.getVoices();
          const fallbackVoices: WebSpeechVoice[] = allVoices.slice(0, 5).map((v) => ({
            name: v.name,
            lang: v.lang,
            default: v.default || false,
            localService: v.localService || false,
          }));
          setVoices(fallbackVoices);

          if (fallbackVoices.length > 0 && !currentVoiceName) {
            setCurrentVoiceName(fallbackVoices[0].name);
          }
        } else {
          // Set default voice if not set
          // Prefer Japanese voice, then Vietnamese, then any
          if (!currentVoiceName && allAvailableVoices.length > 0) {
            const defaultVoice =
              japaneseVoices.find((v) => v.default) || japaneseVoices[0] ||
              vietnameseVoices.find((v) => v.default) || vietnameseVoices[0] ||
              allAvailableVoices.find((v) => v.default) || allAvailableVoices[0];
            if (defaultVoice) {
              setCurrentVoiceName(defaultVoice.name);
            }
          }
        }
      } catch (error) {
        console.error("Error loading voices:", error);
      }
    };

    checkSupport();
  }, []); // Remove dependencies to avoid re-running

  const speak = useCallback(
    async (text: string) => {
      if (!isSupported) {
        toast({
          title: "Không hỗ trợ",
          description: "Web Speech API không được hỗ trợ trên trình duyệt này.",
          variant: "destructive",
        });
        return;
      }

      if (isSpeaking) {
        return; // Prevent multiple simultaneous requests
      }

      if (!text || text.trim() === "") {
        toast({
          title: "Error",
          description: "Text cannot be empty",
          variant: "destructive",
        });
        return;
      }

      setIsSpeaking(true);
      try {
        // speakJapanese now auto-detects language and selects appropriate voice
        await speakJapanese(text, currentVoiceName || undefined);
        // Reset speaking state when speech ends
        // Note: We don't reset immediately because speech might still be playing
        setTimeout(() => {
          setIsSpeaking(false);
        }, 500);
      } catch (error) {
        setIsSpeaking(false);
        console.error("Speech error:", error);
        toast({
          title: "Pronunciation Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to play pronunciation",
          variant: "destructive",
        });
      }
    },
    [currentVoiceName, isSpeaking, isSupported, toast]
  );

  const setVoiceName = useCallback((voiceName: string) => {
    setCurrentVoiceName(voiceName);
  }, []);

  const stop = useCallback(() => {
    stopSpeech();
    setIsSpeaking(false);
  }, []);

  return {
    speak,
    isSpeaking,
    currentVoiceName,
    setVoiceName,
    voices,
    isSupported,
    stop,
  };
}
