<<<<<<< HEAD
"use client";
import React, { useEffect, useRef } from "react";
import { useCall } from "@/hooks/useCall";
import { useSearchParams } from "next/navigation";
import { withAuth } from "@/components/auth";
import { VideoFrame } from "@/components/video-call/video-frame";
import { CallControls } from "@/components/video-call/call-controls";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ReceiverPageComponent: React.FC = () => {
  const search = useSearchParams();
  const callerId = search.get("callerId")!;
  const callType = (search.get("callType") as "video" | "audio") || "video";
  const otherPeerId = search.get("otherPeerId")!;

  const { state, endCall, toggleMic, toggleCamera, startCallInPopup } =
    useCall();

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (callerId && callType && otherPeerId) {
      console.log("[ReceiverPage] Starting call...", {
        callerId,
        callType,
        otherPeerId,
      });
      startCallInPopup(callerId, callType, "receiver", otherPeerId);
    }
  }, [callerId, callType, otherPeerId, startCallInPopup]);

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
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Main Call Container - Centered */}
      <div className="w-full h-full max-w-7xl mx-auto p-4 sm:p-6 flex flex-col">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <div className="p-3 sm:p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <div>
                  <h2 className="text-white font-semibold text-sm sm:text-base">
                    {state.inCall ? "Đang trong cuộc gọi" : "Đang kết nối..."}
                  </h2>
                  <p className="text-gray-400 text-xs sm:text-sm">
                    {callType === "video" ? "Video Call" : "Voice Call"}
                  </p>
                </div>
              </div>
              <Badge
                variant="secondary"
                className="bg-blue-500/20 text-blue-400 border-blue-500/30"
              >
                Receiver
              </Badge>
            </div>
          </Card>
        </div>

        {/* Video Grid - Centered and Responsive */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 min-h-0">
          {/* Remote Video - Larger on mobile */}
          <div className="relative order-1 lg:order-1">
            {callType === "video" ? (
              <VideoFrame
                type="remote"
                isLoading={!state.inCall}
                isConnected={state.inCall}
                isVideoOff={false}
                isMuted={false}
                userName="Người gọi"
                videoRef={remoteVideoRef}
              />
            ) : (
              <Card className="relative aspect-video bg-gradient-to-br from-green-900/20 to-green-600/20 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/50">
                    <span className="text-3xl sm:text-4xl">🎤</span>
                  </div>
                  <p className="text-white font-semibold text-lg sm:text-xl">
                    Người gọi
                  </p>
                  <p className="text-gray-400 text-sm sm:text-base mt-2">
                    Audio Call
                  </p>
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

          {/* Local Video - Smaller on mobile */}
          <div className="relative order-2 lg:order-2">
            {callType === "video" ? (
              <VideoFrame
                type="local"
                isLoading={false}
                isConnected={state.inCall}
                isVideoOff={isVideoOff}
                isMuted={isMuted}
                userName="Bạn"
                videoRef={localVideoRef}
              />
            ) : (
              <Card className="relative aspect-video bg-gradient-to-br from-blue-900/20 to-blue-600/20 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/50">
                    <span className="text-2xl sm:text-3xl">🎤</span>
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

        {/* Controls - Centered at bottom */}
        <div className="mt-4 sm:mt-6 flex justify-center">
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
    </div>
  );
};

export default withAuth(ReceiverPageComponent);
=======
"use client";
import React, { useEffect, useRef } from "react";
import { useCall } from "@/hooks/useCall";
import { useSearchParams } from "next/navigation";
import { withAuth } from "@/components/auth";

const ReceiverPageComponent: React.FC = () => {
  const search = useSearchParams();
  const callerId = search.get("callerId")!;
  const callType = (search.get("callType") as "video" | "audio") || "video";
  const otherPeerId = search.get("otherPeerId")!;

  const { state, endCall, toggleMic, toggleCamera, startCallInPopup } =
    useCall();

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (callerId && callType && otherPeerId) {
      console.log("[ReceiverPage] Starting call...", {
        callerId,
        callType,
        otherPeerId,
      });
      startCallInPopup(callerId, callType, "receiver", otherPeerId);
    }
  }, [callerId, callType, otherPeerId, startCallInPopup]);

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

  return (
    <div className="fixed inset-0 bg-black text-white">
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-300">
            {state.inCall ? "Đang trong cuộc gọi" : "Đang kết nối..."}
          </div>
          <div className="text-sm text-gray-300">
            {callType === "video" ? "Video Call" : "Voice Call"}
          </div>
        </div>
      </div>

      {/* Video Area */}
      <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-2 gap-2 p-4 pt-16 pb-20">
        {/* Local Stream */}
        <div className="relative bg-gray-900 rounded overflow-hidden">
          <div className="absolute top-2 left-2 z-10 text-xs bg-black/50 px-2 py-1 rounded">
            Bạn
          </div>
          {callType === "video" ? (
            <video
              ref={localVideoRef}
              className="h-full w-full object-cover"
              playsInline
              muted
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  🎤
                </div>
                <div>Audio Call - Local</div>
              </div>
            </div>
          )}
        </div>

        {/* Remote Stream */}
        <div className="relative bg-gray-900 rounded overflow-hidden">
          <div className="absolute top-2 left-2 z-10 text-xs bg-black/50 px-2 py-1 rounded">
            Người gọi
          </div>
          {callType === "video" ? (
            <video
              ref={remoteVideoRef}
              className="h-full w-full object-cover"
              playsInline
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  🎤
                </div>
                <div>Audio Call - Remote</div>
              </div>
            </div>
          )}

          {/* Connecting overlay */}
          {!state.inCall && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin text-2xl mb-2">⏳</div>
                <div>Đang kết nối...</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-6 left-0 right-0 mx-auto flex w-full max-w-md items-center justify-center gap-4">
        <button
          onClick={() => toggleMic()}
          className={`rounded px-4 py-2 transition-colors ${
            state.localStream?.getAudioTracks()[0]?.enabled !== false
              ? "bg-gray-700 hover:bg-gray-600"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {state.localStream?.getAudioTracks()[0]?.enabled !== false
            ? "🎤"
            : "🔇"}
        </button>

        {callType === "video" && (
          <button
            onClick={() => toggleCamera()}
            className={`rounded px-4 py-2 transition-colors ${
              state.localStream?.getVideoTracks()[0]?.enabled !== false
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {state.localStream?.getVideoTracks()[0]?.enabled !== false
              ? "📹"
              : "📷"}
          </button>
        )}

        <button
          onClick={endCall}
          className="rounded bg-red-600 px-6 py-2 font-semibold hover:bg-red-700 transition-colors"
        >
          Kết thúc
        </button>
      </div>
    </div>
  );
};

export default withAuth(ReceiverPageComponent);
>>>>>>> origin/main
