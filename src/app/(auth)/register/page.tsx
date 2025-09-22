import { AuthPage } from "@/components/auth";
import { GuestRoute } from "@/components/auth";

export default function RegisterPage() {
  return (
    <GuestRoute redirectTo="/">
      <AuthPage defaultMode="register" />
    </GuestRoute>
  );
}
