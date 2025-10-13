"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  Search, Filter, Plus, Grid, List, Eye, EyeOff, Heart, MessageCircle, Edit, Trash2, Star, StarOff, 
  BarChart3, User, Tag, Calendar, Bell, Mail, Send, Settings, BookOpen, Video, HelpCircle, FileText,
  Users, AlertTriangle, Newspaper, History, SendHorizontal, UserCheck, FileEdit, Clock,
  CheckCircle, XCircle, MoreHorizontal, Flag, UserX
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useNotification } from "@/components/notification";

// Mock data for user selection in notifications
const mockUsers = Array.from({ length: 5000 }, (_, index) => ({
  id: `${index + 1}`,
  name: `Người dùng ${index + 1}`,
  email: `user${index + 1}@email.com`,
  avatar: "/images/placeholders/placeholder-user.jpg",
  role: index < 100 ? "admin" : index < 1000 ? "premium" : "basic",
  isActive: Math.random() > 0.1, // 90% active
  lastLogin: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
}));

const mockNews = [
  {
    id: "1",
    title: "Cập nhật hệ thống mới - Tháng 1/2025",
    content: "Hệ thống đã được cập nhật với nhiều tính năng mới bao gồm giao diện người dùng được cải tiến, tối ưu hóa hiệu suất và bổ sung các tính năng bảo mật mới. Người dùng sẽ có trải nghiệm tốt hơn với tốc độ tải trang nhanh hơn 40%.",
    author: "Admin",
    status: "published",
    views: 1250,
    likes: 89,
    comments: 23,
    category: "system",
    tags: ["cập nhật", "hệ thống", "bảo mật"],
    createdAt: "2024-01-20T10:00:00Z",
    updatedAt: "2024-01-20T10:00:00Z"
  },
  {
    id: "2", 
    title: "Thông báo bảo trì hệ thống",
    content: "Hệ thống sẽ được bảo trì vào ngày 25/01/2025 từ 02:00 - 06:00. Trong thời gian này, một số tính năng có thể bị gián đoạn. Chúng tôi xin lỗi vì sự bất tiện này.",
    author: "Admin",
    status: "draft",
    views: 0,
    likes: 0,
    comments: 0,
    category: "maintenance",
    tags: ["bảo trì", "thông báo"],
    createdAt: "2024-01-19T15:30:00Z",
    updatedAt: "2024-01-19T15:30:00Z"
  },
  {
    id: "3",
    title: "Hướng dẫn sử dụng tính năng mới",
    content: "Bài viết hướng dẫn chi tiết cách sử dụng các tính năng mới được cập nhật trong phiên bản mới nhất của ứng dụng.",
    author: "Support Team",
    status: "published",
    views: 890,
    likes: 45,
    comments: 12,
    category: "guide",
    tags: ["hướng dẫn", "tính năng"],
    createdAt: "2024-01-18T09:15:00Z",
    updatedAt: "2024-01-18T09:15:00Z"
  },
  {
    id: "4",
    title: "Chính sách bảo mật mới",
    content: "Chúng tôi đã cập nhật chính sách bảo mật để đảm bảo thông tin người dùng được bảo vệ tốt hơn.",
    author: "Legal Team",
    status: "published",
    views: 567,
    likes: 23,
    comments: 8,
    category: "policy",
    tags: ["bảo mật", "chính sách"],
    createdAt: "2024-01-17T14:20:00Z",
    updatedAt: "2024-01-17T14:20:00Z"
  },
  {
    id: "5",
    title: "Kết quả cuộc thi tháng 12",
    content: "Danh sách người chiến thắng cuộc thi học tiếng Nhật tháng 12. Chúc mừng các bạn!",
    author: "Contest Team",
    status: "published",
    views: 2340,
    likes: 156,
    comments: 67,
    category: "contest",
    tags: ["cuộc thi", "kết quả"],
    createdAt: "2024-01-16T11:00:00Z",
    updatedAt: "2024-01-16T11:00:00Z"
  }
];

const mockReports = [
  {
    id: "1",
    reporter: { id: "1", name: "Nguyễn Văn A", email: "nguyenvana@email.com" },
    reportedUser: { id: "2", name: "Trần Thị B", email: "tranthib@email.com" },
    reason: "Spam tin nhắn",
    description: "Người dùng này liên tục gửi tin nhắn spam trong nhóm chat. Đã nhắc nhở nhiều lần nhưng không có thay đổi.",
    status: "pending",
    createdAt: "2024-01-20T14:30:00Z",
    category: "spam",
    priority: "high"
  },
  {
    id: "2",
    reporter: { id: "3", name: "Lê Văn C", email: "levanc@email.com" },
    reportedUser: { id: "1", name: "Nguyễn Văn A", email: "nguyenvana@email.com" },
    reason: "Nội dung không phù hợp",
    description: "Bài viết chứa nội dung không phù hợp với quy định cộng đồng.",
    status: "approved",
    createdAt: "2024-01-19T09:15:00Z",
    category: "content",
    priority: "medium",
    adminNote: "Đã xóa bài viết và cảnh báo người dùng"
  },
  {
    id: "3",
    reporter: { id: "4", name: "Phạm Thị D", email: "phamthid@email.com" },
    reportedUser: { id: "5", name: "Hoàng Văn E", email: "hoangvane@email.com" },
    reason: "Quấy rối",
    description: "Người này gửi tin nhắn quấy rối tình dục qua private message.",
    status: "pending",
    createdAt: "2024-01-18T16:20:00Z",
    category: "harassment",
    priority: "high"
  },
  {
    id: "4",
    reporter: { id: "6", name: "Vũ Thị F", email: "vuthif@email.com" },
    reportedUser: { id: "7", name: "Đỗ Văn G", email: "dovang@email.com" },
    reason: "Lừa đảo",
    description: "Người này lừa đảo tiền trong giao dịch mua bán tài khoản.",
    status: "rejected",
    createdAt: "2024-01-17T11:45:00Z",
    category: "fraud",
    priority: "high",
    adminNote: "Không đủ bằng chứng, từ chối tố cáo"
  },
  {
    id: "5",
    reporter: { id: "8", name: "Bùi Văn H", email: "buivanh@email.com" },
    reportedUser: { id: "9", name: "Ngô Thị I", email: "ngothii@email.com" },
    reason: "Vi phạm bản quyền",
    description: "Sao chép nội dung của người khác mà không xin phép.",
    status: "pending",
    createdAt: "2024-01-16T13:30:00Z",
    category: "copyright",
    priority: "medium"
  }
];

const mockNotifications = [
  {
    id: "1",
    title: "Thông báo hệ thống",
    message: "Hệ thống đã được cập nhật với nhiều tính năng mới. Vui lòng đăng nhập lại để trải nghiệm các tính năng mới.",
    type: "system",
    recipients: "all",
    sentBy: "Admin",
    status: "sent",
    sentAt: "2024-01-20T08:00:00Z",
    recipientCount: 5000
  },
  {
    id: "2",
    title: "Chúc mừng sinh nhật",
    message: "Chúc mừng sinh nhật bạn! Chúc bạn một năm mới tràn đầy niềm vui và thành công!",
    type: "personal",
    recipients: "specific",
    recipientCount: 5,
    sentBy: "Admin",
    status: "sent",
    sentAt: "2024-01-19T16:00:00Z"
  },
  {
    id: "3",
    title: "Thông báo bảo trì",
    message: "Hệ thống sẽ được bảo trì vào ngày 25/01/2025 từ 02:00 - 06:00. Vui lòng lưu lại công việc của bạn.",
    type: "maintenance",
    recipients: "all",
    sentBy: "System",
    status: "sent",
    sentAt: "2024-01-18T14:30:00Z",
    recipientCount: 5000
  },
  {
    id: "4",
    title: "Thông báo khóa học mới",
    message: "Khóa học 'Tiếng Nhật N3' đã được mở. Đăng ký ngay để nhận ưu đãi 20%!",
    type: "course",
    recipients: "premium",
    recipientCount: 1000,
    sentBy: "Course Team",
    status: "sent",
    sentAt: "2024-01-17T10:15:00Z"
  },
  {
    id: "5",
    title: "Cảnh báo bảo mật",
    message: "Phát hiện hoạt động đăng nhập bất thường. Vui lòng đổi mật khẩu ngay lập tức.",
    type: "security",
    recipients: "specific",
    recipientCount: 12,
    sentBy: "Security Team",
    status: "sent",
    sentAt: "2024-01-16T09:45:00Z"
  },
  {
    id: "6",
    title: "Kết quả cuộc thi",
    message: "Kết quả cuộc thi tháng 12 đã được công bố. Kiểm tra kết quả của bạn ngay!",
    type: "contest",
    recipients: "all",
    sentBy: "Contest Team",
    status: "sent",
    sentAt: "2024-01-15T18:00:00Z",
    recipientCount: 5000
  }
];

const mockTemplates = [
  {
    id: "1",
    name: "Thông báo hệ thống",
    title: "Cập nhật hệ thống",
    message: "Hệ thống đã được cập nhật với các tính năng mới. Vui lòng đăng nhập lại để trải nghiệm.",
    type: "system",
    createdAt: "2024-01-15T10:00:00Z",
    usageCount: 45
  },
  {
    id: "2",
    name: "Chúc mừng hoàn thành khóa học",
    title: "Chúc mừng!",
    message: "Chúc mừng bạn đã hoàn thành khóa học! Bạn đã làm rất tốt. Tiếp tục phát huy nhé!",
    type: "achievement",
    createdAt: "2024-01-14T14:30:00Z",
    usageCount: 23
  },
  {
    id: "3",
    name: "Thông báo bảo trì",
    title: "Bảo trì hệ thống",
    message: "Hệ thống sẽ được bảo trì từ [THỜI GIAN]. Trong thời gian này, một số tính năng có thể bị gián đoạn.",
    type: "maintenance",
    createdAt: "2024-01-13T09:15:00Z",
    usageCount: 12
  },
  {
    id: "4",
    name: "Chúc mừng sinh nhật",
    title: "Sinh nhật vui vẻ!",
    message: "Chúc mừng sinh nhật bạn! Chúc bạn một năm mới tràn đầy niềm vui, sức khỏe và thành công!",
    type: "personal",
    createdAt: "2024-01-12T16:45:00Z",
    usageCount: 67
  },
  {
    id: "5",
    name: "Cảnh báo bảo mật",
    title: "Cảnh báo bảo mật",
    message: "Chúng tôi phát hiện hoạt động đăng nhập bất thường từ tài khoản của bạn. Vui lòng đổi mật khẩu ngay lập tức.",
    type: "security",
    createdAt: "2024-01-11T11:20:00Z",
    usageCount: 8
  },
  {
    id: "6",
    name: "Thông báo khóa học mới",
    title: "Khóa học mới",
    message: "Khóa học '[TÊN KHÓA HỌC]' đã được mở. Đăng ký ngay để nhận ưu đãi đặc biệt!",
    type: "course",
    createdAt: "2024-01-10T14:00:00Z",
    usageCount: 34
  }
];

// Utility functions
const formatTimeAgo = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    return "Vừa xong";
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)} giờ trước`;
  } else if (diffInHours < 168) {
    const days = Math.floor(diffInHours / 24);
    return `${days} ngày trước`;
  } else {
    const weeks = Math.floor(diffInHours / 168);
    return `${weeks} tuần trước`;
  }
};

export default function AdminContentAndNotificationsPage() {
  const [activeTab, setActiveTab] = useState("notifications");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [reportSearchQuery, setReportSearchQuery] = useState("");
  const [reportStatusFilter, setReportStatusFilter] = useState("all");
  const [reportCurrentPage, setReportCurrentPage] = useState(1);
  const [reportsPerPage] = useState(5);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [newsSearchQuery, setNewsSearchQuery] = useState("");
  const [newsStatusFilter, setNewsStatusFilter] = useState("all");
  const [newsCurrentPage, setNewsCurrentPage] = useState(1);
  const [newsPerPage] = useState(4);
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [historyTypeFilter, setHistoryTypeFilter] = useState("all");
  const [historyCurrentPage, setHistoryCurrentPage] = useState(1);
  const [historyPerPage] = useState(6);
  const [templateSearchQuery, setTemplateSearchQuery] = useState("");
  const [templateTypeFilter, setTemplateTypeFilter] = useState("all");
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [newsTitle, setNewsTitle] = useState("");
  const [newsContent, setNewsContent] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [templateTitle, setTemplateTitle] = useState("");
  const [templateMessage, setTemplateMessage] = useState("");
  
  // Modal states
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showEditTemplateModal, setShowEditTemplateModal] = useState(false);
  const [showEditNewsModal, setShowEditNewsModal] = useState(false);
  const [showViewNewsModal, setShowViewNewsModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [editingNews, setEditingNews] = useState<any>(null);
  const [viewingNews, setViewingNews] = useState<any>(null);
  const [deletingNews, setDeletingNews] = useState<any>(null);
  const [reportsUpdated, setReportsUpdated] = useState(0);
  const [showAdminNoteModal, setShowAdminNoteModal] = useState(false);
  const [currentReport, setCurrentReport] = useState<any>(null);
  const [adminNote, setAdminNote] = useState("");
  const [reportAction, setReportAction] = useState<"approve" | "reject">("approve");

  const { success, error } = useNotification();

  // Admin note templates
  const adminNoteTemplates = [
    "Đã xem xét và duyệt tố cáo",
    "Không đủ bằng chứng, từ chối tố cáo",
    "Đã cảnh báo người dùng vi phạm",
    "Đã xóa nội dung vi phạm",
    "Cần thêm thông tin để xử lý",
    "Đã khóa tài khoản người dùng",
    "Tố cáo không chính xác",
    "Đã xử lý theo quy định"
  ];

  // Notification Actions
  const handleSendNotification = (type: "all" | "specific") => {
    if (type === "specific" && selectedUsers.length === 0) {
      error("Vui lòng chọn ít nhất một người dùng");
      return;
    }
    if (!notificationTitle || !notificationMessage) {
      error("Vui lòng điền đầy đủ tiêu đề và nội dung");
      return;
    }
    success(type === "all" ? "Đã gửi thông báo đến tất cả người dùng" : `Đã gửi thông báo đến ${selectedUsers.length} người dùng`);
    setNotificationTitle("");
    setNotificationMessage("");
    setSelectedUsers([]);
  };

  const handleCreateNews = () => {
    if (!newsTitle || !newsContent) {
      error("Vui lòng điền đầy đủ tiêu đề và nội dung");
      return;
    }
    success("Đã tạo bài tin tức mới");
    setNewsTitle("");
    setNewsContent("");
  };

  const handleCreateTemplate = () => {
    if (!templateName || !templateMessage) {
      error("Vui lòng điền đầy đủ tên và nội dung template");
      return;
    }
    success("Đã tạo template mới");
    setTemplateName("");
    setTemplateTitle("");
    setTemplateMessage("");
  };

  // Preview News Handler
  const handlePreviewNews = () => {
    if (newsTitle && newsContent) {
      setPreviewData({
        title: newsTitle,
        content: newsContent,
        author: "Admin"
      });
      setShowPreviewModal(true);
    } else {
      error("Vui lòng nhập tiêu đề và nội dung để xem trước");
    }
  };

  // Edit Template Handler
  const handleEditTemplate = (template: any) => {
    setEditingTemplate(template);
    setShowEditTemplateModal(true);
  };

  // Use Template Handler
  const handleUseTemplate = (template: any) => {
    setActiveTab("notifications");
    setNotificationTitle(template.title);
    setNotificationMessage(template.message);
    success(`Đã áp dụng template "${template.name}" vào form gửi thông báo`);
  };

  // Update Template Handler
  const handleUpdateTemplate = () => {
    if (editingTemplate) {
      success(`Template "${editingTemplate.name}" đã được cập nhật thành công!`);
      setShowEditTemplateModal(false);
      setEditingTemplate(null);
    }
  };

  // News CRUD Handlers
  const handleEditNews = (news: any) => {
    setEditingNews(news);
    setShowEditNewsModal(true);
  };

  const handleViewNews = (news: any) => {
    setViewingNews(news);
    setShowViewNewsModal(true);
  };

  const handleDeleteNews = (news: any) => {
    setDeletingNews(news);
    setShowDeleteConfirmModal(true);
  };

  const handleUpdateNews = () => {
    if (editingNews) {
      success(`Tin tức "${editingNews.title}" đã được cập nhật thành công!`);
      setShowEditNewsModal(false);
      setEditingNews(null);
    }
  };

  const handleConfirmDeleteNews = () => {
    if (deletingNews) {
      success(`Tin tức "${deletingNews.title}" đã được xóa thành công!`);
      setShowDeleteConfirmModal(false);
      setDeletingNews(null);
    }
  };

  // Export Handlers
  const handleExportNews = () => {
    success("Đang xuất danh sách tin tức ra Excel...");
  };

  const handleExportReports = () => {
    success("Đang xuất danh sách tố cáo ra Excel...");
  };

  const handleExportNotifications = () => {
    success("Đang xuất lịch sử thông báo ra Excel...");
  };

  const handleExportTemplates = () => {
    success("Đang xuất danh sách template ra Excel...");
  };


  const handleApproveReport = (reportId: string) => {
    const report = mockReports.find(r => r.id === reportId);
    if (report) {
      setCurrentReport(report);
      setReportAction("approve");
      setAdminNote("Đã xem xét và duyệt tố cáo"); // Default note
      setShowAdminNoteModal(true);
    }
  };

  const handleRejectReport = (reportId: string) => {
    const report = mockReports.find(r => r.id === reportId);
    if (report) {
      setCurrentReport(report);
      setReportAction("reject");
      setAdminNote("Không đủ bằng chứng, từ chối tố cáo"); // Default note
      setShowAdminNoteModal(true);
    }
  };

  const handleConfirmReportAction = () => {
    if (currentReport && adminNote.trim()) {
      currentReport.status = reportAction === "approve" ? "approved" : "rejected";
      currentReport.adminNote = adminNote;
      setReportsUpdated(prev => prev + 1);
      
      const actionText = reportAction === "approve" ? "duyệt" : "từ chối";
      success(`Đã ${actionText} tố cáo với ghi chú: "${adminNote}"`);
      
      setShowAdminNoteModal(false);
      setCurrentReport(null);
      setAdminNote("");
    }
  };

  const handleToggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  // Filter and paginate users
  const filteredUsers = useMemo(() => {
    let filtered = mockUsers;
    
    // Apply search filter
    if (userSearchQuery) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [userSearchQuery]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * usersPerPage;
    return filteredUsers.slice(startIndex, startIndex + usersPerPage);
  }, [filteredUsers, currentPage, usersPerPage]);

  const userTotalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Filter and paginate reports
  const filteredReports = useMemo(() => {
    let filtered = mockReports;
    
    // Apply search filter
    if (reportSearchQuery) {
      filtered = filtered.filter(report => 
        report.reason.toLowerCase().includes(reportSearchQuery.toLowerCase()) ||
        report.reporter.name.toLowerCase().includes(reportSearchQuery.toLowerCase()) ||
        report.reportedUser.name.toLowerCase().includes(reportSearchQuery.toLowerCase()) ||
        report.description.toLowerCase().includes(reportSearchQuery.toLowerCase())
      );
    }
    
    // Apply status filter
    if (reportStatusFilter !== "all") {
      filtered = filtered.filter(report => report.status === reportStatusFilter);
    }
    
    return filtered;
  }, [reportSearchQuery, reportStatusFilter]);

  const paginatedReports = useMemo(() => {
    const startIndex = (reportCurrentPage - 1) * reportsPerPage;
    return filteredReports.slice(startIndex, startIndex + reportsPerPage);
  }, [filteredReports, reportCurrentPage, reportsPerPage]);

  const reportTotalPages = Math.ceil(filteredReports.length / reportsPerPage);

  // Report statistics
  const reportStats = useMemo(() => {
    const total = mockReports.length;
    const pending = mockReports.filter(r => r.status === "pending").length;
    const approved = mockReports.filter(r => r.status === "approved").length;
    const rejected = mockReports.filter(r => r.status === "rejected").length;
    const highPriority = mockReports.filter(r => r.priority === "high").length;
    return { total, pending, approved, rejected, highPriority };
  }, []);

  // Filter and paginate news
  const filteredNews = useMemo(() => {
    let filtered = mockNews;
    
    // Apply search filter
    if (newsSearchQuery) {
      filtered = filtered.filter(news => 
        news.title.toLowerCase().includes(newsSearchQuery.toLowerCase()) ||
        news.content.toLowerCase().includes(newsSearchQuery.toLowerCase()) ||
        news.author.toLowerCase().includes(newsSearchQuery.toLowerCase()) ||
        news.tags.some(tag => tag.toLowerCase().includes(newsSearchQuery.toLowerCase()))
      );
    }
    
    // Apply status filter
    if (newsStatusFilter !== "all") {
      filtered = filtered.filter(news => news.status === newsStatusFilter);
    }
    
    return filtered;
  }, [newsSearchQuery, newsStatusFilter]);

  const paginatedNews = useMemo(() => {
    const startIndex = (newsCurrentPage - 1) * newsPerPage;
    return filteredNews.slice(startIndex, startIndex + newsPerPage);
  }, [filteredNews, newsCurrentPage, newsPerPage]);

  const newsTotalPages = Math.ceil(filteredNews.length / newsPerPage);

  // Filter and paginate notifications history
  const filteredNotifications = useMemo(() => {
    let filtered = mockNotifications;
    
    // Apply search filter
    if (historySearchQuery) {
      filtered = filtered.filter(notification => 
        notification.title.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
        notification.message.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
        notification.type.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
        notification.sentBy.toLowerCase().includes(historySearchQuery.toLowerCase())
      );
    }
    
    // Apply type filter
    if (historyTypeFilter !== "all") {
      filtered = filtered.filter(notification => notification.type === historyTypeFilter);
    }
    
    return filtered;
  }, [historySearchQuery, historyTypeFilter]);

  const paginatedNotifications = useMemo(() => {
    const startIndex = (historyCurrentPage - 1) * historyPerPage;
    return filteredNotifications.slice(startIndex, startIndex + historyPerPage);
  }, [filteredNotifications, historyCurrentPage, historyPerPage]);

  const historyTotalPages = Math.ceil(filteredNotifications.length / historyPerPage);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    let filtered = mockTemplates;
    
    // Apply search filter
    if (templateSearchQuery) {
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
        template.title.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
        template.message.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
        template.type.toLowerCase().includes(templateSearchQuery.toLowerCase())
      );
    }
    
    // Apply type filter
    if (templateTypeFilter !== "all") {
      filtered = filtered.filter(template => template.type === templateTypeFilter);
    }
    
    return filtered;
  }, [templateSearchQuery, templateTypeFilter]);


  // Statistics for all tabs
  const newsStats = useMemo(() => {
    const total = mockNews.length;
    const published = mockNews.filter(n => n.status === "published").length;
    const draft = mockNews.filter(n => n.status === "draft").length;
    const totalViews = mockNews.reduce((sum, n) => sum + n.views, 0);
    return { total, published, draft, totalViews };
  }, []);

  const notificationStats = useMemo(() => {
    const total = mockNotifications.length;
    const system = mockNotifications.filter(n => n.type === "system").length;
    const personal = mockNotifications.filter(n => n.type === "personal").length;
    const totalRecipients = mockNotifications.reduce((sum, n) => sum + (n.recipientCount || 0), 0);
    return { total, system, personal, totalRecipients };
  }, []);

  const templateStats = useMemo(() => {
    const total = mockTemplates.length;
    const system = mockTemplates.filter(t => t.type === "system").length;
    const personal = mockTemplates.filter(t => t.type === "personal").length;
    const totalUsage = mockTemplates.reduce((sum, t) => sum + t.usageCount, 0);
    return { total, system, personal, totalUsage };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản Lý Nội Dung & Thông Báo</h1>
        <p className="text-gray-600">Quản lý tin tức, thông báo và xét duyệt tố cáo</p>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-5 bg-white border border-gray-200 rounded-lg p-1">
          <TabsTrigger 
            value="notifications" 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md px-4 py-2 text-gray-700 font-medium transition-all"
          >
            <Bell className="w-4 h-4 mr-2" />
            Thông Báo
          </TabsTrigger>
          <TabsTrigger 
            value="news" 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md px-4 py-2 text-gray-700 font-medium transition-all"
          >
            <Newspaper className="w-4 h-4 mr-2" />
            Tin Tức
          </TabsTrigger>
          <TabsTrigger 
            value="reports" 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md px-4 py-2 text-gray-700 font-medium transition-all"
          >
            <Flag className="w-4 h-4 mr-2" />
            Tố Cáo
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md px-4 py-2 text-gray-700 font-medium transition-all"
          >
            <History className="w-4 h-4 mr-2" />
            Lịch Sử
          </TabsTrigger>
          <TabsTrigger 
            value="templates" 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md px-4 py-2 text-gray-700 font-medium transition-all"
          >
            <FileText className="w-4 h-4 mr-2" />
            Template
          </TabsTrigger>
        </TabsList>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Send System Notification */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 font-semibold">
                  <Send className="w-5 h-5 text-blue-600" />
                  Gửi Thông Báo Hệ Thống
                </CardTitle>
                <CardDescription className="text-gray-700">Gửi thông báo đến tất cả người dùng</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="system-title" className="text-gray-900 font-medium">Tiêu đề</Label>
                  <Input
                    id="system-title"
                    placeholder="Nhập tiêu đề thông báo..."
                    value={notificationTitle}
                    onChange={(e) => setNotificationTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="system-message" className="text-gray-900 font-medium">Nội dung</Label>
                  <Textarea
                    id="system-message"
                    placeholder="Nhập nội dung thông báo..."
                    value={notificationMessage}
                    onChange={(e) => setNotificationMessage(e.target.value)}
                    rows={4}
                  />
                </div>
                <Button 
                  onClick={() => handleSendNotification("all")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <SendHorizontal className="w-4 h-4 mr-2" />
                  Gửi đến tất cả người dùng
                </Button>
              </CardContent>
            </Card>

            {/* Send Specific Notification */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 font-semibold">
                  <UserCheck className="w-5 h-5 text-green-600" />
                  Gửi Thông Báo Cá Nhân
                </CardTitle>
                <CardDescription className="text-gray-700">Gửi thông báo đến người dùng cụ thể</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-gray-900 font-medium">
                      Chọn người dùng ({selectedUsers.length} đã chọn / {filteredUsers.length} kết quả)
                    </Label>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={handleSelectAllUsers}
                        className="text-xs"
                      >
                        {selectedUsers.length === filteredUsers.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Search */}
                  <div className="mb-3">
                    <Input
                      placeholder="Tìm kiếm theo tên hoặc email..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  
                  {/* Users List */}
                  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md p-2 space-y-2 mb-3">
                    {paginatedUsers.map((user) => (
                      <div key={user.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                        <Checkbox
                          id={user.id}
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={() => handleToggleUserSelection(user.id)}
                        />
                        <Label htmlFor={user.id} className="flex items-center gap-2 flex-1 cursor-pointer">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <span className="text-sm text-gray-900 font-medium">{user.name}</span>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                          <Badge className={`text-xs ${
                            user.role === "admin" ? "bg-red-100 text-red-800" :
                            user.role === "premium" ? "bg-blue-100 text-blue-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {user.role}
                          </Badge>
                        </Label>
                      </div>
                    ))}
                    
                    {paginatedUsers.length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-gray-700 font-medium">Không tìm thấy người dùng nào</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Pagination */}
                  {userTotalPages > 1 && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-700 font-medium">
                        Trang {currentPage} / {userTotalPages} ({filteredUsers.length} kết quả)
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                        >
                          Trước
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setCurrentPage(prev => Math.min(userTotalPages, prev + 1))}
                          disabled={currentPage === userTotalPages}
                        >
                          Sau
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="personal-title" className="text-gray-900 font-medium">Tiêu đề</Label>
                  <Input
                    id="personal-title"
                    placeholder="Nhập tiêu đề thông báo..."
                    value={notificationTitle}
                    onChange={(e) => setNotificationTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="personal-message" className="text-gray-900 font-medium">Nội dung</Label>
                  <Textarea
                    id="personal-message"
                    placeholder="Nhập nội dung thông báo..."
                    value={notificationMessage}
                    onChange={(e) => setNotificationMessage(e.target.value)}
                    rows={4}
                  />
                </div>
                <Button 
                  onClick={() => handleSendNotification("specific")}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={selectedUsers.length === 0}
                >
                  <SendHorizontal className="w-4 h-4 mr-2" />
                  Gửi đến {selectedUsers.length} người dùng
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* News Tab */}
        <TabsContent value="news" className="mt-6">
          {/* News Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tổng tin tức</p>
                    <p className="text-2xl font-bold text-gray-900">{newsStats.total}</p>
                  </div>
                  <Newspaper className="w-8 h-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Đã xuất bản</p>
                    <p className="text-2xl font-bold text-green-600">{newsStats.published}</p>
                  </div>
                  <Eye className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Bản nháp</p>
                    <p className="text-2xl font-bold text-yellow-600">{newsStats.draft}</p>
                  </div>
                  <FileEdit className="w-8 h-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tổng lượt xem</p>
                    <p className="text-2xl font-bold text-blue-600">{newsStats.totalViews.toLocaleString()}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Create News */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 font-semibold">
                  <FileEdit className="w-5 h-5 text-orange-600" />
                  Viết Bài Tin Tức Mới
                </CardTitle>
                <CardDescription className="text-gray-700">Cập nhật tin tức cho người dùng</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="news-title" className="text-gray-900 font-medium">Tiêu đề</Label>
                  <Input
                    id="news-title"
                    placeholder="Nhập tiêu đề bài viết..."
                    value={newsTitle}
                    onChange={(e) => setNewsTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="news-content" className="text-gray-900 font-medium">Nội dung</Label>
                  <Textarea
                    id="news-content"
                    placeholder="Nhập nội dung bài viết..."
                    value={newsContent}
                    onChange={(e) => setNewsContent(e.target.value)}
                    rows={8}
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handlePreviewNews}
                    variant="outline"
                    className="mr-2"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Xem trước
                  </Button>
                  <Button 
                    onClick={handleCreateNews}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo bài viết
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* News Management */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 font-semibold">
                  <Newspaper className="w-5 h-5 text-purple-600" />
                  Quản Lý Tin Tức
                </CardTitle>
                <CardDescription className="text-gray-700">Danh sách các bài tin tức đã tạo</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <Input
                      placeholder="Tìm kiếm theo tiêu đề, nội dung, tác giả..."
                      value={newsSearchQuery}
                      onChange={(e) => setNewsSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Select value={newsStatusFilter} onValueChange={setNewsStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Lọc theo trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="published">Đã xuất bản</SelectItem>
                      <SelectItem value="draft">Bản nháp</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    className="whitespace-nowrap"
                    onClick={handleExportNews}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Xuất Excel
                  </Button>
                </div>

                <div className="space-y-4">
                  {paginatedNews.map((news) => (
                    <div key={news.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{news.title}</h3>
                        <p className="text-sm text-gray-700 line-clamp-2 mt-1">{news.content}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-700">
                          <span className="font-semibold text-gray-900">Tác giả: {news.author}</span>
                          <span className="font-semibold text-gray-900">Lượt xem: {news.views}</span>
                          <span className="font-semibold text-gray-900">Thích: {news.likes}</span>
                          <span className="font-semibold text-gray-900">Bình luận: {news.comments}</span>
                          <Badge className="bg-blue-100 text-blue-800 text-xs font-medium">{news.category}</Badge>
                          <span className="font-semibold text-gray-900">Cập nhật: {formatTimeAgo(news.updatedAt)}</span>
                        </div>
                        <div className="flex gap-1 mt-2">
                          {news.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs text-gray-800 border-gray-400">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={news.status === "published" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                          {news.status === "published" ? "Đã xuất bản" : "Bản nháp"}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditNews(news)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewNews(news)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Xem
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteNews(news)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                  
                  {paginatedNews.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <Newspaper className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-semibold text-gray-800">Không tìm thấy tin tức nào</p>
                      <p className="text-sm text-gray-600">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                    </div>
                  )}
                </div>
                
                {/* Pagination */}
                {newsTotalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-gray-800 font-semibold">
                      Trang {newsCurrentPage} / {newsTotalPages} ({filteredNews.length} kết quả)
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setNewsCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={newsCurrentPage === 1}
                      >
                        Trước
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setNewsCurrentPage(prev => Math.min(newsTotalPages, prev + 1))}
                        disabled={newsCurrentPage === newsTotalPages}
                      >
                        Sau
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="mt-6">
          {/* Report Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tổng tố cáo</p>
                    <p className="text-2xl font-bold text-gray-900">{reportStats.total}</p>
                  </div>
                  <Flag className="w-8 h-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Chờ xét duyệt</p>
                    <p className="text-2xl font-bold text-yellow-600">{reportStats.pending}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Đã duyệt</p>
                    <p className="text-2xl font-bold text-green-600">{reportStats.approved}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Đã từ chối</p>
                    <p className="text-2xl font-bold text-red-600">{reportStats.rejected}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ưu tiên cao</p>
                    <p className="text-2xl font-bold text-purple-600">{reportStats.highPriority}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 font-semibold">
                <Flag className="w-5 h-5 text-red-600" />
                Xét Duyệt Tố Cáo
              </CardTitle>
              <CardDescription className="text-gray-700">Xem xét và xử lý các báo cáo từ người dùng</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Tìm kiếm theo lý do, tên người dùng..."
                    value={reportSearchQuery}
                    onChange={(e) => setReportSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={reportStatusFilter} onValueChange={setReportStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Lọc theo trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="pending">Chờ xét duyệt</SelectItem>
                    <SelectItem value="approved">Đã duyệt</SelectItem>
                    <SelectItem value="rejected">Đã từ chối</SelectItem>
                  </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    className="whitespace-nowrap"
                    onClick={handleExportReports}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Xuất Excel
                  </Button>
                </div>

                <div className="space-y-4">
                  {paginatedReports.map((report) => (
                  <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-red-100 text-red-800">Tố cáo</Badge>
                          <Badge className={
                            report.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                            report.status === "approved" ? "bg-green-100 text-green-800" :
                            "bg-gray-100 text-gray-800"
                          }>
                            {report.status === "pending" ? "Chờ xét duyệt" : 
                             report.status === "approved" ? "Đã duyệt" : "Đã từ chối"}
                          </Badge>
                          <Badge className={
                            report.priority === "high" ? "bg-red-100 text-red-800" :
                            report.priority === "medium" ? "bg-yellow-100 text-yellow-800" :
                            "bg-blue-100 text-blue-800"
                          }>
                            {report.priority === "high" ? "Ưu tiên cao" :
                             report.priority === "medium" ? "Ưu tiên trung bình" : "Ưu tiên thấp"}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Lý do: {report.reason}</h3>
                        <p className="text-gray-600 mb-3">{report.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-semibold text-gray-900">Người báo cáo:</span>
                            <p className="text-gray-700">{report.reporter.name} ({report.reporter.email})</p>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900">Người bị tố cáo:</span>
                            <p className="text-gray-700">{report.reportedUser.name} ({report.reportedUser.email})</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mt-2 font-medium">
                          Thời gian: {formatTimeAgo(report.createdAt)}
                        </p>
                        {report.adminNote && (
                          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <p className="text-sm font-semibold text-blue-900 mb-1">Ghi chú của Admin:</p>
                            <p className="text-sm text-blue-800">{report.adminNote}</p>
                          </div>
                        )}
                      </div>
                      {report.status === "pending" && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleApproveReport(report.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Duyệt
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50"
                            onClick={() => handleRejectReport(report.id)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Từ chối
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {paginatedReports.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Flag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-semibold text-gray-800">Không tìm thấy tố cáo nào</p>
                    <p className="text-sm text-gray-600">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                  </div>
                )}
              </div>
              
              {/* Pagination */}
              {reportTotalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-gray-800 font-semibold">
                    Trang {reportCurrentPage} / {reportTotalPages} ({filteredReports.length} kết quả)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setReportCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={reportCurrentPage === 1}
                    >
                      Trước
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setReportCurrentPage(prev => Math.min(reportTotalPages, prev + 1))}
                      disabled={reportCurrentPage === reportTotalPages}
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="mt-6">
          {/* History Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tổng thông báo</p>
                    <p className="text-2xl font-bold text-gray-900">{notificationStats.total}</p>
                  </div>
                  <Bell className="w-8 h-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Hệ thống</p>
                    <p className="text-2xl font-bold text-blue-600">{notificationStats.system}</p>
                  </div>
                  <Settings className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cá nhân</p>
                    <p className="text-2xl font-bold text-green-600">{notificationStats.personal}</p>
                  </div>
                  <User className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tổng người nhận</p>
                    <p className="text-2xl font-bold text-purple-600">{notificationStats.totalRecipients.toLocaleString()}</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 font-semibold">
                <History className="w-5 h-5 text-indigo-600" />
                Lịch Sử Thông Báo
              </CardTitle>
              <CardDescription className="text-gray-700">Danh sách các thông báo đã gửi</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Tìm kiếm theo tiêu đề, nội dung, người gửi..."
                    value={historySearchQuery}
                    onChange={(e) => setHistorySearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={historyTypeFilter} onValueChange={setHistoryTypeFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Lọc theo loại" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="system">Hệ thống</SelectItem>
                    <SelectItem value="personal">Cá nhân</SelectItem>
                    <SelectItem value="maintenance">Bảo trì</SelectItem>
                    <SelectItem value="course">Khóa học</SelectItem>
                    <SelectItem value="security">Bảo mật</SelectItem>
                    <SelectItem value="contest">Cuộc thi</SelectItem>
                  </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    className="whitespace-nowrap"
                    onClick={handleExportNotifications}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Xuất Excel
                  </Button>
                </div>

              <div className="space-y-4">
                {paginatedNotifications.map((notification) => (
                  <div key={notification.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Bell className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                        <p className="text-sm text-gray-700">{notification.message}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-700">
                          <span className="font-semibold text-gray-900">Loại: {notification.type}</span>
                          <span className="font-semibold text-gray-900">
                            Người nhận: {notification.recipients === "all" ? "Tất cả" : `${notification.recipientCount} người`}
                          </span>
                          <span className="font-semibold text-gray-900">Gửi bởi: {notification.sentBy}</span>
                          <span className="font-semibold text-gray-900">Thời gian: {formatTimeAgo(notification.sentAt)}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className={notification.status === "sent" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {notification.status === "sent" ? "Đã gửi" : "Đang gửi"}
                    </Badge>
                  </div>
                ))}
                
                {paginatedNotifications.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-semibold text-gray-800">Không tìm thấy thông báo nào</p>
                    <p className="text-sm text-gray-600">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                  </div>
                )}
              </div>
              
              {/* Pagination */}
              {historyTotalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-gray-800 font-semibold">
                    Trang {historyCurrentPage} / {historyTotalPages} ({filteredNotifications.length} kết quả)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setHistoryCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={historyCurrentPage === 1}
                    >
                      Trước
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setHistoryCurrentPage(prev => Math.min(historyTotalPages, prev + 1))}
                      disabled={historyCurrentPage === historyTotalPages}
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="mt-6">
          {/* Template Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tổng template</p>
                    <p className="text-2xl font-bold text-gray-900">{templateStats.total}</p>
                  </div>
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Hệ thống</p>
                    <p className="text-2xl font-bold text-blue-600">{templateStats.system}</p>
                  </div>
                  <Settings className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cá nhân</p>
                    <p className="text-2xl font-bold text-green-600">{templateStats.personal}</p>
                  </div>
                  <User className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tổng sử dụng</p>
                    <p className="text-2xl font-bold text-purple-600">{templateStats.totalUsage}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Create Template */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 font-semibold">
                  <FileText className="w-5 h-5 text-purple-600" />
                  Tạo Template Thông Báo
                </CardTitle>
                <CardDescription className="text-gray-700">Tạo sẵn các mẫu thông báo để sử dụng lại</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="template-name" className="text-gray-900 font-medium">Tên template</Label>
                  <Input
                    id="template-name"
                    placeholder="Nhập tên template..."
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="template-title" className="text-gray-900 font-medium">Tiêu đề mặc định</Label>
                  <Input
                    id="template-title"
                    placeholder="Nhập tiêu đề mặc định..."
                    value={templateTitle}
                    onChange={(e) => setTemplateTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="template-message" className="text-gray-900 font-medium">Nội dung mẫu</Label>
                  <Textarea
                    id="template-message"
                    placeholder="Nhập nội dung mẫu..."
                    value={templateMessage}
                    onChange={(e) => setTemplateMessage(e.target.value)}
                    rows={6}
                  />
                </div>
                <Button 
                  onClick={handleCreateTemplate}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo template
                </Button>
              </CardContent>
            </Card>

            {/* Templates List */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 font-semibold">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Danh Sách Template
                </CardTitle>
                <CardDescription className="text-gray-700">Các template thông báo có sẵn</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <Input
                      placeholder="Tìm kiếm theo tên, tiêu đề, nội dung..."
                      value={templateSearchQuery}
                      onChange={(e) => setTemplateSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Select value={templateTypeFilter} onValueChange={setTemplateTypeFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Lọc theo loại" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="system">Hệ thống</SelectItem>
                      <SelectItem value="personal">Cá nhân</SelectItem>
                      <SelectItem value="achievement">Thành tích</SelectItem>
                      <SelectItem value="maintenance">Bảo trì</SelectItem>
                      <SelectItem value="security">Bảo mật</SelectItem>
                      <SelectItem value="course">Khóa học</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    className="whitespace-nowrap"
                    onClick={handleExportTemplates}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Xuất Excel
                  </Button>
                </div>

                <div className="space-y-4">
                  {filteredTemplates.map((template) => (
                    <div key={template.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{template.name}</h3>
                        <p className="text-sm text-gray-700 line-clamp-2 mt-1">{template.message}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-700">
                          <Badge className="bg-blue-100 text-blue-800 font-medium">{template.type}</Badge>
                          <span className="font-semibold text-gray-900">Sử dụng: {template.usageCount} lần</span>
                          <span className="font-semibold text-gray-900">Tạo: {formatTimeAgo(template.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditTemplate(template)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Sửa
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => handleUseTemplate(template)}
                        >
                          <SendHorizontal className="w-4 h-4 mr-1" />
                          Sử dụng
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

      </Tabs>

      {/* Preview News Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-black font-bold text-xl">Xem trước bài viết</DialogTitle>
            <DialogDescription className="text-gray-800 font-medium">
              Đây là cách bài viết sẽ hiển thị cho người dùng
            </DialogDescription>
          </DialogHeader>
          
          {previewData && (
            <div className="space-y-6">
              {/* Preview Header */}
              <div className="border-b border-gray-200 pb-4">
                <h1 className="text-3xl font-bold text-black mb-2">{previewData.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-800">
                  <span className="font-semibold">Tác giả: {previewData.author}</span>
                  <span className="font-semibold">Ngày: {new Date().toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
              
              {/* Preview Content */}
              <div className="prose prose-gray max-w-none">
                <div className="whitespace-pre-wrap text-black leading-relaxed font-semibold text-lg">
                  {previewData.content}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreviewModal(false)}>
              Đóng
            </Button>
            <Button 
              onClick={() => {
                setShowPreviewModal(false);
                handleCreateNews();
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Tạo bài viết
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Template Modal */}
      <Dialog open={showEditTemplateModal} onOpenChange={setShowEditTemplateModal}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-black font-bold text-xl">Chỉnh sửa Template</DialogTitle>
            <DialogDescription className="text-gray-800 font-medium">
              Cập nhật thông tin template thông báo
            </DialogDescription>
          </DialogHeader>
          
          {editingTemplate && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-template-name" className="text-black font-semibold">Tên Template</Label>
                <Input
                  id="edit-template-name"
                  value={editingTemplate.name}
                  onChange={(e) => setEditingTemplate({...editingTemplate, name: e.target.value})}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-template-title" className="text-black font-semibold">Tiêu đề</Label>
                <Input
                  id="edit-template-title"
                  value={editingTemplate.title}
                  onChange={(e) => setEditingTemplate({...editingTemplate, title: e.target.value})}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-template-message" className="text-black font-semibold">Nội dung</Label>
                <Textarea
                  id="edit-template-message"
                  value={editingTemplate.message}
                  onChange={(e) => setEditingTemplate({...editingTemplate, message: e.target.value})}
                  rows={6}
                  className="mt-1"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditTemplateModal(false)}>
              Hủy
            </Button>
            <Button 
              onClick={handleUpdateTemplate}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit News Modal */}
      <Dialog open={showEditNewsModal} onOpenChange={setShowEditNewsModal}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-black font-bold text-xl">Chỉnh sửa tin tức</DialogTitle>
            <DialogDescription className="text-gray-800 font-medium">
              Cập nhật thông tin bài viết tin tức
            </DialogDescription>
          </DialogHeader>
          
          {editingNews && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-news-title" className="text-black font-semibold">Tiêu đề</Label>
                <Input
                  id="edit-news-title"
                  value={editingNews.title}
                  onChange={(e) => setEditingNews({...editingNews, title: e.target.value})}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-news-content" className="text-black font-semibold">Nội dung</Label>
                <Textarea
                  id="edit-news-content"
                  value={editingNews.content}
                  onChange={(e) => setEditingNews({...editingNews, content: e.target.value})}
                  rows={8}
                  className="mt-1"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditNewsModal(false)}>
              Hủy
            </Button>
            <Button 
              onClick={handleUpdateNews}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View News Modal */}
      <Dialog open={showViewNewsModal} onOpenChange={setShowViewNewsModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-black font-bold text-xl">Chi tiết tin tức</DialogTitle>
            <DialogDescription className="text-gray-800 font-medium">
              Thông tin chi tiết về bài viết
            </DialogDescription>
          </DialogHeader>
          
          {viewingNews && (
            <div className="space-y-6">
              {/* News Header */}
              <div className="border-b border-gray-200 pb-4">
                <h1 className="text-3xl font-bold text-black mb-2">{viewingNews.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-800">
                  <span className="font-semibold">Tác giả: {viewingNews.author}</span>
                  <span className="font-semibold">Lượt xem: {viewingNews.views}</span>
                  <span className="font-semibold">Thích: {viewingNews.likes}</span>
                  <span className="font-semibold">Bình luận: {viewingNews.comments}</span>
                  <Badge className={viewingNews.status === "published" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                    {viewingNews.status === "published" ? "Đã xuất bản" : "Bản nháp"}
                  </Badge>
                </div>
                <div className="flex gap-1 mt-2">
                  {viewingNews.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs text-gray-800 border-gray-400">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* News Content */}
              <div className="prose prose-gray max-w-none">
                <div className="whitespace-pre-wrap text-black leading-relaxed font-semibold text-lg">
                  {viewingNews.content}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewNewsModal(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirmModal} onOpenChange={setShowDeleteConfirmModal}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-black font-bold text-xl">Xác nhận xóa</DialogTitle>
            <DialogDescription className="text-gray-800 font-medium">
              Bạn có chắc chắn muốn xóa tin tức này không? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          
          {deletingNews && (
            <div className="py-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-2">Tin tức sẽ bị xóa:</h3>
                <p className="text-red-700 font-medium">{deletingNews.title}</p>
                <p className="text-sm text-red-600 mt-1">Tác giả: {deletingNews.author}</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirmModal(false)}>
              Hủy
            </Button>
            <Button 
              onClick={handleConfirmDeleteNews}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Xóa tin tức
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin Note Modal */}
      <Dialog open={showAdminNoteModal} onOpenChange={setShowAdminNoteModal}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-black font-bold text-xl">
              {reportAction === "approve" ? "Duyệt tố cáo" : "Từ chối tố cáo"}
            </DialogTitle>
            <DialogDescription className="text-gray-800 font-medium">
              {reportAction === "approve" 
                ? "Thêm ghi chú khi duyệt tố cáo này" 
                : "Thêm ghi chú khi từ chối tố cáo này"
              }
            </DialogDescription>
          </DialogHeader>
          
          {currentReport && (
            <div className="space-y-4">
              {/* Report Info */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Thông tin tố cáo:</h3>
                <p className="text-sm text-gray-700"><strong>Lý do:</strong> {currentReport.reason}</p>
                <p className="text-sm text-gray-700"><strong>Người báo cáo:</strong> {currentReport.reporter.name}</p>
                <p className="text-sm text-gray-700"><strong>Người bị tố cáo:</strong> {currentReport.reportedUser.name}</p>
              </div>

              {/* Template Selection */}
              <div>
                <Label className="text-black font-semibold">Chọn mẫu ghi chú có sẵn:</Label>
                <Select value={adminNote} onValueChange={setAdminNote}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Chọn mẫu ghi chú..." />
                  </SelectTrigger>
                  <SelectContent>
                    {adminNoteTemplates.map((template, index) => (
                      <SelectItem key={index} value={template}>
                        {template}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Note */}
              <div>
                <Label htmlFor="admin-note" className="text-black font-semibold">Ghi chú tùy chỉnh:</Label>
                <Textarea
                  id="admin-note"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Nhập ghi chú của bạn..."
                  rows={4}
                  className="mt-1"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdminNoteModal(false)}>
              Hủy
            </Button>
            <Button 
              onClick={handleConfirmReportAction}
              className={reportAction === "approve" 
                ? "bg-green-600 hover:bg-green-700 text-white" 
                : "bg-red-600 hover:bg-red-700 text-white"
              }
            >
              {reportAction === "approve" ? "Duyệt tố cáo" : "Từ chối tố cáo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}