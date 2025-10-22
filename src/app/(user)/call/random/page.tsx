"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { VideoFrame } from "@/components/video-call/video-frame";
import { withAuth } from "@/components/auth";
import { CallControls } from "@/components/video-call/call-controls";
import { NetworkIndicator } from "@/components/video-call/network-indicator";
import { LevelSelector } from "@/components/video-call/level-selector";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, Clock } from "lucide-react";
import { useSocketContext } from "@/providers/SocketProvider";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { toast } from "sonner";
import Peer, { MediaConnection } from "peerjs";
import { CallRatingModal } from "@/components/video-call/call-rating-modal";

const SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

function RandomCallPage() {
  const { socket, connected } = useSocketContext();
  const { user } = useSelector((s: RootState) => s.auth);

  // States
  const [isSearching, setIsSearching] = useState(false);
  const [isMatched, setIsMatched] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState("NO_FILTER");
  const [partnerInfo, setPartnerInfo] = useState<{
    partnerId: string;
    partnerLevel: string;
  } | null>(null);
  const [queueSize, setQueueSize] = useState(0);
  const [callDuration, setCallDuration] = useState(0);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [randomCallId, setRandomCallId] = useState<string | null>(null);

  // Refs
  const joinedQueueRef = useRef(false);
  const peerRef = useRef<Peer | null>(null);
  const mediaConnRef = useRef<MediaConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const callStartTimeRef = useRef<number | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

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

      const peer = new Peer(peerId, peerConfig);

      console.log("[RandomCall] Initializing peer with config:", {
        peerId,
        host: url.hostname,
        port: url.port || "default",
        path: "/peerjs",
      });

      peer.on("open", (id) => {
        console.log("[RandomCall] Peer opened:", id);
        peerRef.current = peer;
        resolve(id);
      });

      peer.on("error", (err) => {
        console.error("[RandomCall] Peer error:", err);
        reject(err);
      });

      // Handle incoming call
      peer.on("call", (conn) => {
        console.log("[RandomCall] Incoming call from:", conn.peer);
        mediaConnRef.current = conn;

        if (localStreamRef.current) {
          console.log("[RandomCall] Answering call with local stream");
          conn.answer(localStreamRef.current);
        } else {
          console.error("[RandomCall] No local stream to answer with");
        }

        conn.on("stream", (remoteStream) => {
          console.log("[RandomCall] Received remote stream");
          setRemoteStream(remoteStream);
          setIsInCall(true);
        });

        conn.on("close", () => {
          console.log("[RandomCall] Call closed");
          handleCallEnd();
        });

        conn.on("error", (err) => {
          console.error("[RandomCall] Call error:", err);
          handleCallEnd();
        });
      });
    });
  }, [user]);

  // Get user media
  const getUserMedia = useCallback(async (): Promise<MediaStream> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      console.log("[RandomCall] Got user media");
      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error("[RandomCall] Failed to get user media:", error);
      toast.error("Could not access camera/microphone");
      throw error;
    }
  }, []);

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

      // Cleanup
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
    };
  }, [socket, connected, user, selectedLevel]);

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

      toast.success("Match found! Connecting...");

      try {
        // Get media and init peer
        const stream = await getUserMedia();
        const myPeerId = await initPeer();

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
        const waitForReady = async (maxWait: number = 5000): Promise<boolean> => {
          const startTime = Date.now();
          while (Date.now() - startTime < maxWait) {
            if (peerRef.current && localStreamRef.current) {
              console.log("[RandomCall] Peer and stream ready");
              return true;
            }
            await new Promise((resolve) => setTimeout(resolve, 100));
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

        // Additional delay for stability
        await new Promise((resolve) => setTimeout(resolve, 1000));

        console.log("[RandomCall] Calling partner with peer:", data.peerId);
        const conn = peerRef.current!.call(data.peerId, localStreamRef.current!);

        if (!conn) {
          throw new Error("Failed to create peer connection");
        }

        mediaConnRef.current = conn;

        conn.on("stream", (remoteStream) => {
          console.log("[RandomCall] Got remote stream");
          setRemoteStream(remoteStream);
          setIsInCall(true);
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

    // Show rating dialog
    socket.on("showRatingDialog", (data: any) => {
      console.log("[RandomCall] Show rating dialog:", data);
      setRandomCallId(data.callId);
      setCallDuration(data.callDuration);
      setShowRatingModal(true);
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
      socket.off("showRatingDialog");
      socket.off("randomCallError");
      socket.off("disconnect");
      socket.off("connect");
    };
  }, [socket, getUserMedia, initPeer, localStream, isInCall, isSearching]);

  // Attach streams to video elements
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.muted = true;
      localVideoRef.current.play().catch(() => {});
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(() => {});
    }
  }, [remoteStream]);

  // Handlers
  const handleStartSearch = () => {
    if (!socket || !connected) {
      toast.error("Socket not connected");
      return;
    }

    console.log("[RandomCall] Starting search...");
    setIsSearching(true);
    socket.emit("startRandomSearch", {});
  };

  const handleStopSearch = () => {
    if (!socket) return;

    console.log("[RandomCall] Stopping search...");
    socket.emit("stopRandomSearch", {});
    setIsSearching(false);
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

  const handleCallEnd = () => {
    console.log("[RandomCall] Ending call");

    // Notify server
    if (socket && partnerInfo) {
      socket.emit("endRandomCall", {
        partnerId: partnerInfo.partnerId,
      });
    }

    // Cleanup
    if (mediaConnRef.current) {
      mediaConnRef.current.close();
      mediaConnRef.current = null;
    }

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
            <NetworkIndicator />
            {isInCall && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Clock className="h-4 w-4" />
                {formatDuration(callDuration)}
              </div>
            )}
          </div>
        </div>

        {/* Level Selector */}
        {!isInCall && !isSearching && (
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
              isLoading={isSearching}
              isConnected={isInCall}
              isVideoOff={isVideoOff}
              isMuted={isMuted}
              userName="You"
              level={selectedLevel}
              videoRef={localVideoRef}
            />

            {/* Remote Video */}
            <VideoFrame
              type="remote"
              isLoading={isSearching}
              isConnected={isInCall}
              userName={isInCall && partnerInfo ? partnerInfo.partnerLevel : "Waiting..."}
              level={partnerInfo?.partnerLevel}
              videoRef={remoteVideoRef}
            />
          </div>

          {/* Connection Status */}
          {!isInCall && !isSearching && (
            <Card className="p-6 text-center mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <Users className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Ready to Practice Japanese?</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Connect with a native speaker at {selectedLevel} level
              </p>
              <Button onClick={handleStartSearch} size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8">
                Start Random Call
              </Button>
            </Card>
          )}

          {isSearching && (
            <Card className="p-6 text-center mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Connecting...</h3>
              <p className="text-gray-600 dark:text-gray-300">Finding a Japanese speaker for you</p>
            </Card>
          )}

          {/* Call Controls */}
          {(isInCall || isSearching) && (
            <CallControls
              isMuted={isMuted}
              isVideoOff={isVideoOff}
              onToggleMute={handleToggleMute}
              onToggleVideo={handleToggleVideo}
              onSwitchCamera={() => {}}
              onEndCall={handleCallEnd}
              disabled={isSearching}
            />
          )}
        </div>
      </div>

      {/* Rating Modal */}
      {randomCallId && partnerInfo && (
        <CallRatingModal
          open={showRatingModal}
          onClose={() => {
            setShowRatingModal(false);
            setRandomCallId(null);
          }}
          callId={randomCallId}
          partnerId={partnerInfo.partnerId}
          partnerLevel={partnerInfo.partnerLevel}
          callDuration={callDuration}
        />
      )}
    </div>
  );
}

export default withAuth(RandomCallPage);
