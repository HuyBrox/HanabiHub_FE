"use client";

export function LoadingPage() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background text-foreground z-50">
      {/* Vòng tròn loading */}
      <div className="relative flex items-center justify-center w-32 h-32 mb-6">
        {/* Vòng tròn ngoài */}
        <div className="absolute w-full h-full rounded-full border-4 border-muted animate-spin" />

        {/* Vòng tròn trong - xoay chậm hơn */}
        <div
          className="absolute w-24 h-24 rounded-full border-4 border-primary"
          style={{
            animation: "spin 4s linear infinite",
          }}
        />

        {/* Logo ở giữa */}
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold shadow-lg">
          H
        </div>
      </div>

      {/* Tên web */}
      <h1 className="text-2xl font-bold text-foreground">HanabiHub</h1>
    </div>
  );
}
