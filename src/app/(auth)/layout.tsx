import type React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      {/* Background Image Layer */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url(/images/backgrounds/nhat_ban.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "blur(12px) saturate(1.3) brightness(0.6)",
        }}
      />

      {/* Glass Effect Overlay */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          backdropFilter: "blur(3px) saturate(1.6) contrast(1.05)",
          WebkitBackdropFilter: "blur(3px) saturate(1.6) contrast(1.05)",
          background: "rgba(255, 255, 255, 0.15)",
        }}
      />

      {/* Content Layer */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
