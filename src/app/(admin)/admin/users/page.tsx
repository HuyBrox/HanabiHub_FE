"use client";

import React, { useMemo, useState } from "react";
import {
  Search,
  User,
  Users,
  Settings,
  Edit,
  Trash2,
  Plus,
  LogOut,
  Loader,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical,
  AlertTriangle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// --- TYPE DEFINITIONS ---
type UserRole = "Admin" | "Editor" | "User" | "Viewer";
type UserStatus = "Online" | "Offline";

type UserType = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLogin: string; // ISO date string (YYYY-MM-DD)
};

type MessageType = {
  type: "success" | "error";
  text: string;
};

// Giả lập dữ liệu người dùng
const initialUsers: UserType[] = [
  {
    id: "user-001",
    name: "Lê Văn C",
    email: "vanc@cap.com",
    role: "User",
    status: "Online",
    lastLogin: "2025-10-10",
  },
  {
    id: "user-002",
    name: "Nguyễn Văn A",
    email: "vana@cap.com",
    role: "Admin",
    status: "Online",
    lastLogin: "2025-10-10",
  },
  {
    id: "user-003",
    name: "Trần Thị B",
    email: "thib@cap.com",
    role: "Editor",
    status: "Offline",
    lastLogin: "2025-10-09",
  },
  {
    id: "user-004",
    name: "Phạm Hải Y",
    email: "haiy@cap.com",
    role: "Viewer",
    status: "Online",
    lastLogin: "2025-10-11",
  },
  {
    id: "user-005",
    name: "Vũ Bình K",
    email: "binhk@cap.com",
    role: "User",
    status: "Offline",
    lastLogin: "2025-10-08",
  },
  {
    id: "user-006",
    name: "Hoàng Minh Z",
    email: "minhz@cap.com",
    role: "User",
    status: "Online",
    lastLogin: "2025-10-12",
  },
];

// Hàm định dạng ngày
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

// --- COMPONENTS ---

// Metrics Card Component
const MetricCard = ({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
}) => (
  <div
    className={`p-5 rounded-xl shadow-lg transform hover:scale-[1.02] transition duration-300 ${color} text-white`}
  >
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium opacity-80 mb-1">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
      <Icon size={30} strokeWidth={2.5} className="opacity-70 mt-1" />
    </div>
    <p className="text-xs mt-3 opacity-90">+12% so với tháng trước</p>
  </div>
);

// User Avatar Component
const UserAvatar = ({
  name,
  role,
  size = "large",
}: {
  name: string;
  role: UserRole;
  size?: "large" | "small";
}) => {
  const initial = name.split(" ").pop()?.[0] ?? "";
  const colorMap = useMemo(
    () => ({
      Admin: "bg-red-500",
      Editor: "bg-yellow-500",
      User: "bg-blue-500",
      Viewer: "bg-green-500",
    }),
    []
  );
  const bgColor = colorMap[role] ?? "bg-gray-500";

  const dimensions = size === "large" ? "w-12 h-12 text-xl" : "w-8 h-8 text-sm";

  return (
    <div
      className={`${dimensions} ${bgColor} rounded-full flex items-center justify-center text-white font-semibold mr-3 shadow-md flex-shrink-0`}
    >
      {initial}
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }: { status: UserStatus }) => {
  const isOnline = status === "Online";
  const statusClass = isOnline
    ? "bg-green-100 text-green-700"
    : "bg-gray-100 text-gray-700";

  return (
    <span
      className={`px-2 py-0.5 text-xs font-semibold rounded-full flex items-center ${statusClass}`}
    >
      <span
        className={`w-2 h-2 rounded-full mr-1 ${isOnline ? "bg-green-500" : "bg-gray-500"} ${
          isOnline ? "animate-pulse" : ""
        }`}
      ></span>
      {isOnline ? "Online" : "Offline"}
    </span>
  );
};

// Role Badge Component
const RoleBadge = ({ role }: { role: UserRole }) => {
  const roleConfig: Record<string, string> = {
    Admin: "bg-red-600 text-white",
    Editor: "bg-yellow-500 text-gray-900",
    User: "bg-blue-600 text-white",
    Viewer: "bg-green-600 text-white",
  };
  const config = roleConfig[role] ?? "bg-gray-400 text-white";
  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${config}`}>
      {role}
    </span>
  );
};

// --- CONFIRMATION MODAL COMPONENT ---
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  user,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user: UserType | null;
}) => {
  if (!isOpen || !user) return null;

  return (
    <div
      className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md transition-all duration-300 transform scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center space-x-4 mb-4">
          <AlertTriangle size={32} className="text-red-500 flex-shrink-0" />
          <h3 className="text-xl font-bold text-gray-800">Xác Nhận Xóa Người Dùng</h3>
        </div>

        <p className="text-gray-700 mb-6">
          Bạn <span className="font-bold text-red-600">chắc chắn</span> muốn xóa người dùng
          <span className="font-bold text-red-600"> "{user.name}"</span> (Email: {user.email})
          không?
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Hành động này không thể hoàn tác. Người dùng sẽ mất quyền truy cập vào hệ thống.
        </p>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 bg-white text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition"
          >
            Xác Nhận Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

// User Card Component
const UserCard = ({
  user,
  onDelete,
  onEdit,
}: {
  user: UserType;
  onDelete: (user: UserType) => void;
  onEdit: (user: UserType) => void;
}) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition duration-300 transform hover:scale-[1.01]">
      {/* Header / Main Info */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <UserAvatar name={user.name} role={user.role} size="large" />
          <div>
            <p className="font-extrabold text-lg text-gray-900 leading-tight">{user.name}</p>
            <p className="text-sm text-blue-600 font-medium leading-tight">{user.email}</p>
          </div>
        </div>

        {/* Action Menu (Mock) */}
        <button
          title="Hành động khác"
          className="text-gray-400 hover:text-gray-700 p-1 rounded-full transition"
        >
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Role & Status */}
      <div className="flex justify-between items-center mb-4 border-t pt-4 border-gray-100">
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">Vai trò</p>
          <RoleBadge role={user.role} />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">Trạng thái</p>
          <StatusBadge status={user.status} />
        </div>
      </div>

      {/* Last Login */}
      <div className="flex items-center text-sm text-gray-600 mt-2">
        <Clock size={16} className="text-gray-400 mr-2" />
        <p>
          Đăng nhập cuối: <span className="font-semibold">{formatDate(user.lastLogin)}</span>
        </p>
      </div>

      {/* Actions Footer */}
      <div className="flex justify-end space-x-3 border-t pt-4 mt-4 border-gray-100">
        <button
          title="Chỉnh sửa"
          onClick={() => onEdit(user)}
          className="flex items-center text-indigo-600 hover:text-indigo-800 transition text-sm font-medium"
        >
          <Edit size={16} className="mr-1" /> Sửa
        </button>
        <button
          title="Xóa"
          onClick={() => onDelete(user)}
          className="flex items-center text-red-600 hover:text-red-800 transition text-sm font-medium"
        >
          <Trash2 size={16} className="mr-1" /> Xóa
        </button>
      </div>
    </div>
  );
};

// Main Component - Page
export default function UserManagementPage() {
  const [users, setUsers] = useState<UserType[]>(initialUsers);

  // Khai báo state cho modal xác nhận xóa
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const [message, setMessage] = useState<MessageType | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<UserRole | "Tất cả">("Tất cả");
  const [filterStatus, setFilterStatus] = useState<UserStatus | "Tất cả">(
    "Tất cả"
  );

  const [isModalOpen, setIsModalOpen] = useState(false); // State cho modal thêm người dùng

  const [newUser, setNewUser] = useState<Omit<UserType, "id" | "status" | "lastLogin">>({
    name: "",
    email: "",
    role: "User",
  });

  const [isSaving, setIsSaving] = useState(false);

  const [userToDelete, setUserToDelete] = useState<UserType | null>(null);

  const roleOptions: (UserRole | "Tất cả")[] = [
    "Tất cả",
    "Admin",
    "Editor",
    "User",
    "Viewer",
  ];
  const statusOptions: (UserStatus | "Tất cả")[] = [
    "Tất cả",
    "Online",
    "Offline",
  ];

  // --- DERIVED STATE (METRICS) ---
  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === "Admin").length;
  const onlineCount = users.filter((u) => u.status === "Online").length;
  const accessCount = "8.7K";

  // --- COMPUTED / FILTERED LIST ---
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = filterRole === "Tất cả" || user.role === filterRole;

      const matchesStatus =
        filterStatus === "Tất cả" || user.status === filterStatus;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, filterRole, filterStatus]);

  // --- ACTIONS ---

  const showMessage = (type: MessageType["type"], text: string) => {
    const newMsg: MessageType = { type, text };
    setMessage(newMsg);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) {
      showMessage("error", "Vui lòng điền đủ Tên và Email.");
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      const newId = `user-${String(totalUsers + 1).padStart(3, "0")}`;
      const userToAdd: UserType = {
        ...newUser,
        id: newId,
        status: Math.random() > 0.5 ? "Online" : "Offline",
        lastLogin: new Date().toISOString().split("T")[0],
      };

      setUsers((prev) => [...prev, userToAdd]);
      setIsModalOpen(false);
      setNewUser({ name: "", email: "", role: "User" });
      setIsSaving(false);
      showMessage("success", `Đã thêm người dùng: ${userToAdd.name}`);
    }, 1000);
  };

  const handleOpenDeleteConfirm = (user: UserType) => {
    setUserToDelete(user);
    setIsConfirmModalOpen(true);
  };

  const handleDeleteUserConfirmed = () => {
    if (!userToDelete) return;

    const idToDelete = userToDelete.id;
    const nameToDelete = userToDelete.name;

    setUsers((prev) => prev.filter((user) => user.id !== idToDelete));

    setIsConfirmModalOpen(false);
    setUserToDelete(null);

    showMessage("success", `Đã xóa người dùng: ${nameToDelete}`);
  };

  const handleEditUser = (user: UserType) => {
    showMessage(
      "error",
      `Tính năng Sửa Người Dùng cho ${user.name} chưa được triển khai.`
    );
  };

  // --- RENDERING COMPONENTS ---
  const MessageBar = () => {
    if (!message) return null;

    const isSuccess = message.type === "success";
    const bgColor = isSuccess ? "bg-green-600" : "bg-red-600";
    const Icon = isSuccess ? CheckCircle : XCircle;

    return (
      <div
        className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-xl flex items-center text-white transition-opacity duration-300 ${bgColor}`}
      >
        <Icon size={20} className="mr-2" />
        <p className="font-medium">{message.text}</p>
      </div>
    );
  };

  const AddUserModal = () => (
    <div
      className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-40"
      onClick={() => setIsModalOpen(false)}
    >
      <div
        className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm transition-all duration-300 transform scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Tạo Người dùng Mới</h3>
          <button
            onClick={() => setIsModalOpen(false)}
            className="text-gray-500 hover:text-gray-800 transition"
          >
            <XCircle size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              placeholder="Nhập tên người dùng"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="Nhập email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-blue-500 focus:border-blue-500"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
            >
              {roleOptions
                .filter((r) => r !== "Tất cả")
                .map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleAddUser}
          disabled={isSaving}
          className={`mt-6 w-full py-2.5 rounded-lg text-white font-semibold transition-colors flex items-center justify-center ${
            isSaving
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
          }`}
        >
          {isSaving ? (
            <>
              <Loader size={20} className="animate-spin mr-2" /> Đang Tạo...
            </>
          ) : (
            "Tạo Người dùng Mới"
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Custom Message Bar */}
      <MessageBar />

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center mb-4 sm:mb-0">
            <Users size={32} className="text-blue-600 mr-2" strokeWidth={2.5} />
            Quản Lý Người Dùng
          </h1>
          <div className="flex space-x-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 transform hover:scale-[1.02]"
            >
              <Plus size={18} className="mr-1" /> Thêm Người Dùng
            </button>
            <button className="flex items-center px-4 py-2 border border-gray-300 bg-white text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-100 transition duration-300">
              <Loader size={18} className="mr-1" /> Tải Lại
            </button>
          </div>
        </div>

        <p className="text-gray-600 mb-8">Tổng quan về tài khoản người dùng và công cụ quản trị.</p>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard title="Tổng Người Dùng" value={totalUsers} icon={Users} color="bg-purple-600" />
          <MetricCard title="Tài khoản Admin" value={adminCount} icon={Settings} color="bg-pink-600" />
          <MetricCard title="Người dùng Online" value={onlineCount} icon={User} color="bg-green-600" />
          <MetricCard title="Lượt truy cập" value={accessCount} icon={LogOut} color="bg-yellow-600" />
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-5 rounded-xl shadow-lg mb-8">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 items-end">
            {/* Search Input */}
            <div className="relative flex-grow w-full md:w-auto">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm Tên hoặc Email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            {/* Role Filter */}
            <div className="w-full md:w-48">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as UserRole | "Tất cả")}
                className="w-full p-2 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="Tất cả">Lọc theo Vai trò (Tất cả)</option>
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as UserStatus | "Tất cả")}
                className="w-full p-2 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="Tất cả">Lọc theo Trạng thái (Tất cả)</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* User List Card Grid */}
        <div className="bg-white p-6 rounded-xl shadow-2xl ring-1 ring-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Danh Sách Người dùng ({filteredUsers.length} kết quả)
          </h2>

          {/* Grid Layout for Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onDelete={handleOpenDeleteConfirm}
                onEdit={handleEditUser}
              />)
            )}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              <p className="text-lg font-medium">Không tìm thấy người dùng nào.</p>
              <p className="text-sm">Hãy thử thay đổi bộ lọc tìm kiếm hoặc thêm người dùng mới.</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && <AddUserModal />}

      {/* Modal xác nhận xóa */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleDeleteUserConfirmed}
        user={userToDelete}
      />
    </div>
  );
}

