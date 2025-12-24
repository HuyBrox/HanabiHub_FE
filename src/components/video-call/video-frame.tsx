"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shimmer } from "@/components/ui/shimmer";
import { User, Mic, MicOff, VideoOff } from "lucide-react";
import { RefObject } from "react";
import { cn } from "@/lib/utils";

interface VideoFrameProps {
  type: "local" | "remote";
  isLoading?: boolean;
  isConnected?: boolean;
  isVideoOff?: boolean;
  isMuted?: boolean;
  userName?: string;
  level?: string;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  flipped?: boolean; // CSS flip for mirror effect
}

export function VideoFrame({
  type,
  isLoading = false,
  isConnected = false,
  isVideoOff = false,
  isMuted = false,
  userName = "User",
  level,
  videoRef,
  flipped = false,
}: VideoFrameProps) {
  const isLocal = type === "local";

  return (
    <Card className="relative w-full h-full bg-gray-900 overflow-hidden group">
      {/* Video Content */}
      {isLoading ? (
        <Shimmer className="w-full h-full" />
      ) : !isVideoOff && videoRef ? (
        <div className="relative w-full h-full bg-gray-800">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isLocal}
            className={cn(
              "w-full h-full object-cover",
              flipped && "scale-x-[-1]"
            )}
          />
        </div>
      ) : (
        <div className="flex items-center justify-center h-full bg-gray-800">
          {isVideoOff ? (
            <div className="text-center">
              <VideoOff className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Camera is off</p>
            </div>
          ) : (
            <div className="text-center">
              <User className="h-16 w-16 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-400">{userName}</p>
            </div>
          )}
        </div>
      )}

      {/* User Info Overlay */}
      <div className="absolute top-3 left-3 flex items-center gap-2">
        <Badge
          variant="secondary"
          className="bg-black/50 text-white border-0 backdrop-blur-sm"
        >
          {userName}
        </Badge>
        {level && (
          <Badge
            variant="outline"
            className="bg-orange-500/90 text-white border-orange-400 backdrop-blur-sm"
          >
            {level}
          </Badge>
        )}
      </div>

      {/* Audio Indicator */}
      {isConnected && (
        <div className="absolute top-3 right-3">
          {isMuted ? (
            <div className="bg-red-500/90 p-2 rounded-full backdrop-blur-sm">
              <MicOff className="h-4 w-4 text-white" />
            </div>
          ) : (
            <div className="bg-green-500/90 p-2 rounded-full backdrop-blur-sm">
              <Mic className="h-4 w-4 text-white" />
            </div>
          )}
        </div>
      )}

      {/* Local Video Mirror Effect */}
      {isLocal && isConnected && !isVideoOff && (
        <div className="absolute bottom-3 right-3">
          <Badge
            variant="secondary"
            className="bg-black/50 text-white border-0 backdrop-blur-sm text-xs"
          >
            You
          </Badge>
        </div>
      )}

      {/* Connection Status - Light overlay, only for remote video */}
      {!isConnected && !isLoading && !isLocal && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="text-center bg-black/60 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/10">
            <div className="w-3 h-3 bg-blue-400 rounded-full mx-auto mb-2 animate-pulse" />
            <p className="text-white text-sm font-medium">
              Waiting for connection...
            </p>
          </div>
        </div>
      )}

      {/* Local video status badge - only show badge, don't cover video */}
      {!isConnected && !isLoading && isLocal && (
        <div className="absolute bottom-3 left-3">
          <Badge
            variant="secondary"
            className="bg-blue-500/80 text-white border-0 backdrop-blur-sm"
          >
            <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
            Camera ready
          </Badge>
        </div>
      )}
    </Card>
  );
}
