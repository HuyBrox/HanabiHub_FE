"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useNotification } from "@/components/notification";
import { LoadingPage } from "@/components/loading/LoadingPage";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { AuthForm } from "./AuthForm";
import { AuthModalProps } from "@/types/auth";
import styles from "./AuthModal.module.css";

// VisuallyHidden component inline để tránh import issue
const VisuallyHidden = ({ children }: { children: React.ReactNode }) => (
  <span
    style={{
      position: "absolute",
      border: 0,
      width: "1px",
      height: "1px",
      padding: 0,
      margin: "-1px",
      overflow: "hidden",
      clip: "rect(0, 0, 0, 0)",
      whiteSpace: "nowrap",
      wordWrap: "normal",
    }}
  >
    {children}
  </span>
);

export function AuthModal({
  isOpen,
  onClose,
  defaultMode = "login",
}: AuthModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mode, setMode] = useState<"login" | "register">(defaultMode);

  const { success } = useNotification();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    setMode(pathname.includes("register") ? "register" : "login");
  }, [pathname]);

  const handleClose = () => {
    // Tell parent not to call router.back() since this component will handle it
    try {
      // @ts-ignore
      onClose(true);
    } catch (e) {
      onClose();
    }
    setTimeout(() => router.back(), 150);
  };

  // Listen for auth success dispatched from AuthForm when it is used inside modal
  useEffect(() => {
    const handler = async () => {
      // show success notification
      try {
        success("Đăng nhập thành công", { title: "Thành công" });
      } catch (e) {
        // ignore
      }

      // Show loading page while redirecting to home
      setRedirecting(true);

      // Close modal but signal parent not to call router.back (parent supports skipBack)
      try {
        // @ts-ignore
        onClose(true);
      } catch (e) {
        try {
          onClose();
        } catch (e) {
          // noop
        }
      }

      // Redirect to home and keep loading overlay until navigation finishes
      try {
        await router.push("/");
      } catch (e) {
        // If app-router navigation fails (some Next internals error), fallback to full reload
        try {
          window.location.assign("/");
        } catch (e) {
          // final noop
        }
      } finally {
        setRedirecting(false);
      }
    };

    window.addEventListener("auth-success", handler as EventListener);
    return () =>
      window.removeEventListener("auth-success", handler as EventListener);
  }, [onClose, router, success]);

  return (
    <>
      {redirecting && <LoadingPage />}
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 bg-transparent shadow-2xl">
          <VisuallyHidden>
            <DialogTitle>
              {mode === "login" ? "Đăng nhập" : "Đăng ký"}
            </DialogTitle>
          </VisuallyHidden>
          <div className="bg-background rounded-lg">
            <AuthForm mode={mode} onModeChange={setMode} isModal />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
