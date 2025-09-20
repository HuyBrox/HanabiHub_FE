"use client";
import React, { useEffect, useRef, useState } from "react";
import { useCall } from "@/hooks/useCall";

interface IncomingCallPopupProps {
  ringtoneUrl?: string;
}

export const IncomingCallPopup: React.FC<IncomingCallPopupProps> = ({
  ringtoneUrl = "/assets/audio/nhac_chuong_viber.mp3",
}) => {
  const { state, acceptIncomingCall, rejectIncomingCall } = useCall();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    console.log("[IncomingCallPopup] State changed:", {
      ringing: state.ringing,
      callerId: state.callerId,
      callType: state.callType,
      otherPeerId: state.otherPeerId,
      visible
    });
    
    if (state.ringing) {
      setVisible(true);
      // TẮT RINGTONE TẠM THỜI ĐỂ TEST SOCKET
      console.log("[IncomingCallPopup] Ringtone disabled for testing - socket events should work now");
      // try {
      //   if (!audioRef.current) {
      //     audioRef.current = new Audio(ringtoneUrl);
      //     audioRef.current.loop = true;
      //   }
      //   audioRef.current.play().catch(() => {});
      // } catch {}
    } else {
      setVisible(false);
      // try {
      //   audioRef.current?.pause();
      //   if (audioRef.current) audioRef.current.currentTime = 0;
      // } catch {}
    }
  }, [state.ringing, ringtoneUrl]);

  if (!visible) return null;

  const onAccept = () => {
    console.log("[IncomingCallPopup] Accept button clicked", {
      callerId: state.callerId,
      otherPeerId: state.otherPeerId,
      callType: state.callType
    });
    
    // Sử dụng function mới với user gesture
    acceptIncomingCall();
  };

  const onReject = () => {
    console.log("[IncomingCallPopup] Reject button clicked");
    rejectIncomingCall();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40">
      <div className="rounded-md bg-white p-6 shadow-xl w-[360px]">
        <div className="mb-4 text-center">
          <div className="text-lg font-semibold">Cuộc gọi đến</div>
          <div className="text-sm text-gray-600">
            {state.callerId} đang gọi bạn ({state.callType})
          </div>
        </div>
        <div className="flex gap-3">
          <button
            className="flex-1 rounded bg-green-600 py-2 text-white hover:bg-green-700"
            onClick={onAccept}
          >
            Chấp nhận
          </button>
          <button
            className="flex-1 rounded bg-red-600 py-2 text-white hover:bg-red-700"
            onClick={onReject}
          >
            Từ chối
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallPopup;
