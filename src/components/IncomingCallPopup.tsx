"use client";
import React, { useEffect, useRef, useState } from "react";
import { useCall } from "@/hooks/useCall";
import { useGetUserProfileByIdQuery } from "@/store/services/userApi";
import Image from "next/image";
import { Phone, PhoneOff, Video, Mic } from "lucide-react";

interface IncomingCallPopupProps {
  ringtoneUrl?: string;
}

export const IncomingCallPopup: React.FC<IncomingCallPopupProps> = ({
  ringtoneUrl = "/assets/audio/nhac_chuong_viber.mp3",
}) => {
  const { state, acceptIncomingCall, rejectIncomingCall } = useCall();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [visible, setVisible] = useState(false);

  // Fetch caller information
  const { data: callerData, isLoading: isLoadingCaller } = useGetUserProfileByIdQuery(
    state.callerId || "",
    { skip: !state.callerId || !visible }
  );

  const callerName = callerData?.data?.fullname || callerData?.data?.username || state.callerId || "Người gọi";
  const callerAvatar = callerData?.data?.avatar;

  useEffect(() => {
    console.log("[IncomingCallPopup] State changed:", {
      ringing: state.ringing,
      callerId: state.callerId,
      callType: state.callType,
      otherPeerId: state.otherPeerId,
      visible,
    });

    if (state.ringing) {
      setVisible(true);
      // BẬT LẠI RINGTONE
      console.log("[IncomingCallPopup] Playing ringtone...");
      try {
        if (!audioRef.current) {
          audioRef.current = new Audio(ringtoneUrl);
          audioRef.current.loop = true;
        }
        audioRef.current.play().catch(() => {});
      } catch {}
    } else {
      setVisible(false);
      try {
        audioRef.current?.pause();
        if (audioRef.current) audioRef.current.currentTime = 0;
      } catch {}
    }
  }, [state.ringing, ringtoneUrl]);

  if (!visible) return null;

  const onAccept = () => {
    console.log("[IncomingCallPopup] Accept button clicked", {
      callerId: state.callerId,
      otherPeerId: state.otherPeerId,
      callType: state.callType,
    });

    // Sử dụng function mới với user gesture
    acceptIncomingCall();
  };

  const onReject = () => {
    console.log("[IncomingCallPopup] Reject button clicked");
    rejectIncomingCall();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-gradient-to-br from-slate-900/95 via-gray-900/95 to-black/95 backdrop-blur-md">
      <div className="relative rounded-2xl bg-gradient-to-br from-white to-gray-50 p-8 shadow-2xl w-full max-w-lg mx-4 border border-gray-200/50 animate-in fade-in zoom-in duration-300">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-green-500/10 rounded-full blur-3xl -z-10" />

        <div className="text-center mb-8">
          {/* Avatar */}
          <div className="relative inline-block mb-4">
            <div className="relative w-24 h-24 rounded-full overflow-hidden ring-4 ring-blue-500/20 ring-offset-4 ring-offset-white shadow-xl">
              {callerAvatar ? (
                <Image
                  src={callerAvatar}
                  alt={callerName}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">
                    {callerName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            {/* Pulsing ring animation */}
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/30 animate-ping" />
          </div>

          {/* Caller name */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isLoadingCaller ? (
              <span className="inline-block w-32 h-6 bg-gray-200 rounded animate-pulse" />
            ) : (
              callerName
            )}
          </h2>

          {/* Call type badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-4">
            {state.callType === "video" ? (
              <Video className="w-4 h-4 text-blue-600" />
            ) : (
              <Mic className="w-4 h-4 text-blue-600" />
            )}
            <span className="text-sm font-medium text-blue-700">
              {state.callType === "video" ? "Video Call" : "Voice Call"}
            </span>
          </div>

          <p className="text-gray-600 text-sm">đang gọi bạn...</p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-4">
          <button
            className="flex-1 group relative rounded-xl bg-gradient-to-r from-green-500 to-green-600 py-4 px-6 text-white font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2"
            onClick={onAccept}
          >
            <Phone className="w-5 h-5" />
            <span>Chấp nhận</span>
          </button>
          <button
            className="flex-1 group relative rounded-xl bg-gradient-to-r from-red-500 to-red-600 py-4 px-6 text-white font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2"
            onClick={onReject}
          >
            <PhoneOff className="w-5 h-5" />
            <span>Từ chối</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallPopup;
