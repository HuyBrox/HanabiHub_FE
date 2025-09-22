"use client";
import React, { useEffect, useRef } from "react";
import { useCall } from "@/hooks/useCall";
import { useParams, useSearchParams } from "next/navigation";

const CallPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const callType = (search.get("callType") as "video" | "audio") || "video";
  const receiverId = search.get("receiverId");
  const callerId = search.get("callerId");
  const otherPeerId = search.get("otherPeerId");

  const { state, endCall, toggleMic, toggleCamera, startCallInPopup } =
    useCall();

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const id = params?.id as string;

    if (id === "caller" && receiverId) {
      // Caller popup: start call với receiver
      startCallInPopup(receiverId, callType, "caller");
    } else if (id === "receiver" && callerId && otherPeerId) {
      // Receiver popup: start call với caller
      startCallInPopup(callerId, callType, "receiver", otherPeerId);
    }
  }, [receiverId, callerId, otherPeerId, callType, startCallInPopup]);

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
      <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-2 gap-2 p-4">
        <div className="relative bg-gray-900 rounded overflow-hidden">
          {callType === "video" ? (
            <video
              ref={localVideoRef}
              className="h-full w-full object-cover"
              playsInline
              muted
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-300">
              Audio call - Local
            </div>
          )}
        </div>
        <div className="relative bg-gray-900 rounded overflow-hidden">
          {callType === "video" ? (
            <video
              ref={remoteVideoRef}
              className="h-full w-full object-cover"
              playsInline
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-300">
              Audio call - Remote
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-6 left-0 right-0 mx-auto flex w-full max-w-md items-center justify-center gap-4">
        <button
          onClick={() => toggleMic()}
          className="rounded bg-gray-700 px-4 py-2 hover:bg-gray-600"
        >
          Mic
        </button>
        {callType === "video" && (
          <button
            onClick={() => toggleCamera()}
            className="rounded bg-gray-700 px-4 py-2 hover:bg-gray-600"
          >
            Camera
          </button>
        )}
        <button
          onClick={endCall}
          className="rounded bg-red-600 px-6 py-2 font-semibold hover:bg-red-700"
        >
          Kết thúc
        </button>
      </div>
    </div>
  );
};

export default CallPage;
