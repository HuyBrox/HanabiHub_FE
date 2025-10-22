"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shimmer } from "@/components/ui/shimmer";
import { User, Mic, MicOff, VideoOff } from "lucide-react";
import { RefObject } from "react";

interface VideoFrameProps {
  type: "local" | "remote";
  isLoading?: boolean;
  isConnected?: boolean;
  isVideoOff?: boolean;
  isMuted?: boolean;
  userName?: string;
  level?: string;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
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
}: VideoFrameProps) {
  const isLocal = type === "local";

  return (
    <Card className="relative aspect-video bg-gray-900 overflow-hidden group">
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
            className="w-full h-full object-cover"
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

      {/* Connection Status */}
      {!isConnected && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="w-3 h-3 bg-gray-400 rounded-full mx-auto mb-2 animate-pulse" />
            <p className="text-gray-400 text-sm">
              {isLocal ? "Camera ready" : "Waiting for connection..."}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
