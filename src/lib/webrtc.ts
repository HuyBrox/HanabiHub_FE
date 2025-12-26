/**
 * WebRTC utilities for fetching TURN credentials
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export interface IceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}

export interface TurnCredentialsResponse {
  success: boolean;
  data: {
    iceServers: IceServer[];
  };
}

/**
 * Fetch TURN credentials from backend
 * These credentials include Twilio TURN servers for better connectivity
 * across different networks (NAT, firewall issues)
 */
export async function getTurnCredentials(): Promise<IceServer[]> {
  try {
    const response = await fetch(`${API_URL}/webrtc/turn-credentials`, {
      method: "GET",
      credentials: "include", // Send cookies for authentication
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.warn("[getTurnCredentials] Failed to fetch TURN credentials, using fallback STUN only");
      // Fallback to STUN only if TURN credentials fail
      return [
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ];
    }

    const data: TurnCredentialsResponse = await response.json();

    if (data.success && data.data?.iceServers) {
      console.log("[getTurnCredentials] ✅ TURN credentials fetched successfully");
      return data.data.iceServers;
    }

    // Fallback to STUN only
    console.warn("[getTurnCredentials] Invalid response, using fallback STUN only");
    return [
      {
        urls: "stun:stun.l.google.com:19302",
      },
    ];
  } catch (error) {
    console.error("[getTurnCredentials] Error fetching TURN credentials:", error);
    // Fallback to STUN only on error
    return [
      {
        urls: "stun:stun.l.google.com:19302",
      },
    ];
  }
}



