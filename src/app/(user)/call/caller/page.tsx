"use client";
import React, { useEffect, useRef } from "react";
import { useCall } from "@/hooks/useCall";
import { useSearchParams } from "next/navigation";
import { withAuth } from "@/components/auth";

const CallerPageComponent: React.FC = () => {
  const search = useSearchParams();
  const receiverId = search.get("receiverId")!;
  const callType = (search.get("callType") as "video" | "audio") || "video";
  const peerId = search.get("peerId");

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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 bg-black text-white">
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-300">
            {state.ringing
              ? "─Éang gß╗ìi..."
              : state.inCall
              ? "─Éang trong cuß╗Öc gß╗ìi"
              : "─Éang kß║┐t nß╗æi..."}
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
            Bß║ín
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
                  ≡ƒÄñ
                </div>
                <div>Audio Call - Local</div>
              </div>
            </div>
          )}
        </div>

        {/* Remote Stream */}
        <div className="relative bg-gray-900 rounded overflow-hidden">
          <div className="absolute top-2 left-2 z-10 text-xs bg-black/50 px-2 py-1 rounded">
            {state.ringing ? "─Éang gß╗ìi..." : "Ng╞░ß╗¥i nhß║¡n"}
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
                  {state.ringing ? "≡ƒô₧" : "≡ƒÄñ"}
                </div>
                <div>Audio Call - Remote</div>
                {state.ringing && (
                  <div className="text-sm text-gray-400 mt-2">─Éang gß╗ìi...</div>
                )}
              </div>
            </div>
          )}

          {/* Ringing overlay */}
          {state.ringing && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-pulse text-2xl mb-2">≡ƒô₧</div>
                <div>─Éang gß╗ìi...</div>
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
            ? "≡ƒÄñ"
            : "≡ƒöç"}
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
              ? "≡ƒô╣"
              : "≡ƒô╖"}
          </button>
        )}

        <button
          onClick={endCall}
          className="rounded bg-red-600 px-6 py-2 font-semibold hover:bg-red-700 transition-colors"
        >
          Kß║┐t th├║c
        </button>
      </div>
    </div>
  );
};

export default withAuth(CallerPageComponent);
