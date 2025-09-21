"use client";
import React from "react";
import { useCall } from "@/hooks/useCall";

interface CallButtonProps {
  receiverId: string;
  type?: "video" | "audio";
  className?: string;
  children?: React.ReactNode; // custom content
}

export const CallButton: React.FC<CallButtonProps> = ({
  receiverId,
  type = "video",
  className,
  children,
}) => {
  const { openCallWindow } = useCall();

  const handleClick = async () => {
    // window.open must be in click handler
    const url = `/call/${receiverId}?type=${type}&role=caller`;
    openCallWindow(url);
  };

  return (
    <button onClick={handleClick} className={className}>
      {children || (type === "video" ? "Gọi video" : "Gọi audio")}
    </button>
  );
};

export default CallButton;
