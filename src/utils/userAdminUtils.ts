export const USER_PAGE_SIZE = 12;

export const ROLE_OPTIONS = [
  { label: "Admin", value: "admin" },
  { label: "Moderator", value: "moderator" },
  { label: "User", value: "user" },
] as const;

export const STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Blocked", value: "blocked" },
] as const;

export function formatRole(role: string) {
  if (role === "admin") return "Admin";
  if (role === "moderator") return "Moderator";
  return "User";
}
export function formatStatus(status: string) {
  if (status === "active") return "Hoạt động";
  if (status === "inactive") return "Ngưng hoạt động";
  if (status === "blocked") return "Bị khóa";
  return status;
}
export function formatDate(date?: string) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("vi-VN");
}
