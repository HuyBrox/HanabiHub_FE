"use client";
import React, { useEffect, useRef } from "react";
import { useCall } from "@/hooks/useCall";
import { useSearchParams } from "next/navigation";
import { withAuth } from "@/components/auth";
import { VideoFrame } from "@/components/video-call/video-frame";
import { CallControls } from "@/components/video-call/call-controls";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const CallerPageComponent: React.FC = () => {
  const search = useSearchParams();
  const receiverId = search.get("receiverId")!;
  const callType = (search.get("callType") as "video" | "audio") || "video";

  const { state, endCall, toggleMic, toggleCamera, startCallInPopup } =
    useCall();

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (receiverId && callType) {
      console.log("[CallerPage] Starting call...", { receiverId, callType });
      startCallInPopup(receiverId, callType, "caller");
    }
  }, [receiverId, callType, startCallInPopup]);

  useEffect(() => {
    if (localVideoRef.current && state.localStream) {
      localVideoRef.current.srcObject = state.localStream;
      localVideoRef.current.muted = true;
      localVideoRef.current.play().catch(() => {});
    }
  }, [state.localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && state.remoteStream) {
      remoteVideoRef.current.srcObject = state.remoteStream;
      remoteVideoRef.current.play().catch(() => {});
    }
  }, [state.remoteStream]);

  const isMuted = state.localStream?.getAudioTracks()[0]?.enabled === false;
  const isVideoOff = state.localStream?.getVideoTracks()[0]?.enabled === false;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-black flex flex-col">
      {/* Compact Header */}
      <div className="absolute top-3 left-3 right-3 lg:top-4 lg:left-4 lg:right-4 z-20 flex items-center justify-between">
        <Card className="bg-black/70 backdrop-blur-md border-white/10 px-3 py-1.5 lg:px-4 lg:py-2">
          <div className="flex items-center gap-2 lg:gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <div>
              <h2 className="text-white font-semibold text-xs lg:text-sm">
                {state.ringing
                  ? "Đang gọi..."
                  : state.inCall
                  ? "Đang trong cuộc gọi"
                  : "Đang kết nối..."}
              </h2>
              <p className="text-gray-400 text-[10px] lg:text-xs">
                {callType === "video" ? "Video Call" : "Voice Call"}
              </p>
            </div>
          </div>
        </Card>
        <Badge
          variant="secondary"
          className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs"
        >
          Caller
        </Badge>
      </div>

      {/* Video Container - Full Screen */}
      <div className="flex-1 flex flex-col lg:flex-row gap-1 lg:gap-3 p-1 lg:p-3 min-h-0 pb-24 lg:pb-20">
        {/* Remote Video - Full height on desktop, full height on mobile */}
        <div className="flex-1 relative min-h-0 rounded-md lg:rounded-lg overflow-hidden shadow-2xl border border-white/10 bg-black">
          {callType === "video" ? (
            <>
              <VideoFrame
                type="remote"
                isLoading={state.ringing}
                isConnected={state.inCall}
                isVideoOff={false}
                isMuted={false}
                userName="Người nhận"
                videoRef={remoteVideoRef}
                flipped={true}
              />
            </>
          ) : (
            <Card className="relative w-full h-full bg-gradient-to-br from-green-900/30 to-green-600/20 flex items-center justify-center border-0">
              <div className="text-center">
                <div className="w-24 h-24 bg-green-600/50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/50 backdrop-blur-sm">
                  <span className="text-5xl">{state.ringing ? "📞" : "🎤"}</span>
                </div>
                <p className="text-white font-semibold text-xl">Người nhận</p>
                <p className="text-gray-400 text-sm mt-2">Audio Call</p>
                {state.ringing && (
                  <Badge className="mt-4 bg-blue-500/20 text-blue-400 border-blue-500/30 animate-pulse">
                    Đang gọi...
                  </Badge>
                )}
              </div>
              {state.ringing && (
                <div className="absolute inset-0 bg-black/30 backdrop-blur-sm rounded-lg" />
              )}
            </Card>
          )}
        </div>

        {/* Local Video - Smaller overlay on desktop, full height on mobile */}
        <div
          className={cn(
            "relative rounded-md lg:rounded-lg overflow-hidden shadow-2xl border border-white/10 bg-black",
            "lg:w-96 lg:flex-shrink-0",
            "w-full flex-1 lg:flex-none"
          )}
        >
          {callType === "video" ? (
            <VideoFrame
              type="local"
              isLoading={false}
              isConnected={state.inCall}
              isVideoOff={isVideoOff}
              isMuted={isMuted}
              userName="Bạn"
              videoRef={localVideoRef}
              flipped={true}
            />
          ) : (
            <Card className="relative w-full h-full bg-gradient-to-br from-blue-900/30 to-blue-600/20 flex items-center justify-center border-0">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-600/50 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/50 backdrop-blur-sm">
                  <span className="text-4xl">🎤</span>
                </div>
                <p className="text-white font-semibold">Bạn</p>
                <p className="text-gray-400 text-sm mt-1">Audio Call</p>
                {isMuted && (
                  <Badge className="mt-3 bg-red-500/20 text-red-400 border-red-500/30">
                    Đã tắt mic
                  </Badge>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Controls - Fixed at bottom */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-20 lg:bottom-4">
        <CallControls
          isMuted={isMuted}
          isVideoOff={isVideoOff}
          onToggleMute={toggleMic}
          onToggleVideo={toggleCamera}
          onEndCall={endCall}
          isConnected={state.inCall}
          disabled={false}
        />
      </div>
    </div>
  );
};

export default withAuth(CallerPageComponent);
