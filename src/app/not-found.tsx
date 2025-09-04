import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

export default function NotFound() {
  // Nếu muốn đổi màu theo theme, có thể lấy theme ở đây
  let theme = "light";
  try {
    // Nếu dùng theme context client, có thể lấy theme động
    // theme = useTheme().theme;
  } catch {}
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div
        className="rounded-full p-6 mb-6"
        style={{
          background:
            theme === "dark"
              ? "linear-gradient(135deg, #23272f 0%, #1a1d23 100%)"
              : "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
        }}
      >
        <span className="text-6xl font-bold text-primary">404</span>
      </div>
      <h1 className="text-3xl md:text-4xl font-bold mb-4">Page Not Found</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        Sorry, the page you are looking for does not exist or has been moved.
      </p>
      <Link href="/">
        <Button size="lg" className="bg-primary text-primary-foreground">
          Go Home
        </Button>
      </Link>
    </div>
  );
}
