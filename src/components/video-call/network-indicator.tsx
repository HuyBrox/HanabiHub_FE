"use client";

import { useState, useEffect } from "react";
import { Wifi, WifiOff } from "lucide-react";

interface NetworkIndicatorProps {
  className?: string;
  peerConnection?: RTCPeerConnection | null;
}

export function NetworkIndicator({ className = "", peerConnection }: NetworkIndicatorProps) {
  const [signalStrength, setSignalStrength] = useState(5); // 0-5 bars
  const [isConnected, setIsConnected] = useState(true);
  const [rtt, setRtt] = useState<number | null>(null); // Round Trip Time in ms

  // Real network monitoring via WebRTC stats
  useEffect(() => {
    if (!peerConnection) {
      setIsConnected(false);
      setSignalStrength(0);
      return;
    }

    const measureNetworkQuality = async () => {
      try {
        const stats = await peerConnection.getStats();
        let currentRtt: number | null = null;

        stats.forEach((report) => {
          // Get RTT from candidate-pair stats
          if (report.type === "candidate-pair" && report.state === "succeeded") {
            currentRtt = report.currentRoundTripTime ? report.currentRoundTripTime * 1000 : null;
          }
        });

        if (currentRtt !== null) {
          setRtt(currentRtt);
          setIsConnected(true);

          // Convert RTT to signal strength (0-5 bars)
          if (currentRtt < 50) {
            setSignalStrength(5); // Excellent
          } else if (currentRtt < 150) {
            setSignalStrength(4); // Good
          } else if (currentRtt < 300) {
            setSignalStrength(3); // Fair
          } else if (currentRtt < 500) {
            setSignalStrength(2); // Poor
          } else {
            setSignalStrength(1); // Very Poor
          }
        } else {
          // No RTT data yet - use default good connection
          setSignalStrength(4);
          setIsConnected(true);
        }
      } catch (error) {
        console.error("Failed to get network stats:", error);
        setIsConnected(false);
        setSignalStrength(0);
      }
    };

    // Measure every 2 seconds
    measureNetworkQuality();
    const interval = setInterval(measureNetworkQuality, 2000);

    return () => clearInterval(interval);
  }, [peerConnection]);

  const getSignalColor = () => {
    if (!isConnected) return "text-red-500";
    if (signalStrength >= 4) return "text-green-500";
    if (signalStrength >= 2) return "text-yellow-500";
    return "text-red-500";
  };

  const getSignalText = () => {
    if (!isConnected) return "No Connection";
    if (rtt !== null) {
      return `${Math.round(rtt)}ms`;
    }
    // Fallback when no RTT data
    if (signalStrength >= 4) return "Excellent";
    if (signalStrength >= 3) return "Good";
    if (signalStrength >= 2) return "Fair";
    return "Poor";
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Network Icon */}
      <div className={`${getSignalColor()}`}>
        {isConnected ? (
          <Wifi className="h-4 w-4" />
        ) : (
          <WifiOff className="h-4 w-4" />
        )}
      </div>

      {/* Signal Bars */}
      <div className="flex items-end gap-0.5">
        {[1, 2, 3, 4, 5].map((bar) => (
          <div
            key={bar}
            className={`w-1 bg-current transition-colors duration-300 ${
              bar <= signalStrength
                ? getSignalColor()
                : "text-gray-300 dark:text-gray-600"
            }`}
            style={{ height: `${bar * 3 + 2}px` }}
            aria-hidden="true"
          />
        ))}
      </div>

      {/* Signal Text */}
      <span className={`text-xs font-medium ${getSignalColor()}`}>
        {getSignalText()}
      </span>

      {/* Screen Reader Text */}
      <span className="sr-only">
        Network connection: {getSignalText()}, {signalStrength} out of 5 bars
      </span>
    </div>
  );
}
