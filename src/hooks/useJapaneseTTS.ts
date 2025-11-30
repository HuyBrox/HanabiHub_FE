"use client";

import { useState, useCallback } from "react";
import {
  speakJapanese,
  JAPANESE_VOICES,
  DEFAULT_VOICE_ID,
} from "@/lib/elevenlabs-tts";
import { useToast } from "@/hooks/use-toast";

export interface UseJapaneseTTSReturn {
  speak: (text: string) => Promise<void>;
  isSpeaking: boolean;
  currentVoiceId: string;
  setVoiceId: (voiceId: string) => void;
  voices: typeof JAPANESE_VOICES;
}

/**
 * Hook for Japanese Text-to-Speech using ElevenLabs
 */
export function useJapaneseTTS(
  initialVoiceId: string = DEFAULT_VOICE_ID
): UseJapaneseTTSReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentVoiceId, setCurrentVoiceId] = useState(initialVoiceId);
  const { toast } = useToast();

  const speak = useCallback(
    async (text: string) => {
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
        await speakJapanese(text, currentVoiceId);
      } catch (error) {
        toast({
          title: "Pronunciation Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to play pronunciation",
          variant: "destructive",
        });
      } finally {
        // Reset speaking state after a short delay to allow audio to start
        setTimeout(() => {
          setIsSpeaking(false);
        }, 100);
      }
    },
    [currentVoiceId, isSpeaking, toast]
  );

  const setVoiceId = useCallback((voiceId: string) => {
    setCurrentVoiceId(voiceId);
  }, []);

  return {
    speak,
    isSpeaking,
    currentVoiceId,
    setVoiceId,
    voices: JAPANESE_VOICES,
  };
}
