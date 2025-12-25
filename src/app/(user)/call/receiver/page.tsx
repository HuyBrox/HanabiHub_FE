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

const ReceiverPageComponent: React.FC = () => {
  const search = useSearchParams();
  const callerId = search.get("callerId")!;
  const callType = (search.get("callType") as "video" | "audio") || "video";
  const otherPeerId = search.get("otherPeerId")!;

  const { state, endCall, toggleMic, toggleCamera, startCallInPopup } =
    useCall();

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const hasStartedCallRef = useRef(false); // ✅ Guard to prevent duplicate calls

  useEffect(() => {
    // ✅ Guard: Only start call once
    if (hasStartedCallRef.current) return;

    if (callerId && callType && otherPeerId) {
      console.log("[ReceiverPage] Starting call...", {
        callerId,
        callType,
        otherPeerId,
      });
      hasStartedCallRef.current = true;
      startCallInPopup(callerId, callType, "receiver", otherPeerId).catch((err) => {
        console.error("[ReceiverPage] Failed to start call:", err);
        hasStartedCallRef.current = false; // Reset on error
      });
    }
  }, [callerId, callType, otherPeerId]); // ✅ Remove startCallInPopup from dependencies

  useEffect(() => {
    if (localVideoRef.current && state.localStream) {
      const video = localVideoRef.current;
      // ✅ Only set srcObject if it's different to avoid interruption
      if (video.srcObject !== state.localStream) {
        video.srcObject = state.localStream;
      }
      video.muted = true;

      // ✅ Safe play with proper error handling
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          // Ignore AbortError (interrupted by new load)
          if (err.name !== "AbortError") {
            console.warn("[ReceiverPage] Local video play error:", err);
          }
        });
      }
    }
  }, [state.localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && state.remoteStream) {
      const video = remoteVideoRef.current;
      // ✅ Only set srcObject if it's different to avoid interruption
      if (video.srcObject !== state.remoteStream) {
        video.srcObject = state.remoteStream;
      }
      video.muted = false; // ✅ Ensure audio is not muted

      // ✅ Debug: Log audio tracks
      const audioTracks = state.remoteStream.getAudioTracks();
      console.log("[ReceiverPage] Remote stream audio tracks:", audioTracks.length);
      if (audioTracks.length > 0) {
        console.log("[ReceiverPage] Audio track enabled:", audioTracks[0].enabled);
        console.log("[ReceiverPage] Audio track muted:", audioTracks[0].muted);
      }

      // ✅ Safe play with proper error handling
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          // Ignore AbortError (interrupted by new load)
          if (err.name !== "AbortError") {
            console.error("[ReceiverPage] Remote video play error:", err);
          }
        });
      }
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
                {state.inCall ? "Đang trong cuộc gọi" : "Đang kết nối..."}
              </h2>
              <p className="text-gray-400 text-[10px] lg:text-xs">
                {callType === "video" ? "Video Call" : "Voice Call"}
              </p>
            </div>
          </div>
        </Card>
        <Badge
          variant="secondary"
          className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs"
        >
          Receiver
        </Badge>
      </div>

      {/* Video Container - Full Screen */}
      <div className="flex-1 flex flex-col lg:flex-row gap-1 lg:gap-3 p-1 lg:p-3 min-h-0 pb-24 lg:pb-20 pointer-events-none">
        {/* Remote Video - Full height on desktop, full height on mobile */}
        <div className="flex-1 relative min-h-0 rounded-md lg:rounded-lg overflow-hidden shadow-2xl border border-white/10 bg-black">
          {callType === "video" ? (
            <>
              <VideoFrame
                type="remote"
                isLoading={!state.inCall}
                isConnected={state.inCall}
                isVideoOff={state.partnerVideoOff || false}
                isMuted={state.partnerMuted || false}
                userName="Người gọi"
                videoRef={remoteVideoRef}
                flipped={true}
              />
            </>
          ) : (
            <Card className="relative w-full h-full bg-gradient-to-br from-green-900/30 to-green-600/20 flex items-center justify-center border-0">
              <div className="text-center">
                <div className="w-24 h-24 bg-green-600/50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/50 backdrop-blur-sm">
                  <span className="text-5xl">🎤</span>
                </div>
                <p className="text-white font-semibold text-xl">Người gọi</p>
                <p className="text-gray-400 text-sm mt-2">Audio Call</p>
                {!state.inCall && (
                  <Badge className="mt-4 bg-blue-500/20 text-blue-400 border-blue-500/30 animate-pulse">
                    Đang kết nối...
                  </Badge>
                )}
              </div>
              {!state.inCall && (
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
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-[100] lg:bottom-4 pointer-events-auto">
        <CallControls
          isMuted={isMuted}
          isVideoOff={isVideoOff}
          onToggleMute={toggleMic}
          onToggleVideo={toggleCamera}
          onEndCall={endCall}
          isConnected={state.inCall}
          disabled={false}
          onNextPartner={undefined}
        />
      </div>
    </div>
  );
};

export default withAuth(ReceiverPageComponent);
