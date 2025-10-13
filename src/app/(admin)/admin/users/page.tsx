"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
    UserPlus, RefreshCw, Edit, Trash2, X, Save, Loader2, AlertTriangle, Users, 
    Lock, Unlock, Key, Clock, LogIn, UserX, UserCheck
} from 'lucide-react';

// ===============================================
// FAKE API UTILITIES (Giả lập chức năng API)
// ===============================================

type UserRole = 'Admin' | 'Moderator' | 'User' | 'Guest';
type UserStatus = 'Active' | 'Locked';

interface LoginRecord {
    timestamp: string;
    ip: string;
    device: string;
}

interface User {
    id: string; // ID duy nhất
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus; // Trạng thái tài khoản: Active / Locked
    createdAt: string;
    updatedAt: string;
    lastLogin: string | null; // Lần đăng nhập cuối
    loginHistory: LoginRecord[]; // Lịch sử đăng nhập
}

// Hàm tạo ID ngẫu nhiên cho môi trường giả lập
const generateFakeId = () => `usr-${Math.random().toString(36).substring(2, 9)}`;

// Hàm tạo lịch sử đăng nhập giả lập
const generateFakeHistory = (): LoginRecord[] => {
    const records = [] as LoginRecord[];
    const devices = ['Chrome/Windows', 'Safari/iOS', 'Firefox/Linux'];
    for (let i = 0; i < 3; i++) {
        const timestamp = new Date(Date.now() - Math.random() * 30 * 24 * 3600 * 1000).toISOString();
        records.push({
            timestamp,
            ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
            device: devices[Math.floor(Math.random() * devices.length)],
        });
    }
    return records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// Dữ liệu giả lập ban đầu đã được mở rộng
let fakeDb: User[] = [
    { 
        id: generateFakeId(), 
        name: 'Admin Tổng', 
        email: 'admin@cap.com', 
        role: 'Admin', 
        status: 'Active', 
        createdAt: new Date(Date.now() - 5184000000).toISOString(), 
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        lastLogin: new Date(Date.now() - 3600000).toISOString(),
        loginHistory: generateFakeHistory()
    },
    { 
        id: generateFakeId(), 
        name: 'Mod Hỗ Trợ', 
        email: 'mod@cap.com', 
        role: 'Moderator', 
        status: 'Active', 
        createdAt: new Date(Date.now() - 2592000000).toISOString(), 
        updatedAt: new Date(Date.now() - 172800000).toISOString(),
        lastLogin: new Date(Date.now() - 7200000).toISOString(),
        loginHistory: generateFakeHistory()
    },
    { 
        id: generateFakeId(), 
        name: 'Khách Bị Khóa', 
        email: 'locked@cap.com', 
        role: 'User', 
        status: 'Locked', // Tài khoản bị khóa
        createdAt: new Date(Date.now() - 1296000000).toISOString(), 
        updatedAt: new Date().toISOString(),
        lastLogin: null,
        loginHistory: generateFakeHistory()
    },
    { 
        id: generateFakeId(), 
        name: 'User Thường', 
        email: 'user@cap.com', 
        role: 'User', 
        status: 'Active', 
        createdAt: new Date().toISOString(), 
        updatedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        loginHistory: []
    },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fakeFetchUsers = async (): Promise<User[]> => {
    await delay(700);
    return fakeDb.sort((a, b) => a.name.localeCompare(b.name));
};

const fakeSaveUser = async (user: Partial<User> & { id?: string }): Promise<User> => {
    await delay(800);
    const now = new Date().toISOString();

    if (user.id) {
        // Cập nhật
        const index = fakeDb.findIndex(u => u.id === user.id);
        if (index === -1) throw new Error("Không tìm thấy người dùng để cập nhật.");
        
        // Kiểm tra email trùng lặp khi chỉnh sửa
        if (user.email && fakeDb.some((u, i) => i !== index && u.email === user.email)) {
             throw new Error("Email đã tồn tại với người dùng khác.");
        }
        
        // Cập nhật các trường (chỉ cập nhật những trường được gửi lên)
        fakeDb[index] = { 
            ...fakeDb[index], 
            ...user, 
            updatedAt: now 
        } as User;
        return fakeDb[index];
    } else {
        // Tạo mới
        if (!user.email || !user.name) throw new Error("Tên và Email là bắt buộc.");
        if (fakeDb.some(u => u.email === user.email)) {
            throw new Error("Email đã tồn tại. Không thể tạo người dùng mới.");
        }

        const newUser: User = {
            id: generateFakeId(), 
            name: user.name!,
            email: user.email!,
            role: user.role || 'User',
            status: 'Active',
            createdAt: now,
            updatedAt: now,
            lastLogin: null,
            loginHistory: [],
        };
        fakeDb.push(newUser);
        return newUser;
    }
};

const fakeDeleteUser = async (id: string): Promise<void> => {
    await delay(500);
    const initialLength = fakeDb.length;
    fakeDb = fakeDb.filter(u => u.id !== id);
    if (fakeDb.length === initialLength) {
        throw new Error("Không tìm thấy người dùng để xóa.");
    }
};

// ===============================================
// 2. TYPES VÀ STATE QUẢN LÝ
// ===============================================

interface FormState {
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
}

interface ModalState {
    isOpen: boolean;
    type: 'create' | 'edit' | 'history' | 'reset-password';
    currentUser: User | null;
}

interface UiModalState {
    isVisible: boolean;
    message: string;
    type: 'alert' | 'confirm';
    onAction?: () => void;
    title: string;
}

// ===============================================
// 3. COMPONENTS PHỤ (Modal, Loading Indicator)
// ===============================================

// Modal dùng cho Xác nhận, Thông báo lỗi
const ConfirmationModal = ({ modalState, onClose, onConfirm }: {
    modalState: UiModalState;
    onClose: () => void;
    onConfirm: () => void;
}) => {
    if (!modalState.isVisible) return null;

    const Icon = modalState.type === 'confirm' ? AlertTriangle : AlertTriangle;
    
    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 transform transition-transform duration-300 scale-100" onClick={e => e.stopPropagation()}>
                <div className="flex items-center mb-4">
                    <Icon className={`w-6 h-6 mr-3 ${modalState.type === 'confirm' ? 'text-yellow-500' : 'text-red-500'}`} />
                    <h2 className="text-xl font-semibold text-gray-900">{modalState.title}</h2>
                </div>
                
                <p className="text-gray-700 mb-6 whitespace-pre-wrap">{modalState.message}</p>
                
                <div className="flex justify-end space-x-3">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-150"
                    >
                        {modalState.type === 'alert' ? 'Đóng' : 'Hủy'}
                    </button>
                    {modalState.type === 'confirm' && (
                        <button 
                            onClick={onConfirm} 
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition duration-150"
                        >
                            Xác nhận
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// ===============================================
// 4. COMPONENT CHÍNH
// ===============================================

export default function AdminUsersPage() {
    
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState<string | null>(null); 
    const [uiModalState, setUiModalState] = useState<UiModalState>({ isVisible: false, message: '', type: 'alert', title: '' });
    
    // State Form
    const [modalState, setModalState] = useState<ModalState>({ isOpen: false, type: 'create', currentUser: null });
    const [form, setForm] = useState<FormState>({ name: '', email: '', role: 'User', status: 'Active' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- Modal Handler ---
    const closeUiModal = useCallback(() => setUiModalState({ isVisible: false, message: '', type: 'alert', title: '' }), []);

    const showConfirmModal = useCallback((title: string, message: string, onConfirm: () => void) => {
        setUiModalState({ isVisible: true, message, type: 'confirm', onAction: onConfirm, title });
    }, []);

    const showAlertModal = useCallback((message: string) => {
        setUiModalState({ isVisible: true, message, type: 'alert', title: 'Thông báo' });
    }, []);

    // --- Load Data Logic ---
    const loadUsers = useCallback(async () => {
        setLoading(true);
        setPageError(null);
        try {
            const data = await fakeFetchUsers();
            setUsers(data);
        } catch (e: any) {
            console.error("Lỗi tải dữ liệu Fake:", e);
            setPageError(`Lỗi khi tải dữ liệu: ${e.message}`);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    // --- User Form Handler ---
    const openCreateModal = () => {
        setForm({ name: '', email: '', role: 'User', status: 'Active' });
        setModalState({ isOpen: true, type: 'create', currentUser: null });
    };

    const openEditModal = (user: User) => {
        setForm({ name: user.name, email: user.email, role: user.role, status: user.status });
        setModalState({ isOpen: true, type: 'edit', currentUser: user });
    };
    
    // Mở modal Lịch sử
    const openHistoryModal = (user: User) => {
        setModalState({ isOpen: true, type: 'history', currentUser: user });
    };

    // Mở modal Đặt lại mật khẩu (chức năng giả lập)
    const openResetPasswordModal = (user: User) => {
        setModalState({ isOpen: true, type: 'reset-password', currentUser: user });
    };

    const closeModal = () => {
        setModalState({ isOpen: false, type: 'create', currentUser: null });
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    // --- Logic Xử lý Form (Thêm/Sửa) ---
    const validateForm = useMemo(() => {
        if (!form.name.trim()) return "Tên không được để trống.";
        if (!form.email.trim()) return "Email không được để trống.";
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re.test(form.email)) return "Email không hợp lệ.";
        return null;
    }, [form]);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const err = validateForm;
        if (err) {
            showAlertModal(err);
            return;
        }

        setIsSubmitting(true);
        setPageError(null);

        try {
            const userDataToSave: Partial<User> & { id?: string } = {
                name: form.name,
                email: form.email,
                role: form.role,
                status: form.status,
                id: modalState.type === 'edit' && modalState.currentUser ? modalState.currentUser.id : undefined,
            };

            await fakeSaveUser(userDataToSave);
            await loadUsers(); 
            closeModal();
        } catch (e: any) {
            console.error("Lỗi khi tạo/cập nhật người dùng:", e);
            showAlertModal(`Lỗi lưu dữ liệu: ${e.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Logic Khóa/Mở khóa ---
    const handleToggleStatus = useCallback((user: User) => {
        const newStatus: UserStatus = user.status === 'Active' ? 'Locked' : 'Active';
        const action = newStatus === 'Locked' ? 'khóa' : 'mở khóa';
        
        const confirmAction = async () => {
            closeUiModal();
            setIsSubmitting(true);
            try {
                await fakeSaveUser({ id: user.id, status: newStatus });
                await loadUsers();
                showAlertModal(`Đã ${action} tài khoản của ${user.name} thành công.`);
            } catch (e: any) {
                showAlertModal(`Lỗi ${action} tài khoản: ${e.message}`);
            } finally {
                setIsSubmitting(false);
            }
        };

        showConfirmModal(`Xác nhận ${action} tài khoản`, `Bạn có chắc chắn muốn ${action} tài khoản ${user.name} (${user.email})?`, confirmAction);
    }, [loadUsers, showAlertModal, showConfirmModal, closeUiModal]);

    // --- Logic Reset Mật khẩu (Giả lập) ---
    const handleResetPassword = useCallback((user: User) => {
        const confirmAction = async () => {
            closeUiModal();
            setIsSubmitting(true);
            try {
                // Giả lập việc gửi email đặt lại mật khẩu hoặc tạo mật khẩu mới
                await delay(1000); 
                await loadUsers();
                showAlertModal(`Đã gửi yêu cầu đặt lại mật khẩu đến email ${user.email}.`);
                closeModal(); // Đóng modal reset
            } catch (e: any) {
                showAlertModal(`Lỗi đặt lại mật khẩu: ${e.message}`);
            } finally {
                setIsSubmitting(false);
            }
        };

        showConfirmModal(`Xác nhận Đặt lại Mật khẩu`, `Bạn có chắc chắn muốn đặt lại mật khẩu cho người dùng ${user.name} (${user.email})?`, confirmAction);
    }, [loadUsers, showAlertModal, showConfirmModal, closeUiModal]);

    // --- Logic Xóa ---
    const handleDelete = useCallback((id: string, name: string) => {
        const confirmAction = async () => {
            closeUiModal();
            setIsSubmitting(true);
            setPageError(null);

            try {
                await fakeDeleteUser(id);
                await loadUsers(); 
            } catch (e: any) {
                console.error("Lỗi khi xóa người dùng:", e);
                showAlertModal(`Lỗi khi xóa dữ liệu: ${e.message}`);
            } finally {
                setIsSubmitting(false);
            }
        };

        showConfirmModal(`Xác nhận Xóa`, `Bạn có chắc chắn muốn xóa người dùng "${name}" (ID: ${id})? Hành động này không thể hoàn tác.`, confirmAction);
    }, [loadUsers, showAlertModal, showConfirmModal, closeUiModal]);

    // ===============================================
    // 5. RENDER UI
    // ===============================================
    
    // Icons
    const Loader = Loader2;
    const AddIcon = UserPlus;
    const RefreshIcon = RefreshCw;
    const EditIcon = Edit;
    const DeleteIcon = Trash2;
    const CloseIcon = X;
    const SaveIcon = Save;
    const UsersIcon = Users;
    const AlertIcon = AlertTriangle;
    const LockIcon = Lock;
    const UnlockIcon = Unlock;
    const ResetKeyIcon = Key;
    const HistoryIcon = Clock;
    const UserLockedIcon = UserX;
    const UserActiveIcon = UserCheck;
    const LoginIcon = LogIn;

    // Helper: Định dạng ngày
    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('vi-VN');
    };

    // UI Loading ban đầu
    if (loading && users.length === 0) {
        return (
            <div className="flex justify-center items-center h-full min-h-screen bg-gray-50">
                <Loader className="w-8 h-8 mr-3 text-indigo-500 animate-spin" />
                <p className="text-lg text-gray-600">Đang tải dữ liệu người dùng...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
            {/* Tailwind CSS base configuration and Inter Font */}
            <script src="https://cdn.tailwindcss.com"></script>
            <style dangerouslySetInnerHTML={{__html: `
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
                body {
                    font-family: 'Inter', sans-serif;
                }
                .disabled-overlay * {
                    pointer-events: none;
                }
            `}} />
            
            <div className="max-w-7xl mx-auto">
                {/* Header và Thanh Hành động */}
                <div className="flex justify-between items-center mb-8 flex-wrap gap-4 p-4 bg-white rounded-xl shadow-md">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <UsersIcon className="w-8 h-8 mr-3 text-indigo-600"/>
                        Quản lý Người dùng ({users.length} tài khoản)
                    </h1>
                    
                    <div className="flex space-x-3">
                        <button
                            onClick={openCreateModal}
                            disabled={isSubmitting}
                            className="flex items-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-150 ease-in-out transform hover:scale-[1.02] disabled:opacity-50"
                        >
                            <AddIcon className="w-5 h-5 mr-2" />
                            Thêm người dùng
                        </button>
                        <button
                            onClick={loadUsers}
                            disabled={loading || isSubmitting}
                            className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-300 transition duration-150 ease-in-out disabled:opacity-50"
                            title="Tải lại dữ liệu"
                        >
                            <RefreshIcon className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Tải lại
                        </button>
                    </div>
                </div>

                {/* Thông báo Lỗi Cấp độ Trang / Trạng thái */}
                {pageError && (
                    <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-xl border border-red-200 flex items-center shadow-sm" role="alert">
                        <AlertIcon className="w-5 h-5 mr-3 flex-shrink-0" />
                        <span className="font-semibold">Lỗi hệ thống:</span> {pageError}
                    </div>
                )}
                
                {isSubmitting && (
                     <div className="flex items-center justify-center p-3 bg-yellow-100 text-yellow-700 rounded-xl mb-4 border border-yellow-200 shadow-sm transition-all duration-300">
                        <Loader className="w-5 h-5 mr-3 animate-spin" />
                        Đang xử lý thao tác... (Giả lập độ trễ API)
                    </div>
                )}

                {/* Bảng Dữ liệu */}
                <div className="bg-white shadow-xl rounded-xl overflow-hidden relative">
                    {/* Overlay khi đang loading */}
                    {(loading || isSubmitting) && (
                        <div className="absolute inset-0 bg-white bg-opacity-70 z-10 flex items-center justify-center">
                            <Loader className="w-10 h-10 text-indigo-600 animate-spin" />
                        </div>
                    )}

                    <div className="p-4 sm:p-6">
                        {users.length === 0 && !loading ? (
                            <p className="text-center py-12 text-gray-500 text-lg">Chưa có người dùng nào được tạo.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tên & Email</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Vai trò</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Lần đăng nhập cuối</th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/5">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {users.map((user) => (
                                            <tr key={user.id} className="hover:bg-indigo-50 transition duration-100">
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                    <div className="text-xs text-gray-500">{user.email}</div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${user.role === 'Admin' ? 'bg-red-100 text-red-800' : user.role === 'Moderator' ? 'bg-yellow-100 text-yellow-800' : user.role === 'User' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full items-center ${user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {user.status === 'Active' ? <UserActiveIcon className="w-4 h-4 mr-1"/> : <UserLockedIcon className="w-4 h-4 mr-1"/>}
                                                        {user.status === 'Active' ? 'Hoạt động' : 'Đã khóa'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                                    {formatDate(user.lastLogin)}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium space-x-1 flex justify-end">
                                                    {/* Nút Khóa / Mở khóa */}
                                                    <button
                                                        onClick={() => handleToggleStatus(user)}
                                                        className={`transition duration-150 ease-in-out p-1 rounded-full focus:outline-none focus:ring-2 ${user.status === 'Active' ? 'text-orange-600 hover:text-orange-900 hover:bg-orange-100 focus:ring-orange-500' : 'text-green-600 hover:text-green-900 hover:bg-green-100 focus:ring-green-500'}`}
                                                        title={user.status === 'Active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                                                        disabled={isSubmitting}
                                                    >
                                                        {user.status === 'Active' ? <LockIcon className="w-5 h-5" /> : <UnlockIcon className="w-5 h-5" />}
                                                    </button>
                                                    {/* Nút Đặt lại mật khẩu */}
                                                    <button
                                                        onClick={() => openResetPasswordModal(user)}
                                                        className="text-purple-600 hover:text-purple-900 transition duration-150 ease-in-out p-1 rounded-full hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                        title="Đặt lại mật khẩu (Giả lập)"
                                                        disabled={isSubmitting}
                                                    >
                                                        <ResetKeyIcon className="w-5 h-5" />
                                                    </button>
                                                    {/* Nút Lịch sử đăng nhập */}
                                                    <button
                                                        onClick={() => openHistoryModal(user)}
                                                        className="text-blue-600 hover:text-blue-900 transition duration-150 ease-in-out p-1 rounded-full hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        title="Lịch sử đăng nhập"
                                                        disabled={isSubmitting}
                                                    >
                                                        <HistoryIcon className="w-5 h-5" />
                                                    </button>
                                                    {/* Nút Chỉnh sửa */}
                                                    <button
                                                        onClick={() => openEditModal(user)}
                                                        className="text-indigo-600 hover:text-indigo-900 transition duration-150 ease-in-out p-1 rounded-full hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                        title="Chỉnh sửa thông tin/phân quyền"
                                                        disabled={isSubmitting}
                                                    >
                                                        <EditIcon className="w-5 h-5" />
                                                    </button>
                                                    {/* Nút Xóa */}
                                                    <button
                                                        onClick={() => handleDelete(user.id, user.name)}
                                                        className="text-red-600 hover:text-red-900 transition duration-150 ease-in-out p-1 rounded-full hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                                                        title="Xóa người dùng"
                                                        disabled={isSubmitting}
                                                    >
                                                        <DeleteIcon className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Form Modal (Thêm/Sửa) */}
            {(modalState.isOpen && (modalState.type === 'create' || modalState.type === 'edit')) && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-40 p-4 transition-opacity duration-300">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 transform transition-transform duration-300 scale-100" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4 border-b pb-3">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {modalState.type === 'create' ? 'Tạo Người dùng Mới' : 'Chỉnh sửa Người dùng'}
                            </h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition p-1 rounded-full hover:bg-gray-100" disabled={isSubmitting}>
                                <CloseIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className={isSubmitting ? 'disabled-overlay' : ''}>
                            <div className="mb-4">
                                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">Tên</label>
                                <input
                                    type="text" // Đã là text
                                    id="name"
                                    name="name"
                                    value={form.name}
                                    onChange={handleFormChange}
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150"
                                    placeholder="Ví dụ: Nguyễn Văn A"
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                                <input
                                    // CHỈNH SỬA TẠI ĐÂY: Sử dụng type="text" khi tạo mới để đảm bảo chữ cái hiển thị rõ
                                    // Tuy nhiên, dùng type="email" là chuẩn HTML. Nếu bạn muốn hiển thị rõ mà vẫn có kiểm tra email cơ bản, type="email" là tốt nhất.
                                    // Tôi giữ nguyên type="email" vì nó là tiêu chuẩn và vẫn hiển thị chữ cái. 
                                    // Nếu vấn đề là do trình duyệt, việc chuyển sang type="text" có thể khắc phục, nhưng tôi ưu tiên giữ type="email".
                                    type="email" 
                                    id="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleFormChange}
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150"
                                    placeholder="Ví dụ: user@example.com"
                                    disabled={modalState.type === 'edit' || isSubmitting} // Email bị khóa khi chỉnh sửa/đang submit
                                />
                                {modalState.type === 'edit' && <p className="mt-1 text-xs text-gray-500">Email (ID) không thể chỉnh sửa.</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="mb-4">
                                    <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-1">Vai trò (Phân quyền)</label>
                                    <select
                                        id="role"
                                        name="role"
                                        value={form.role}
                                        onChange={handleFormChange}
                                        required
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg shadow-sm transition duration-150"
                                        disabled={isSubmitting}
                                    >
                                        <option value="Admin">Admin</option>
                                        <option value="Moderator">Moderator</option>
                                        <option value="User">User</option>
                                        <option value="Guest">Guest</option>
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-1">Trạng thái</label>
                                    <select
                                        id="status"
                                        name="status"
                                        value={form.status}
                                        onChange={handleFormChange}
                                        required
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg shadow-sm transition duration-150"
                                        disabled={isSubmitting || modalState.type === 'create'} 
                                    >
                                        <option value="Active">Hoạt động (Active)</option>
                                        {modalState.type === 'edit' && <option value="Locked">Đã khóa (Locked)</option>}
                                    </select>
                                    {modalState.type === 'edit' && <p className="mt-1 text-xs text-gray-500">Nên dùng nút Khóa/Mở khóa ngoài bảng.</p>}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-150"
                                    disabled={isSubmitting}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition duration-150 disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <Loader className="w-5 h-5 mr-2 animate-spin" />
                                    ) : (
                                        <SaveIcon className="w-5 h-5 mr-2" />
                                    )}
                                    {modalState.type === 'create' ? 'Tạo Người dùng' : 'Lưu Thay đổi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* Modal Lịch sử Đăng nhập */}
            {(modalState.isOpen && modalState.type === 'history') && modalState.currentUser && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-40 p-4 transition-opacity duration-300">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 transform transition-transform duration-300 scale-100" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4 border-b pb-3">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                <LoginIcon className="w-6 h-6 mr-2 text-blue-600"/>
                                Lịch sử Đăng nhập ({modalState.currentUser.name})
                            </h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition p-1 rounded-full hover:bg-gray-100">
                                <CloseIcon className="w-6 h-6" />
                            </button>
                        </div>

                        {modalState.currentUser.loginHistory.length === 0 ? (
                            <p className="text-gray-500 py-4 text-center">Chưa có bản ghi lịch sử đăng nhập nào.</p>
                        ) : (
                            <div className="max-h-80 overflow-y-auto pr-2">
                                {modalState.currentUser.loginHistory.map((log, index) => (
                                    <div key={index} className="flex justify-between items-start border-b py-3 last:border-b-0">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 break-words">{log.device}</p>
                                            <p className="text-xs text-gray-500">IP: {log.ip}</p>
                                        </div>
                                        <p className="text-xs text-gray-600 ml-4 text-right flex-shrink-0">
                                            {formatDate(log.timestamp)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                        <p className="mt-4 text-sm text-gray-500">Lưu ý: Đây là dữ liệu giả lập (Fake log history).</p>
                    </div>
                </div>
            )}
            
            {/* Modal Đặt lại Mật khẩu (Chức năng giả lập) */}
            {(modalState.isOpen && modalState.type === 'reset-password') && modalState.currentUser && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-40 p-4 transition-opacity duration-300">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 transform transition-transform duration-300 scale-100" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4 border-b pb-3">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                <ResetKeyIcon className="w-6 h-6 mr-2 text-purple-600"/>
                                Đặt lại Mật khẩu
                            </h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition p-1 rounded-full hover:bg-gray-100" disabled={isSubmitting}>
                                <CloseIcon className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <p className="text-gray-700 mb-6">
                            Bạn đang thực hiện đặt lại mật khẩu cho tài khoản **{modalState.currentUser.name}** ({modalState.currentUser.email}).
                            Hệ thống sẽ giả lập việc gửi một email đặt lại mật khẩu.
                        </p>
                        
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-150"
                                disabled={isSubmitting}
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={() => handleResetPassword(modalState.currentUser as User)}
                                disabled={isSubmitting}
                                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition duration-150 disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                                ) : (
                                    <Key className="w-5 h-5 mr-2" />
                                )}
                                Gửi Yêu cầu Đặt lại
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* Custom Alert/Confirm Modals */}
            <ConfirmationModal 
                modalState={uiModalState} 
                onClose={closeUiModal} 
                onConfirm={uiModalState.onAction || (() => {})} 
            />

        </div>
    );
}

