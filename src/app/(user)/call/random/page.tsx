"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { VideoFrame } from "@/components/video-call/video-frame";
import { withAuth } from "@/components/auth";
import { CallControls } from "@/components/video-call/call-controls";
import { NetworkIndicator } from "@/components/video-call/network-indicator";
import { LevelSelector } from "@/components/video-call/level-selector";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, Clock, Star } from "lucide-react";
import { useSocketContext } from "@/providers/SocketProvider";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { toast } from "sonner";
import Peer, { MediaConnection } from "peerjs";
import { useNotification } from "@/components/notification/NotificationProvider";

const SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

function RandomCallPage() {
  const router = useRouter();
  const { socket, connected } = useSocketContext();
  const { user } = useSelector((s: RootState) => s.auth);
  const { addNotification } = useNotification();

  // States
  const [isCallModeOn, setIsCallModeOn] = useState(false); // Toggle ON/OFF
  const [isSearching, setIsSearching] = useState(false);
  const [isMatched, setIsMatched] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState("NO_FILTER");
  const [partnerInfo, setPartnerInfo] = useState<{
    partnerId: string;
    partnerLevel: string;
    partnerName?: string;
  } | null>(null);
  const [queueSize, setQueueSize] = useState(0);
  const [callDuration, setCallDuration] = useState(0);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [hasRated, setHasRated] = useState(false); // Track if user has rated this partner
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);

  // Refs
  const joinedQueueRef = useRef(false);
  const peerRef = useRef<Peer | null>(null);
  const mediaConnRef = useRef<MediaConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const callStartTimeRef = useRef<number | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const isEndingCallRef = useRef(false); // ✅ Prevent circular handleCallEnd calls
  const socketRef = useRef(socket); // Track socket for cleanup
  const partnerInfoRef = useRef(partnerInfo); // Track partner for cleanup

  // Sync refs with state for cleanup
  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);

  useEffect(() => {
    partnerInfoRef.current = partnerInfo;
  }, [partnerInfo]);

  // Call duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isInCall) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isInCall]);

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Initialize PeerJS
  const initPeer = useCallback(async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (peerRef.current) {
        console.log("[RandomCall] Peer already exists:", peerRef.current.id);
        resolve(peerRef.current.id!);
        return;
      }

      const url = new URL(SERVER_URL);
      const peerId = `${user?._id || "anon"}-random-${Date.now()}`;

      const peerConfig: any = {
        host: url.hostname,
        secure: url.protocol === "https:",
        path: "/peerjs",
        config: {
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        },
      };

      // Only add port if explicitly specified in URL
      if (url.port) {
        peerConfig.port = Number(url.port);
      }

      console.log("[RandomCall] Creating new peer with config:", {
        peerId,
        host: url.hostname,
        port: url.port || "default",
        path: "/peerjs",
      });

      const peer = new Peer(peerId, peerConfig);

      // Set timeout to reject if peer doesn't open within 10 seconds
      const timeoutId = setTimeout(() => {
        if (!peerRef.current) {
          console.error("[RandomCall] ⏱️ Peer initialization timeout");
          peer.destroy();
          reject(new Error("Peer initialization timeout"));
        }
      }, 10000);

      peer.on("open", (id) => {
        console.log("[RandomCall] ✅ Peer opened successfully:", id);
        clearTimeout(timeoutId); // ✅ Clear timeout when peer opens successfully
        peerRef.current = peer;
        console.log("[RandomCall] ✅ peerRef.current set:", !!peerRef.current);
        resolve(id);
      });

      peer.on("error", (err) => {
        console.error("[RandomCall] ❌ Peer error:", err);
        clearTimeout(timeoutId); // ✅ Clear timeout on error too
        peerRef.current = null;
        reject(err);
      });

      peer.on("disconnected", () => {
        console.warn("[RandomCall] ⚠️ Peer disconnected - may reconnect automatically");
        // Don't end call immediately, peer might reconnect
      });

      peer.on("close", () => {
        console.warn("[RandomCall] ⚠️ Peer closed");
        peerRef.current = null;
      });

      // Handle incoming call
      peer.on("call", (conn) => {
        console.log("[RandomCall] 📞 Incoming call from:", conn.peer);
        mediaConnRef.current = conn;

        if (localStreamRef.current) {
          console.log("[RandomCall] Answering call with local stream");
          conn.answer(localStreamRef.current);
        } else {
          console.error("[RandomCall] No local stream to answer with");
        }

        conn.on("stream", (remoteStream) => {
          console.log("[RandomCall] 📹 Received remote stream");
          setRemoteStream(remoteStream);
          setIsInCall(true);
          // Set peer connection for network monitoring
          setPeerConnection(conn.peerConnection);
        });

        conn.on("close", () => {
          console.log("[RandomCall] 📴 Media connection closed");
          handleCallEnd();
        });

        conn.on("error", (err) => {
          console.error("[RandomCall] ❌ Media connection error:", err);
          // End call on connection errors
          handleCallEnd();
        });
      });
    });
  }, [user]);

  // Get user media
  const getUserMedia = useCallback(async (): Promise<MediaStream> => {
    try {
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
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30 },
          facingMode: "user",
        },
      };

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

          // KHÔNG dừng tracks từ stream gốc vì source node trong AudioContext
          // cần chúng để lấy input. Chỉ dừng khi cleanup (end call).
          // stream.getAudioTracks().forEach((track) => track.stop());

          console.log("[RandomCall] Audio processed with noise reduction");
          localStreamRef.current = processedStream;
          setLocalStream(processedStream);
          return processedStream;
        } catch (processingError) {
          console.warn(
            "[RandomCall] Audio processing failed, using original stream:",
            processingError
          );
          // Nếu xử lý audio thất bại, sử dụng stream gốc
          localStreamRef.current = stream;
          setLocalStream(stream);
          return stream;
        }
      } else {
        localStreamRef.current = stream;
        setLocalStream(stream);
        return stream;
      }
    } catch (error) {
      console.error("[RandomCall] Failed to get user media:", error);
      toast.error("Could not access camera/microphone");
      throw error;
    }
  }, []);

  // 🚨 CRITICAL: Cleanup when leaving page (unmount)
  useEffect(() => {
    // Cleanup function to be reused
    const cleanup = () => {
      console.log("[RandomCall] 🧹 Running cleanup");

      // Set flag to prevent event handlers from running during cleanup
      isEndingCallRef.current = true;

      const currentSocket = socketRef.current;
      const currentPartner = partnerInfoRef.current;

      // 1. Notify server if in active call
      if (currentSocket && currentPartner) {
        console.log("[RandomCall] Notifying server: endRandomCall");
        currentSocket.emit("endRandomCall", {
          partnerId: currentPartner.partnerId,
        });
      }

      // 2. Leave queue if searching
      if (currentSocket && joinedQueueRef.current) {
        console.log("[RandomCall] Leaving random queue");
        currentSocket.emit("leaveRandomQueue", {});
        joinedQueueRef.current = false;
      }

      // 3. Close media connection
      if (mediaConnRef.current) {
        console.log("[RandomCall] Closing media connection");
        mediaConnRef.current.close();
        mediaConnRef.current = null;
      }

      // 4. Stop all media tracks
      if (localStreamRef.current) {
        console.log("[RandomCall] Stopping local stream tracks");
        localStreamRef.current.getTracks().forEach((track) => {
          track.stop();
          console.log(`  - Stopped ${track.kind} track`);
        });
        localStreamRef.current = null;
      }

      // 5. Destroy peer connection
      if (peerRef.current) {
        console.log("[RandomCall] Destroying peer connection");
        peerRef.current.destroy();
        peerRef.current = null;
      }

      console.log("[RandomCall] ✅ Cleanup complete");
    };

    // Handle browser navigation/close
    const handleBeforeUnload = () => {
      // Cleanup without blocking (browser will kill the page anyway)
      cleanup();
    };

    // Use 'pagehide' instead of 'beforeunload' for better mobile support
    window.addEventListener("pagehide", handleBeforeUnload);
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Component unmount cleanup
    return () => {
      console.log("[RandomCall] 🚪 Component unmounting");
      window.removeEventListener("pagehide", handleBeforeUnload);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      cleanup();
    };
  }, []); // Empty deps = only run on unmount, use refs for current values

  // Join random queue on mount
  useEffect(() => {
    if (!socket || !connected || !user?._id || joinedQueueRef.current) return;

    console.log("[RandomCall] Joining queue with filters:", {
      level: selectedLevel,
      lang: "ja",
    });

    socket.emit("joinRandomQueue", {
      filters: {
        level: selectedLevel,
        lang: "ja",
      },
    });

    joinedQueueRef.current = true;

    return () => {
      if (socket && joinedQueueRef.current) {
        socket.emit("leaveRandomQueue", {});
        joinedQueueRef.current = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, connected, user?._id, selectedLevel]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Joined queue
    socket.on("joinedRandomQueue", (data: any) => {
      console.log("[RandomCall] Joined queue:", data);
      setQueueSize(data.queueSize || 0);
      toast.success("Joined random call queue");
    });

    // Match found!
    socket.on("matchFound", async (data: any) => {
      console.log("[RandomCall] Match found:", data);
      setIsMatched(true);
      setIsSearching(false);
      setPartnerInfo({
        partnerId: data.partnerId,
        partnerLevel: data.partnerLevel,
      });
      callStartTimeRef.current = Date.now();
      setHasRated(false); // Reset rating UI for new partner

      toast.success("Match found! Connecting...");

      try {
        // Get media and init peer (these MUST complete before partner tries to call)
        const stream = await getUserMedia();
        console.log("[RandomCall] User media ready:", !!stream);

        const myPeerId = await initPeer();
        console.log("[RandomCall] Peer initialized with ID:", myPeerId);

        // Double check that peerRef is actually set
        if (!peerRef.current) {
          throw new Error("Peer reference not set after initialization");
        }

        // Send peer ID to partner via socket
        socket.emit("sendRandomCallPeerId", {
          partnerId: data.partnerId,
          peerId: myPeerId,
        });
      } catch (error) {
        console.error("[RandomCall] Failed to setup call:", error);
        toast.error("Failed to setup call");
        handleCallEnd();
      }
    });

    // Receive partner's peer ID
    socket.on("receiveRandomCallPeerId", async (data: any) => {
      console.log("[RandomCall] Received partner peer ID:", data.peerId);

      try {
        if (!data.peerId) {
          console.error("[RandomCall] Invalid peer ID received");
          toast.error("Invalid partner connection");
          handleCallEnd();
          return;
        }

        // Wait for peer and stream to be ready (with timeout)
        const waitForReady = async (maxWait: number = 10000): Promise<boolean> => {
          const startTime = Date.now();
          while (Date.now() - startTime < maxWait) {
            if (peerRef.current && localStreamRef.current) {
              console.log("[RandomCall] Peer and stream ready");
              return true;
            }
            console.log("[RandomCall] Waiting for ready... Peer:", !!peerRef.current, "Stream:", !!localStreamRef.current);
            await new Promise((resolve) => setTimeout(resolve, 200));
          }
          console.error("[RandomCall] Timeout - Peer ready:", !!peerRef.current, "Stream ready:", !!localStreamRef.current);
          return false;
        };

        const isReady = await waitForReady();

        if (!isReady) {
          console.error("[RandomCall] Timeout waiting for peer/stream");
          toast.error("Connection timeout. Please try again.");
          handleCallEnd();
          return;
        }

        // Verify one more time
        if (!peerRef.current || !localStreamRef.current) {
          throw new Error("Peer or stream became null after ready check");
        }

        // Additional delay for stability
        await new Promise((resolve) => setTimeout(resolve, 500));

        console.log("[RandomCall] Calling partner with peer:", data.peerId);
        console.log("[RandomCall] peerRef.current:", peerRef.current);
        console.log("[RandomCall] localStreamRef.current:", localStreamRef.current);

        const conn = peerRef.current.call(data.peerId, localStreamRef.current);

        if (!conn) {
          throw new Error("Failed to create peer connection");
        }

        mediaConnRef.current = conn;

        conn.on("stream", (remoteStream) => {
          console.log("[RandomCall] Got remote stream");
          setRemoteStream(remoteStream);
          setIsInCall(true);
          // Set peer connection for network monitoring
          setPeerConnection(conn.peerConnection);
        });

        conn.on("close", () => {
          console.log("[RandomCall] Connection closed");
          handleCallEnd();
        });

        conn.on("error", (err) => {
          console.error("[RandomCall] Connection error:", err);
          toast.error("Connection error with partner");
          handleCallEnd();
        });
      } catch (error) {
        console.error("[RandomCall] Failed to call partner:", error);
        toast.error("Failed to connect to partner");
        handleCallEnd();
      }
    });

    // Searching status
    socket.on("searchingForMatch", (data: any) => {
      console.log("[RandomCall] Searching:", data);
      setQueueSize(data.queueSize || 0);
    });

    // Search stopped
    socket.on("searchStopped", () => {
      console.log("[RandomCall] Search stopped");
      setIsSearching(false);
    });

    // Rating submitted successfully
    socket.on("ratingSubmitted", (data: any) => {
      console.log("[RandomCall] ✅ Rating submitted successfully:", data);
      // Already handled in handleRatePartner (setHasRated + toast)
    });

    // Partner rated you
    socket.on("partnerRatedYou", (data: any) => {
      console.log("[RandomCall] Partner rated you:", data);
      addNotification({
        title: `${data.partnerName || "Partner"} rated you ${data.rating} stars! 💫`,
        message: "Your listening & speaking skills have been tracked!",
        type: "success",
        duration: 6000,
      });
    });

    // Partner skipped to next
    socket.on("partnerSkipped", (data: any) => {
      console.log("[RandomCall] Partner skipped:", data);
      toast.info("Partner moved to next. Finding you a new match...");

      // End current call and search for new match
      if (mediaConnRef.current) {
        mediaConnRef.current.close();
        mediaConnRef.current = null;
      }

      if (remoteStream) {
        remoteStream.getTracks().forEach((track) => track.stop());
        setRemoteStream(null);
      }

      setIsInCall(false);
      setIsMatched(false);
      setPartnerInfo(null);
      setCallDuration(0);
      setHoveredRating(0);
      setHasRated(false); // Reset for new partner

      // Auto search for new match if call mode is still on
      if (isCallModeOn) {
        setIsSearching(true);
        socket.emit("startRandomSearch", {});
      }
    });

    // Errors
    socket.on("randomCallError", (error: any) => {
      console.error("[RandomCall] Error:", error);
      toast.error(error.message || "Random call error");
      setIsSearching(false);
      setIsMatched(false);
    });

    // Socket disconnect handling
    socket.on("disconnect", (reason: string) => {
      console.warn("[RandomCall] Socket disconnected:", reason);
      if (isInCall) {
        toast.error("Connection lost");
        handleCallEnd();
      } else if (isSearching) {
        toast.warning("Connection lost. Please try again.");
        setIsSearching(false);
      }
    });

    // Socket reconnect handling
    socket.on("connect", () => {
      console.log("[RandomCall] Socket reconnected");
      if (isSearching) {
        toast.info("Reconnected. Resuming search...");
      }
    });

    return () => {
      socket.off("joinedRandomQueue");
      socket.off("matchFound");
      socket.off("receiveRandomCallPeerId");
      socket.off("searchingForMatch");
      socket.off("searchStopped");
      socket.off("ratingSubmitted");
      socket.off("partnerRatedYou");
      socket.off("partnerSkipped");
      socket.off("randomCallError");
      socket.off("disconnect");
      socket.off("connect");
    };
  }, [socket, getUserMedia, initPeer, localStream, isInCall, isSearching, isCallModeOn]);

  // Attach streams to video elements
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.muted = true;
      localVideoRef.current.play().catch(() => {});
    }
  }, [localStream, isVideoOff]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(() => {});
    }
  }, [remoteStream]);

  // Handlers
  const handleToggleCallMode = async () => {
    if (!socket || !connected) {
      toast.error("Socket not connected");
      return;
    }

    if (!isCallModeOn) {
      // Turn ON - Start searching
      console.log("[RandomCall] Call mode ON - Starting search...");

      try {
        // Get user media first to show local preview
        await getUserMedia();
        console.log("[RandomCall] Local preview ready");
      } catch (error) {
        console.error("[RandomCall] Failed to get media:", error);
        toast.error("Could not access camera/microphone");
        return;
      }

      setIsCallModeOn(true);
      setIsSearching(true);
      socket.emit("startRandomSearch", {});
    } else {
      // Turn OFF - Stop everything
      console.log("[RandomCall] Call mode OFF - Stopping...");
      handleCallEnd();
      setIsCallModeOn(false);
    }
  };

  const handleEndCurrentCall = () => {
    if (!socket) {
      toast.error("Socket not connected");
      return;
    }

    console.log("[RandomCall] End current call - Starting new search...");

    // End current call if active
    if (partnerInfo) {
      // Notify server
      socket.emit("endRandomCall", {
        partnerId: partnerInfo.partnerId,
      });
    }

    // Cleanup media connections
    if (mediaConnRef.current) {
      mediaConnRef.current.close();
      mediaConnRef.current = null;
    }

    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
      setRemoteStream(null);
    }

    // Keep local stream for next call
    // Start new search
    socket.emit("startRandomSearch", {});

    // Reset states but keep searching
    setIsInCall(false);
    setIsMatched(false);
    setPartnerInfo(null);
    setCallDuration(0);
    setHoveredRating(0);
    setHasRated(false); // Reset for new partner
    setIsSearching(true);

    toast.info("Finding new partner...");
  };

  const handleNextPartner = () => {
    if (!socket || !partnerInfo) {
      toast.error("No active call");
      return;
    }

    console.log("[RandomCall] Next partner - Finding new match...");

    // End current call
    if (mediaConnRef.current) {
      mediaConnRef.current.close();
      mediaConnRef.current = null;
    }

    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
      setRemoteStream(null);
    }

    // Notify server to find next partner
    socket.emit("nextPartner", {
      currentPartnerId: partnerInfo.partnerId,
    });

    // Reset states but keep searching
    setIsInCall(false);
    setIsMatched(false);
    setPartnerInfo(null);
    setCallDuration(0);
    setHoveredRating(0);
    setHasRated(false); // Reset for new partner
    setIsSearching(true);

    toast.info("Finding next partner...");
  };

  const handleLevelChange = (level: string) => {
    setSelectedLevel(level);

    // Re-join queue with new level
    if (socket && connected && joinedQueueRef.current) {
      socket.emit("leaveRandomQueue", {});
      setTimeout(() => {
        socket?.emit("joinRandomQueue", {
          filters: {
            level,
            lang: "ja",
          },
        });
      }, 100);
    }
  };

  const handleToggleMute = () => {
    if (!localStream) return;
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  };

  const handleToggleVideo = () => {
    if (!localStream) return;
    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOff(!videoTrack.enabled);
    }
  };

  const handleRatePartner = (rating: number) => {
    if (!socket || !partnerInfo) {
      toast.error("Unable to send rating");
      return;
    }

    console.log("[RandomCall] ⭐ Rating partner:", {
      partnerId: partnerInfo.partnerId,
      rating,
      isInCall,
      isConnected: socket.connected
    });

    // Send rating to server via socket
    socket.emit("ratePartner", {
      partnerId: partnerInfo.partnerId,
      rating,
    });

    // Hide rating UI
    setHasRated(true);

    // Show success toast
    toast.success(`Sent ${rating} star${rating > 1 ? "s" : ""} 💫 to partner!`);

    // Reset hover state
    setHoveredRating(0);
  };

  const handleCallEnd = () => {
    // ✅ GUARD: Prevent circular calls
    if (isEndingCallRef.current) {
      console.log("[RandomCall] ⚠️ Already ending call, skipping duplicate call");
      return;
    }

    isEndingCallRef.current = true;
    console.log("[RandomCall] 🔴 handleCallEnd called - Stack trace:");
    console.trace(); // ✅ Show where this function was called from

    // Notify server
    if (socket && partnerInfo) {
      socket.emit("endRandomCall", {
        partnerId: partnerInfo.partnerId,
      });
    }

    // Cleanup media connections
    if (mediaConnRef.current) {
      mediaConnRef.current.close();
      mediaConnRef.current = null;
    }

    // Clear peer connection
    setPeerConnection(null);

    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }

    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
      setRemoteStream(null);
    }

    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }

    // Clear refs
    localStreamRef.current = null;

    // Reset states
    setIsInCall(false);
    setIsMatched(false);
    setIsSearching(false);
    setPartnerInfo(null);
    setCallDuration(0);
    callStartTimeRef.current = null;

    // Reset rating UI
    setHoveredRating(0);
    setHasRated(false);
    setIsMuted(false);
    setIsVideoOff(false);

    // ✅ Reset guard after cleanup
    setTimeout(() => {
      isEndingCallRef.current = false;
    }, 500);
  };

  return (
    <div className="h-full bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-6 h-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Random Japanese Call</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Practice Japanese with native speakers</p>
          </div>

          <div className="flex items-center gap-4">
            <NetworkIndicator peerConnection={peerConnection} />
            {isInCall && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Clock className="h-4 w-4" />
                {formatDuration(callDuration)}
              </div>
            )}
          </div>
        </div>

        {/* Level Selector */}
        {!isCallModeOn && (
          <div className="mb-6">
            <LevelSelector
              selectedLevel={selectedLevel}
              onLevelChange={handleLevelChange}
            />
          </div>
        )}

        {/* Video Call Interface */}
        <div className="flex-1 flex flex-col">
          {/* Video Frames */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {/* Local Video */}
            <VideoFrame
              type="local"
              isLoading={false}
              isConnected={isInCall}
              isVideoOff={isVideoOff}
              isMuted={isMuted}
              userName="You"
              level={selectedLevel}
              videoRef={localVideoRef}
              flipped={true}
            />

            {/* Remote Video */}
            <VideoFrame
              type="remote"
              isLoading={isSearching}
              isConnected={isInCall}
              userName={isInCall && partnerInfo ? partnerInfo.partnerLevel : "Waiting..."}
              level={partnerInfo?.partnerLevel}
              videoRef={remoteVideoRef}
              flipped={true}
            />
          </div>

          {/* Connection Status */}
          {!isCallModeOn && (
            <Card className="p-6 text-center mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <Users className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Ready to Practice Japanese?</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Connect with a native speaker at {selectedLevel} level
              </p>
              <Button onClick={handleToggleCallMode} size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8">
                🔴 Turn Call Mode ON
              </Button>
            </Card>
          )}

          {isCallModeOn && isSearching && !isInCall && (
            <Card className="p-6 text-center mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Searching...</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-2">Finding a Japanese speaker for you</p>
              <Button onClick={handleToggleCallMode} size="sm" variant="outline" className="mt-2">
                🔴 Turn Call Mode OFF
              </Button>
            </Card>
          )}

          {/* Call Controls */}
          {isCallModeOn && (
            <div className="space-y-4">
            <CallControls
              isMuted={isMuted}
              isVideoOff={isVideoOff}
              onToggleMute={handleToggleMute}
              onToggleVideo={handleToggleVideo}
                onNextPartner={handleNextPartner}
                onEndCall={handleEndCurrentCall}
                onStartCall={async () => {
                  await getUserMedia();
                  socket?.emit("startRandomSearch", {});
                  setIsSearching(true);
                }}
                disabled={isSearching && !isInCall}
                isConnected={isInCall}
              />
            </div>
          )}
        </div>
      </div>

      {/* Rating Widget - Only show during call and hasn't rated yet */}
      {isInCall && partnerInfo && !hasRated && (
        <div className="fixed bottom-24 right-6 z-50">
          <Card className="p-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-lg">
            <p className="text-xs text-gray-600 dark:text-gray-300 mb-2 text-center">
              Rate partner's Japanese skills
            </p>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="transition-transform hover:scale-110 focus:outline-none"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => handleRatePartner(star)}
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= hoveredRating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default withAuth(RandomCallPage);
