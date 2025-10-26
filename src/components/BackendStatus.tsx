"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { checkBackendHealth } from "@/config/api";

interface BackendStatusProps {
  className?: string;
}

export default function BackendStatus({ className = "" }: BackendStatusProps) {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const connected = await checkBackendHealth();
      setIsConnected(connected);
    } catch (error) {
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
    // Check every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isChecking) {
    return (
      <div className={`flex items-center gap-2 text-sm ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
        <span className="text-gray-600">Đang kiểm tra kết nối...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      {isConnected ? (
        <>
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-green-600 font-medium">Backend đã kết nối</span>
        </>
      ) : (
        <>
          <XCircle className="w-4 h-4 text-red-500" />
          <span className="text-red-600 font-medium">Backend không kết nối được</span>
          <button
            onClick={checkConnection}
            className="text-blue-600 hover:text-blue-800 underline text-xs"
          >
            Thử lại
          </button>
        </>
      )}
    </div>
  );
}

