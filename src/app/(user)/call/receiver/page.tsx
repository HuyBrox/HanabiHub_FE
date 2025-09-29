"use client";
import React, { useEffect, useRef } from "react";
import { useCall } from "@/hooks/useCall";
import { useSearchParams } from "next/navigation";

const ReceiverPage: React.FC = () => {
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

export default ReceiverPage;
