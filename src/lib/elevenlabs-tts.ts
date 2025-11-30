/**
 * ElevenLabs TTS Service
 * Text-to-Speech service for Japanese pronunciation
 */

export interface ElevenLabsVoice {
  id: string;
  name: string;
  description?: string;
}

// Predefined Japanese voices from ElevenLabs
export const JAPANESE_VOICES: ElevenLabsVoice[] = [
  {
    id: "j210dv0vWm7fCknyQpbA", // Hinata
    name: "Hinata",
    description: "Japanese voice",
  },
  {
    id: "3JDquces8E8bkmvbh6Bc", // Otani
    name: "Otani",
    description: "Japanese voice",
  },
  {
    id: "WQz3clzUdMqvBf0jswZQ", // Shizuka - Natural & Soft
    name: "Shizuka",
    description: "Natural & Soft Japanese voice",
  },
];

export const DEFAULT_VOICE_ID = "j210dv0vWm7fCknyQpbA"; // Hinata

/**
 * Speak Japanese text using ElevenLabs TTS
 * @param text - Text to speak
 * @param voiceId - Voice ID (default: Hinata)
 * @returns Promise that resolves when audio starts playing
 */
export async function speakJapanese(
  text: string,
  voiceId: string = DEFAULT_VOICE_ID
): Promise<void> {
  const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;

  if (!apiKey) {
    throw new Error(
      "ElevenLabs API key is not configured. Vui lòng kiểm tra file .env và đảm bảo NEXT_PUBLIC_ELEVENLABS_API_KEY được set."
    );
  }

  if (!text || text.trim() === "") {
    throw new Error("Text cannot be empty");
  }

  try {
    const requestBody = {
      text: text,
      model_id: "eleven_multilingual_v2", // Supports Japanese
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    };

    // Call ElevenLabs TTS API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          Accept: "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      // Try to get error data
      let errorData: any = {};
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        try {
          errorData = await response.json();
        } catch (e) {
          // Failed to parse error JSON
        }
      } else {
        await response.text().catch(() => "");
      }

      const errorMessage =
        errorData?.detail?.message ||
        errorData?.message ||
        errorData?.error?.message ||
        "Unknown error";
      const errorStatus = errorData?.detail?.status || errorData?.status;

      // Provide more helpful error messages
      if (response.status === 401) {
        if (
          errorStatus === "missing_permissions" ||
          errorMessage.includes("missing_permission")
        ) {
          throw new Error(
            "API key thiếu quyền text_to_speech. Vui lòng kiểm tra API key trong tài khoản ElevenLabs và đảm bảo có quyền Text-to-Speech. Chi tiết: " +
              errorMessage
          );
        }
        if (
          errorMessage.includes("invalid") ||
          errorMessage.includes("unauthorized")
        ) {
          throw new Error(
            `API key không hợp lệ. Vui lòng kiểm tra lại API key trong file .env. Chi tiết: ${errorMessage}`
          );
        }
        throw new Error(
          `Lỗi xác thực (401): ${errorMessage}. Vui lòng kiểm tra API key trong file .env và đảm bảo có quyền truy cập.`
        );
      }

      if (response.status === 400) {
        throw new Error(
          `Lỗi request (400): ${errorMessage}. Có thể voice ID không hợp lệ hoặc text quá dài.`
        );
      }

      throw new Error(
        `ElevenLabs API error (${response.status}): ${errorMessage}`
      );
    }

    // Get audio blob
    const audioBlob = await response.blob();

    // Create audio element and play
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    // Play audio
    await audio.play();

    // Clean up URL after audio ends
    audio.addEventListener("ended", () => {
      URL.revokeObjectURL(audioUrl);
    });

    // Also clean up on error
    audio.addEventListener("error", () => {
      URL.revokeObjectURL(audioUrl);
    });
  } catch (error) {
    throw error;
  }
}
