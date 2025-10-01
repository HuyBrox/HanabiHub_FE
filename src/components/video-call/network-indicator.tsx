"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/language-context";
import { Wifi, WifiOff } from "lucide-react";

interface NetworkIndicatorProps {
  className?: string;
}

export function NetworkIndicator({ className = "" }: NetworkIndicatorProps) {
  const { t } = useLanguage();
  const [signalStrength, setSignalStrength] = useState(5); // 0-5 bars
  const [isConnected, setIsConnected] = useState(true);

  // Mock network monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      // TODO: Backend integration - Replace with actual network monitoring
      // Example: const strength = await getNetworkStrength()

      // Mock fluctuating signal strength
      const mockStrength = Math.floor(Math.random() * 6); // 0-5
      setSignalStrength(mockStrength);
      setIsConnected(mockStrength > 0);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getSignalColor = () => {
    if (!isConnected) return "text-red-500";
    if (signalStrength >= 4) return "text-green-500";
    if (signalStrength >= 2) return "text-yellow-500";
    return "text-red-500";
  };

  const getSignalText = () => {
    if (!isConnected) return t("network.noConnection");
    if (signalStrength >= 4) return t("network.excellent");
    if (signalStrength >= 3) return t("network.good");
    if (signalStrength >= 2) return t("network.fair");
    return t("network.poor");
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
        {t("network.sr")
          .replace("{status}", getSignalText())
          .replace("{bars}", String(signalStrength))}
      </span>
    </div>
  );
}
