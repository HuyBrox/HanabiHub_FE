"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Peer, { MediaConnection } from "peerjs";
import { useSocketContext } from "@/providers/SocketProvider";
import { getSocket } from "@/lib/socketClient";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

export type CallType = "video" | "audio";

export interface CallState {
  inCall: boolean;
  ringing: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  callType: CallType | null;
  peerId: string | null;
  callerId: string | null;
  receiverId: string | null;
  otherPeerId?: string | null;
}

export interface IncomingCallData {
  callerId: string;
  peerId: string;
  callType: CallType;
  timestamp?: string | Date;
}

export interface UseCallApi {
  state: CallState;
  // Main window functions - chỉ để emit socket và mở popup
  initiateCall: (receiverId: string, callType: CallType) => void;
  acceptIncomingCall: () => void;
  rejectIncomingCall: () => void;

  // Popup window functions - làm việc thật với media và peer connection
  startCallInPopup: (
    receiverId: string,
    callType: CallType,
    role: "caller" | "receiver",
    otherPeerId?: string
  ) => Promise<void>;
  sendPeerIdToReceiver: (
    receiverId: string,
    peerId: string,
    callType: CallType
  ) => void;
  endCall: () => void;
  toggleMic: (on?: boolean) => void;
  toggleCamera: (on?: boolean) => void;
}

const SERVER_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8080";

export function useCall(): UseCallApi {
  const { socket, connected } = useSocketContext();
  const { user } = useSelector((s: RootState) => s.auth);

  // Refs cho popup window
  const peerRef = useRef<Peer | null>(null);
  const mediaConnRef = useRef<MediaConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const incomingCallDataRef = useRef<IncomingCallData | null>(null);

  const [state, setState] = useState<CallState>({
    inCall: false,
    ringing: false,
    localStream: null,
    remoteStream: null,
    callType: null,
    peerId: null,
    callerId: null,
    receiverId: null,
    otherPeerId: null,
  });

  // ============ MAIN WINDOW FUNCTIONS ============
  // Chỉ emit socket và mở popup, không làm gì với media

  const initiateCall = useCallback(
    (receiverId: string, callType: CallType) => {
      if (!socket || !connected || !user?._id) {
        console.error("[initiateCall] Socket not ready or user not logged in");
        return;
      }

      console.log("[initiateCall] Starting call notification...", {
        receiverId,
        callType,
      });

      // 1. Mở popup trước để tạo real peer ID
      const callUrl = `/call/caller?receiverId=${receiverId}&callType=${callType}`;

      // Calculate center position for popup
      const width = 1200;
      const height = 800;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;

      const callWindow = window.open(
        callUrl,
        "call-window",
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=no,menubar=no,toolbar=no`
      );

      if (!callWindow) {
        console.error("[initiateCall] Failed to open popup window");
        alert("Vui lòng cho phép popup để thực hiện cuộc gọi");
      } else {
        console.log("[initiateCall] Call popup opened successfully");
      }
    },
    [socket, connected, user]
  );

  const acceptIncomingCall = useCallback(() => {
    if (!incomingCallDataRef.current) {
      console.error("[acceptIncomingCall] No incoming call data");
      return;
    }

    const callData = incomingCallDataRef.current;
    console.log("[acceptIncomingCall] Accepting call...", callData);

    // 1. Emit accept
    socket?.emit("acceptCall", {
      callerId: callData.callerId,
      accepted: true,
    });

    // 2. Mở popup để nhận cuộc gọi
    const callUrl = `/call/receiver?callerId=${callData.callerId}&callType=${callData.callType}&otherPeerId=${callData.peerId}`;

    // Calculate center position for popup
    const width = 1200;
    const height = 800;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    const callWindow = window.open(
      callUrl,
      "call-window",
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=no,menubar=no,toolbar=no`
    );

    if (!callWindow) {
      console.error("[acceptIncomingCall] Failed to open popup window");
      alert("Vui lòng cho phép popup để nhận cuộc gọi");
    } else {
      // Reset state
      setState((s) => ({ ...s, ringing: false }));
      incomingCallDataRef.current = null;
    }
  }, [socket]);

  const rejectIncomingCall = useCallback(() => {
    if (!incomingCallDataRef.current) return;

    const callData = incomingCallDataRef.current;
    console.log("[rejectIncomingCall] Rejecting call...", callData);

    socket?.emit("acceptCall", {
      callerId: callData.callerId,
      accepted: false,
    });

    setState((s) => ({ ...s, ringing: false }));
    incomingCallDataRef.current = null;
  }, [socket]);

  // ============ POPUP WINDOW FUNCTIONS ============
  // Làm việc thật với media và peer connection

  const sendPeerIdToReceiver = useCallback(
    (receiverId: string, peerId: string, callType: CallType) => {
      // Try to use context socket first
      if (socket && connected) {
        console.log(
          "[sendPeerIdToReceiver] Sending real peer ID (context socket)...",
          { receiverId, peerId, callType }
        );
        socket.emit("sendPeerId", { receiverId, peerId, callType });
        return;
      }

      // Otherwise wait for a socket instance to become available (fallback to global getSocket)
      const maxWait = 5000; // ms
      const interval = 200;
      let elapsed = 0;

      const tryEmit = () => {
        const s = getSocket();
        if (s && s.connected) {
          console.log(
            "[sendPeerIdToReceiver] Sending real peer ID (global socket)...",
            { receiverId, peerId, callType }
          );
          s.emit("sendPeerId", { receiverId, peerId, callType });
          return;
        }

        elapsed += interval;
        if (elapsed >= maxWait) {
          // As a last resort, attach a one-time connect listener to future socket
          const s2 = getSocket();
          if (s2) {
            s2.once("connect", () => {
              console.log(
                "[sendPeerIdToReceiver] socket connected (late). Emitting peerId"
              );
              s2.emit("sendPeerId", { receiverId, peerId, callType });
            });
            return;
          }

          console.error("[sendPeerIdToReceiver] Socket not ready after retry");
          return;
        }

        setTimeout(tryEmit, interval);
      };

      tryEmit();
    },
    [socket, connected]
  );

  const getUserMedia = useCallback(
    async (callType: CallType): Promise<MediaStream> => {
      console.log("[getUserMedia] Getting media for:", callType);

      // Tạo constraints cơ bản
      const baseAudioConstraints: MediaTrackConstraints = {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 48000, // Tăng sample rate để chất lượng tốt hơn
        channelCount: 1, // Mono để giảm bandwidth
        latency: 0.01, // Giảm độ trễ
      };

      // Thêm các constraints nâng cao của Chrome/Chromium nếu có
      const advancedAudioConstraints: any = {
        ...baseAudioConstraints,
      };

      // Chỉ thêm Google-specific constraints nếu trình duyệt hỗ trợ (Chrome/Edge)
      if (navigator.userAgent.includes("Chrome") || navigator.userAgent.includes("Edge")) {
        advancedAudioConstraints.googEchoCancellation = true;
        advancedAudioConstraints.googNoiseSuppression = true;
        advancedAudioConstraints.googAutoGainControl = true;
        advancedAudioConstraints.googHighpassFilter = true;
        advancedAudioConstraints.googTypingNoiseDetection = true;
        advancedAudioConstraints.googNoiseReduction = true;
      }

      const constraints: MediaStreamConstraints = {
        audio: advancedAudioConstraints,
        video:
          callType === "video"
            ? {
                width: { ideal: 1280, max: 1920 },
                height: { ideal: 720, max: 1080 },
                frameRate: { ideal: 30 },
                facingMode: "user",
              }
            : false,
      };

      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        // Xử lý audio với noise reduction nếu có audio track
        if (stream.getAudioTracks().length > 0) {
          try {
            const { processAudioWithNoiseReduction } = await import(
              "@/lib/audio-processor"
            );
            const processedStream = await processAudioWithNoiseReduction(
              stream,
              {
                noiseGateThreshold: 0.015, // Ngưỡng nhạy hơn
                highPassFrequency: 100, // Loại bỏ tiếng ồn tần số thấp hơn
              }
            );

            // Dừng tracks từ stream cũ
            stream.getAudioTracks().forEach((track) => track.stop());

            localStreamRef.current = processedStream;
            setState((s) => ({ ...s, localStream: processedStream }));
            console.log("[getUserMedia] Audio processed with noise reduction");
            return processedStream;
          } catch (processingError) {
            console.warn(
              "[getUserMedia] Audio processing failed, using original stream:",
              processingError
            );
            // Nếu xử lý audio thất bại, sử dụng stream gốc
            localStreamRef.current = stream;
            setState((s) => ({ ...s, localStream: stream }));
            return stream;
          }
        } else {
          localStreamRef.current = stream;
          setState((s) => ({ ...s, localStream: stream }));
        }

        console.log("[getUserMedia] Success:", {
          audio: stream.getAudioTracks().length,
          video: stream.getVideoTracks().length,
        });
        return localStreamRef.current;
      } catch (error: any) {
        console.error("[getUserMedia] Error:", error);

        if (error.name === "NotAllowedError") {
          throw new Error("Vui lòng cho phép truy cập camera và microphone");
        } else if (error.name === "NotFoundError") {
          throw new Error("Không tìm thấy camera hoặc microphone");
        } else if (error.name === "NotReadableError") {
          throw new Error("Camera đang được sử dụng bởi ứng dụng khác");
        }

        throw error;
      }
    },
    []
  );

  const initPeer = useCallback(
    (customId?: string): Promise<string> => {
      return new Promise((resolve, reject) => {
        if (peerRef.current) {
          resolve(peerRef.current.id!);
          return;
        }

        const url = new URL(SERVER_URL);
        const peerId = customId || `${user?._id || "anon"}-call-${Date.now()}`;

        const peer = new Peer(peerId, {
          host: url.hostname,
          secure: url.protocol === "https:",
          port: url.port
            ? Number(url.port)
            : url.protocol === "https:"
            ? 443
            : 80,
          path: "/peerjs",
          config: {
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
          },
        });

        console.log("[initPeer] Initializing with ID:", peerId);

        peer.on("open", (id) => {
          console.log("[initPeer] Peer opened:", id);
          peerRef.current = peer;
          setState((s) => ({ ...s, peerId: id }));
          resolve(id);
        });

        peer.on("error", (err) => {
          console.error("[initPeer] Error:", err);
          reject(err);
        });

        // Handle incoming calls
        peer.on("call", (conn) => {
          console.log("[initPeer] Incoming peer call from:", conn.peer);
          mediaConnRef.current = conn;

          const stream = localStreamRef.current;
          if (stream) {
            conn.answer(stream);
          } else {
            console.error("[initPeer] No local stream to answer with");
          }

          conn.on("stream", (remoteStream) => {
            console.log("[initPeer] Received remote stream");
            remoteStreamRef.current = remoteStream;
            setState((s) => ({
              ...s,
              remoteStream,
              inCall: true,
              ringing: false,
            }));
          });

          conn.on("close", () => {
            console.log("[initPeer] Call connection closed");
            endCall();
          });

          conn.on("error", (err) => {
            console.error("[initPeer] Call connection error:", err);
            endCall();
          });
        });
      });
    },
    [user]
  );

  const startCallInPopup = useCallback(
    async (
      receiverId: string,
      callType: CallType,
      role: "caller" | "receiver",
      otherPeerId?: string
    ) => {
      try {
        console.log("[startCallInPopup] Starting...", {
          receiverId,
          callType,
          role,
          otherPeerId,
        });

        // 1. Get media first
        const stream = await getUserMedia(callType);

        // 2. Initialize peer
        const myPeerId = await initPeer();

        if (role === "caller") {
          // Caller: emit real peer ID và wait for receiver
          console.log(
            "[startCallInPopup] Caller sending real peer ID and waiting...",
            myPeerId
          );

          // Emit real peer ID to receiver via socket
          sendPeerIdToReceiver(receiverId, myPeerId, callType);

          setState((s) => ({
            ...s,
            callType,
            receiverId,
            callerId: user?._id || null,
            ringing: true,
          }));
        } else if (role === "receiver" && otherPeerId) {
          // Receiver: wait a bit then call the caller
          console.log(
            "[startCallInPopup] Receiver calling caller:",
            otherPeerId
          );

          if (!peerRef.current) {
            throw new Error("Peer not initialized");
          }

          // Wait a bit to ensure caller peer is ready
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const conn = peerRef.current.call(otherPeerId, stream);
          mediaConnRef.current = conn;

          conn.on("stream", (remoteStream) => {
            console.log("[startCallInPopup] Receiver got remote stream");
            remoteStreamRef.current = remoteStream;
            setState((s) => ({
              ...s,
              remoteStream,
              inCall: true,
              ringing: false,
            }));
          });

          conn.on("close", () => endCall());
          conn.on("error", (err) => {
            console.error("[startCallInPopup] Connection error:", err);
            endCall();
          });

          setState((s) => ({
            ...s,
            callType,
            callerId: receiverId,
            receiverId: user?._id || null,
            inCall: true,
            ringing: false,
          }));
        }
      } catch (error: any) {
        console.error("[startCallInPopup] Error:", error);
        alert(`Lỗi cuộc gọi: ${error.message}`);
        try {
          window.close();
        } catch {}
      }
    },
    [getUserMedia, initPeer, sendPeerIdToReceiver, user]
  );

  const endCall = useCallback(() => {
    console.log("[endCall] Ending call...");

    // Close peer connection
    try {
      mediaConnRef.current?.close();
    } catch {}

    // Stop all media tracks
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    remoteStreamRef.current?.getTracks().forEach((track) => track.stop());

    // Reset refs
    localStreamRef.current = null;
    remoteStreamRef.current = null;
    mediaConnRef.current = null;

    // Reset state
    setState({
      inCall: false,
      ringing: false,
      localStream: null,
      remoteStream: null,
      callType: null,
      peerId: state.peerId, // Keep peer ID
      callerId: null,
      receiverId: null,
      otherPeerId: null,
    });

    // Close popup window
    try {
      window.close();
    } catch {}
  }, [state.peerId]);

  const toggleMic = useCallback((on?: boolean) => {
    const tracks = localStreamRef.current?.getAudioTracks();
    if (!tracks || tracks.length === 0) return;

    const enabled = on ?? !tracks[0].enabled;
    tracks.forEach((track) => (track.enabled = enabled));
    console.log("[toggleMic] Microphone:", enabled ? "ON" : "OFF");
  }, []);

  const toggleCamera = useCallback((on?: boolean) => {
    const tracks = localStreamRef.current?.getVideoTracks();
    if (!tracks || tracks.length === 0) return;

    const enabled = on ?? !tracks[0].enabled;
    tracks.forEach((track) => (track.enabled = enabled));
    console.log("[toggleCamera] Camera:", enabled ? "ON" : "OFF");
  }, []);

  // ============ SOCKET EVENT LISTENERS ============
  // Chỉ lắng nghe để update UI state trong main window

  useEffect(() => {
    if (!socket || !connected) return;

    console.log("[useCall] Registering socket events...");

    const onReceivePeerId = (data: IncomingCallData) => {
      console.log("[Socket] receivePeerId:", data);
      incomingCallDataRef.current = data;
      setState((s) => ({
        ...s,
        ringing: true,
        callerId: data.callerId,
        callType: data.callType,
        otherPeerId: data.peerId,
      }));
    };

    const onIncomingCall = (data: IncomingCallData) => {
      console.log("[Socket] incomingCall:", data);
      onReceivePeerId(data);
    };

    const onCallAnswered = (payload: {
      receiverId: string;
      accepted: boolean;
    }) => {
      console.log("[Socket] callAnswered:", payload);
      if (!payload.accepted) {
        setState((s) => ({ ...s, ringing: false }));
      }
    };

    const onCallEnded = (data: { callerId: string; reason?: string }) => {
      console.log("[Socket] callEnded:", data);
      setState((s) => ({ ...s, ringing: false, inCall: false }));
      endCall();
    };

    // Register listeners
    socket.on("receivePeerId", onReceivePeerId);
    socket.on("incomingCall", onIncomingCall);
    socket.on("callAnswered", onCallAnswered);
    socket.on("callEnded", onCallEnded);

    return () => {
      socket.off("receivePeerId", onReceivePeerId);
      socket.off("incomingCall", onIncomingCall);
      socket.off("callAnswered", onCallAnswered);
      socket.off("callEnded", onCallEnded);
    };
  }, [socket, connected, endCall]);

  return {
    state,
    // Main window functions
    initiateCall,
    acceptIncomingCall,
    rejectIncomingCall,

    // Popup window functions
    startCallInPopup,
    sendPeerIdToReceiver,
    endCall,
    toggleMic,
    toggleCamera,
  };
}

export default useCall;
