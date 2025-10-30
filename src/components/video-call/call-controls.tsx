"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  PhoneOff,
  SkipForward,
} from "lucide-react";

interface CallControlsProps {
  isMuted?: boolean;
  isVideoOff?: boolean;
  onToggleMute?: () => void;
  onToggleVideo?: () => void;
  onNextPartner?: () => void;
  onEndCall?: () => void;
  onStartCall?: () => void;
  disabled?: boolean;
  isConnected?: boolean;
}

export function CallControls({
  isMuted = false,
  isVideoOff = false,
  onToggleMute,
  onToggleVideo,
  onNextPartner,
  onEndCall,
  onStartCall,
  disabled = false,
  isConnected = false,
}: CallControlsProps) {
  return (
    <Card className="p-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
      <div className="flex justify-center items-center gap-3 sm:gap-4">
        {/* Microphone Toggle */}
        <Button
          variant={isMuted ? "destructive" : "secondary"}
          size="lg"
          className="h-12 w-12 sm:h-14 sm:w-14 rounded-full"
          onClick={onToggleMute}
          disabled={disabled}
          aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
        >
          {isMuted ? (
            <MicOff className="h-5 w-5 sm:h-6 sm:w-6" />
          ) : (
            <Mic className="h-5 w-5 sm:h-6 sm:w-6" />
          )}
        </Button>

        {/* Camera Toggle */}
        <Button
          variant={isVideoOff ? "destructive" : "secondary"}
          size="lg"
          className="h-12 w-12 sm:h-14 sm:w-14 rounded-full"
          onClick={onToggleVideo}
          disabled={disabled}
          aria-label={isVideoOff ? "Turn on camera" : "Turn off camera"}
        >
          {isVideoOff ? (
            <VideoOff className="h-5 w-5 sm:h-6 sm:w-6" />
          ) : (
            <Video className="h-5 w-5 sm:h-6 sm:w-6" />
          )}
        </Button>

        {/* Next Partner (Mobile) */}
        <Button
          variant="secondary"
          size="lg"
          className="h-12 w-12 sm:h-14 sm:w-14 rounded-full sm:hidden"
          onClick={onNextPartner}
          disabled={disabled || !isConnected}
          aria-label="Next partner"
        >
          <SkipForward className="h-5 w-5" />
        </Button>

        {/* End/Start Call */}
        {isConnected ? (
          <Button
            variant="destructive"
            size="lg"
            className="h-12 w-16 sm:h-14 sm:w-20 rounded-full bg-red-500 hover:bg-red-600"
            onClick={onEndCall}
            disabled={disabled}
            aria-label="End call"
          >
            <PhoneOff className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
        ) : (
          <Button
            variant="default"
            size="lg"
            className="h-12 w-16 sm:h-14 sm:w-20 rounded-full bg-green-500 hover:bg-green-600"
            onClick={onStartCall}
            disabled={disabled}
            aria-label="Start call"
          >
            <Phone className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
        )}

        {/* Next Partner (Desktop) */}
        <Button
          variant="secondary"
          size="lg"
          className="h-12 w-12 sm:h-14 sm:w-14 rounded-full hidden sm:flex"
          onClick={onNextPartner}
          disabled={disabled || !isConnected}
          aria-label="Next partner"
        >
          <SkipForward className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
      </div>

      {/* Control Labels (Desktop) */}
      <div className="hidden sm:flex justify-center items-center gap-4 mt-3">
        <span className="text-xs text-gray-600 dark:text-gray-400 w-14 text-center">
          {isMuted ? "Muted" : "Mic"}
        </span>
        <span className="text-xs text-gray-600 dark:text-gray-400 w-14 text-center">
          {isVideoOff ? "No Video" : "Camera"}
        </span>
        <span className="text-xs text-gray-600 dark:text-gray-400 w-20 text-center">
          {isConnected ? "End Call" : "Start"}
        </span>
        <span className="text-xs text-gray-600 dark:text-gray-400 w-14 text-center">
          Next
        </span>
      </div>
    </Card>
  );
}
