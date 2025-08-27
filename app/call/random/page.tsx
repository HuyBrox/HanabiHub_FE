"use client";

import { useState, useEffect } from "react";
import { VideoFrame } from "@/components/video-call/video-frame";
import { CallControls } from "@/components/video-call/call-controls";
import { NetworkIndicator } from "@/components/video-call/network-indicator";
import { LevelSelector } from "@/components/video-call/level-selector";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, Clock } from "lucide-react";

export default function RandomCallPage() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState("N5");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  // Mock call duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isConnected) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isConnected]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleStartCall = () => {
    setIsConnecting(true);
    // TODO: Backend integration - Initialize WebRTC connection
    // Example: await initializeWebRTC(selectedLevel)

    // Mock connection delay
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
    }, 3000);
  };

  const handleEndCall = () => {
    setIsConnected(false);
    setIsConnecting(false);
    setCallDuration(0);
    // TODO: Backend integration - Close WebRTC connection
    // Example: await closeWebRTCConnection()
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    // TODO: Backend integration - Toggle microphone
    // Example: await toggleMicrophone(!isMuted)
  };

  const handleToggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    // TODO: Backend integration - Toggle camera
    // Example: await toggleCamera(!isVideoOff)
  };

  const handleSwitchCamera = () => {
    // TODO: Backend integration - Switch camera (front/back)
    // Example: await switchCamera()
    console.log("Switch camera");
  };

  return (
    <div className="h-full bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-6 h-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Random Japanese Call
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Practice Japanese with native speakers
            </p>
          </div>

          <div className="flex items-center gap-4">
            <NetworkIndicator />
            {isConnected && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Clock className="h-4 w-4" />
                {formatDuration(callDuration)}
              </div>
            )}
          </div>
        </div>

        {/* Level Selector */}
        {!isConnected && !isConnecting && (
          <div className="mb-6">
            <LevelSelector
              selectedLevel={selectedLevel}
              onLevelChange={setSelectedLevel}
            />
          </div>
        )}

        {/* Video Call Interface */}
        <div className="flex-1 flex flex-col">
          {/* Video Frames */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {/* Local Video */}
            <VideoFrame
              type="local"
              isLoading={isConnecting}
              isConnected={isConnected}
              isVideoOff={isVideoOff}
              isMuted={isMuted}
              userName="You"
              level={selectedLevel}
            />

            {/* Remote Video */}
            <VideoFrame
              type="remote"
              isLoading={isConnecting}
              isConnected={isConnected}
              userName={isConnected ? "Tanaka-san" : "Waiting..."}
              level="N3"
            />
          </div>

          {/* Connection Status */}
          {!isConnected && !isConnecting && (
            <Card className="p-6 text-center mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <Users className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Ready to Practice Japanese?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Connect with a native speaker at {selectedLevel} level
              </p>
              <Button
                onClick={handleStartCall}
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white px-8"
              >
                Start Random Call
              </Button>
            </Card>
          )}

          {isConnecting && (
            <Card className="p-6 text-center mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Connecting...
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Finding a Japanese speaker for you
              </p>
            </Card>
          )}

          {/* Call Controls */}
          {(isConnected || isConnecting) && (
            <CallControls
              isMuted={isMuted}
              isVideoOff={isVideoOff}
              onToggleMute={handleToggleMute}
              onToggleVideo={handleToggleVideo}
              onSwitchCamera={handleSwitchCamera}
              onEndCall={handleEndCall}
              disabled={isConnecting}
            />
          )}
        </div>
      </div>
    </div>
  );
}
