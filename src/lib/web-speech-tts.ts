/**
 * Web Speech API TTS Service
 * Text-to-Speech service with automatic language detection (Vietnamese/Japanese)
 */

export type DetectedLanguage = "vi" | "ja" | "unknown";

export interface WebSpeechVoice {
  name: string;
  lang: string;
  default?: boolean;
  localService?: boolean;
}

/**
 * Detect language from text (Vietnamese or Japanese)
 * @param text - Text to analyze
 * @returns Detected language code
 */
export function detectLanguage(text: string): DetectedLanguage {
  if (!text || text.trim() === "") {
    return "unknown";
  }

  // Japanese character ranges
  const hiraganaRegex = /[\u3040-\u309F]/; // Hiragana
  const katakanaRegex = /[\u30A0-\u30FF]/; // Katakana
  const kanjiRegex = /[\u4E00-\u9FAF]/; // Kanji
  const japanesePunctuationRegex = /[\u3000-\u303F]/; // Japanese punctuation

  // Check for Japanese characters
  const hasJapanese =
    hiraganaRegex.test(text) ||
    katakanaRegex.test(text) ||
    kanjiRegex.test(text) ||
    japanesePunctuationRegex.test(text);

  if (hasJapanese) {
    return "ja";
  }

  // Vietnamese character detection
  // Vietnamese uses Latin script with diacritics
  const vietnameseDiacriticsRegex = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđĐ]/;
  const hasVietnamese = vietnameseDiacriticsRegex.test(text);

  if (hasVietnamese) {
    return "vi";
  }

  // If text contains only ASCII/Latin without diacritics, check context
  // For now, default to Vietnamese if no Japanese characters found
  // (since most content in this app is Vietnamese or Japanese)
  return "vi";
}

/**
 * Get available Japanese voices from Web Speech API
 * @returns Array of available Japanese voices
 */
export function getJapaneseVoices(): WebSpeechVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return [];
  }

  const voices = window.speechSynthesis.getVoices();
  return voices
    .filter((voice) => voice.lang.startsWith("ja") || voice.lang.includes("Japanese"))
    .map((voice) => ({
      name: voice.name,
      lang: voice.lang,
      default: voice.default || false,
      localService: voice.localService || false,
    }));
}

/**
 * Get available Vietnamese voices from Web Speech API
 * @returns Array of available Vietnamese voices
 */
export function getVietnameseVoices(): WebSpeechVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return [];
  }

  const voices = window.speechSynthesis.getVoices();
  return voices
    .filter((voice) => voice.lang.startsWith("vi") || voice.lang.includes("Vietnamese"))
    .map((voice) => ({
      name: voice.name,
      lang: voice.lang,
      default: voice.default || false,
      localService: voice.localService || false,
    }));
}

/**
 * Get all available voices (Japanese and Vietnamese)
 * @returns Array of available voices
 */
export function getAllVoices(): WebSpeechVoice[] {
  const japaneseVoices = getJapaneseVoices();
  const vietnameseVoices = getVietnameseVoices();
  return [...japaneseVoices, ...vietnameseVoices];
}

/**
 * Wait for voices to be loaded
 */
export function waitForVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      resolve([]);
      return;
    }

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    // Set timeout to prevent infinite waiting
    const timeout = setTimeout(() => {
      const fallbackVoices = window.speechSynthesis.getVoices();
      resolve(fallbackVoices.length > 0 ? fallbackVoices : []);
    }, 1000);

    // Wait for voiceschanged event
    const handleVoicesChanged = () => {
      clearTimeout(timeout);
      const loadedVoices = window.speechSynthesis.getVoices();
      resolve(loadedVoices);
      // Remove listener after first call
      window.speechSynthesis.onvoiceschanged = null;
    };

    window.speechSynthesis.onvoiceschanged = handleVoicesChanged;

    // Try to trigger voices loading by calling getVoices again
    // Some browsers need this to load voices
    window.speechSynthesis.getVoices();
  });
}

/**
 * Speak text using Web Speech API with automatic language detection
 * @param text - Text to speak
 * @param voiceName - Optional voice name to use (if not provided, auto-selects based on language)
 * @returns Promise that resolves when speech starts
 */
export async function speakJapanese(
  text: string,
  voiceName?: string
): Promise<void> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    throw new Error("Web Speech API không được hỗ trợ trên trình duyệt này.");
  }

  if (!text || text.trim() === "") {
    throw new Error("Text cannot be empty");
  }

  // Detect language from text
  const detectedLang = detectLanguage(text);
  const langCode = detectedLang === "ja" ? "ja-JP" : detectedLang === "vi" ? "vi-VN" : "ja-JP";

  console.log("Detected language:", detectedLang, "for text:", text.substring(0, 50));

  // Wait for voices to be loaded
  const voices = await waitForVoices();
  console.log("Available voices:", voices.length, "voices loaded");

  // Find appropriate voice based on detected language
  let selectedVoice: SpeechSynthesisVoice | undefined;

  if (voiceName) {
    // Use specified voice if provided
    selectedVoice = voices.find((v) => v.name === voiceName);
    if (selectedVoice) {
      console.log("Using selected voice:", selectedVoice.name, selectedVoice.lang);
    }
  }

  if (!selectedVoice) {
    // Auto-select voice based on detected language
    if (detectedLang === "ja") {
      // Try to find Japanese voice - prioritize exact match, then any Japanese
      selectedVoice = voices.find(
        (v) => v.lang === "ja-JP" || v.lang === "ja"
      ) || voices.find(
        (v) => v.lang.startsWith("ja") || v.lang.includes("Japanese")
      );
      if (selectedVoice) {
        console.log("Using Japanese voice:", selectedVoice.name, selectedVoice.lang);
      }
    } else if (detectedLang === "vi") {
      // Try to find Vietnamese voice - prioritize exact match, then any Vietnamese
      selectedVoice = voices.find(
        (v) => v.lang === "vi-VN" || v.lang === "vi"
      ) || voices.find(
        (v) => v.lang.startsWith("vi") || v.lang.includes("Vietnamese")
      );
      if (selectedVoice) {
        console.log("Using Vietnamese voice:", selectedVoice.name, selectedVoice.lang);
      }
    }
  }

  // If still no voice found, use default or any available voice matching the language
  if (!selectedVoice) {
    // Try to find any voice with matching language code first
    if (detectedLang !== "unknown") {
      selectedVoice = voices.find((v) => v.lang.startsWith(langCode.split("-")[0]));
    }

    // If still not found, use default or first available
    if (!selectedVoice) {
      selectedVoice = voices.find((v) => v.default) || voices[0];
      if (selectedVoice) {
        console.log("Using fallback voice:", selectedVoice.name, selectedVoice.lang);
      }
    }
  }

  // If no voice at all, still try to speak (browser will use default)
  if (!selectedVoice && voices.length === 0) {
    console.warn("No voices available, using browser default");
  }

  return new Promise((resolve, reject) => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.lang = langCode;

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    // Set speech properties for better Japanese pronunciation
    utterance.rate = 1.0; // Normal speed
    utterance.pitch = 1.0; // Normal pitch
    utterance.volume = 1.0; // Full volume

    // Add timeout to detect if speech doesn't start
    const startTimeout = setTimeout(() => {
      // If speech hasn't started after 2 seconds, it might be an issue
      // But we'll still resolve to avoid hanging
      console.warn("Speech start timeout, but continuing...");
    }, 2000);

    utterance.onstart = () => {
      clearTimeout(startTimeout);
      resolve();
    };

    utterance.onerror = (event) => {
      clearTimeout(startTimeout);
      let errorMessage = "Lỗi phát âm";
      if (event.error === "not-allowed") {
        errorMessage = "Quyền truy cập microphone/speech bị từ chối. Vui lòng kiểm tra cài đặt trình duyệt.";
      } else if (event.error === "network") {
        errorMessage = "Lỗi kết nối mạng khi phát âm.";
      } else if (event.error === "synthesis-failed") {
        errorMessage = "Không thể tạo giọng nói. Vui lòng thử lại.";
      } else if (event.error === "synthesis-unavailable") {
        errorMessage = "Dịch vụ Text-to-Speech không khả dụng.";
      } else if (event.error === "text-too-long") {
        errorMessage = "Văn bản quá dài để phát âm.";
      } else if (event.error === "invalid-argument") {
        errorMessage = "Tham số không hợp lệ.";
      }
      reject(new Error(errorMessage));
    };

    utterance.onend = () => {
      // Speech completed successfully
    };

    // Some browsers require user interaction before allowing speech
    // Try to speak, but handle cases where it might be blocked
    try {
      window.speechSynthesis.speak(utterance);

      // If speech doesn't start within a reasonable time, it might be blocked
      // But we'll let the onerror handler deal with it
    } catch (error) {
      reject(new Error(`Không thể phát âm: ${error instanceof Error ? error.message : "Unknown error"}`));
    }
  });
}

/**
 * Stop current speech
 */
export function stopSpeech(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Check if Web Speech API is supported
 */
export function isWebSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

