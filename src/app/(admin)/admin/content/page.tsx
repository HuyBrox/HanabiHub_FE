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
import BackendStatus from "@/components/BackendStatus";

// API Services
import { notificationApi, type NotificationRequest, type NotificationHistory, type NotificationStats } from "@/store/services/notificationApi";
import { newsApi, type NewsItem, type CreateNewsRequest, type NewsStats } from "@/store/services/newsApi";
import { reportApi, type ReportItem, type ReportStats } from "@/store/services/reportApi";
import { templateApi, type TemplateItem, type CreateTemplateRequest, type TemplateStats } from "@/store/services/templateApi";
import { userApi, type UserItem, type UserStats } from "@/store/services/userApi";

// Utils
import { handleApiResponse, handlePaginatedResponse, formatTimeAgo, getErrorMessage, debounce } from "@/utils/apiHelper";
import { handleExportResponse, generateFilename } from "@/utils/exportHelper";

// Loading states
const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
} as const;

export default function AdminContentAndNotificationsPage() {
  // Tab state
  const [activeTab, setActiveTab] = useState("notifications");
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [reportSearchQuery, setReportSearchQuery] = useState("");
  const [reportStatusFilter, setReportStatusFilter] = useState("all");
  const [reportCurrentPage, setReportCurrentPage] = useState(1);
  const [reportsPerPage] = useState(5);
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
  const [templateCurrentPage, setTemplateCurrentPage] = useState(1);
  const [templatesPerPage] = useState(5);
  
  // Form states
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [newsTitle, setNewsTitle] = useState("");
  const [newsContent, setNewsContent] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [templateTitle, setTemplateTitle] = useState("");
  const [templateMessage, setTemplateMessage] = useState("");
  
  // Data states
  const [users, setUsers] = useState<UserItem[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationHistory[]>([]);
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  
  // Statistics states
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [newsStats, setNewsStats] = useState<NewsStats | null>(null);
  const [reportStats, setReportStats] = useState<ReportStats | null>(null);
  const [notificationStats, setNotificationStats] = useState<NotificationStats | null>(null);
  const [templateStats, setTemplateStats] = useState<TemplateStats | null>(null);
  
  // Loading states
  const [loading, setLoading] = useState({
    users: LOADING_STATES.IDLE,
    news: LOADING_STATES.IDLE,
    reports: LOADING_STATES.IDLE,
    notifications: LOADING_STATES.IDLE,
    templates: LOADING_STATES.IDLE,
    sending: LOADING_STATES.IDLE
  });
  
  // Modal states
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showEditTemplateModal, setShowEditTemplateModal] = useState(false);
  const [showEditNewsModal, setShowEditNewsModal] = useState(false);
  const [showViewNewsModal, setShowViewNewsModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [editingTemplate, setEditingTemplate] = useState<TemplateItem | null>(null);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [viewingNews, setViewingNews] = useState<NewsItem | null>(null);
  const [deletingNews, setDeletingNews] = useState<NewsItem | null>(null);
  const [showAdminNoteModal, setShowAdminNoteModal] = useState(false);
  const [currentReport, setCurrentReport] = useState<ReportItem | null>(null);
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

  // Debounced search functions
  const debouncedUserSearch = useMemo(
    () => debounce((query: string) => {
      setUserSearchQuery(query);
      setCurrentPage(1);
    }, 300),
    []
  );

  const debouncedNewsSearch = useMemo(
    () => debounce((query: string) => {
      setNewsSearchQuery(query);
      setNewsCurrentPage(1);
    }, 300),
    []
  );

  const debouncedReportSearch = useMemo(
    () => debounce((query: string) => {
      setReportSearchQuery(query);
      setReportCurrentPage(1);
    }, 300),
    []
  );

  const debouncedHistorySearch = useMemo(
    () => debounce((query: string) => {
      setHistorySearchQuery(query);
      setHistoryCurrentPage(1);
    }, 300),
    []
  );

  const debouncedTemplateSearch = useMemo(
    () => debounce((query: string) => {
      setTemplateSearchQuery(query);
    }, 300),
    []
  );

  // Fetch users for notification
  const fetchUsers = async () => {
    try {
      setLoading(prev => ({ ...prev, users: LOADING_STATES.LOADING }));
      const response = await userApi.getUsersList({
        page: currentPage,
        limit: usersPerPage,
        search: userSearchQuery
      });
      const data = handlePaginatedResponse<UserItem>(response);
      setUsers(data.data);
      setLoading(prev => ({ ...prev, users: LOADING_STATES.SUCCESS }));
    } catch (err) {
      error(getErrorMessage(err));
      setLoading(prev => ({ ...prev, users: LOADING_STATES.ERROR }));
      setUsers([]); // Set empty array on error
    }
  };

  // Fetch news
  const fetchNews = async () => {
    try {
      setLoading(prev => ({ ...prev, news: LOADING_STATES.LOADING }));
      const response = await newsApi.getNewsList({
        page: newsCurrentPage,
        limit: newsPerPage,
        search: newsSearchQuery,
        status: newsStatusFilter !== "all" ? newsStatusFilter : undefined
      });
      const data = handlePaginatedResponse<NewsItem>(response);
      setNews(data.data);
      setLoading(prev => ({ ...prev, news: LOADING_STATES.SUCCESS }));
    } catch (err) {
      error(getErrorMessage(err));
      setLoading(prev => ({ ...prev, news: LOADING_STATES.ERROR }));
      setNews([]); // Set empty array on error
    }
  };

  // Fetch reports
  const fetchReports = async () => {
    try {
      setLoading(prev => ({ ...prev, reports: LOADING_STATES.LOADING }));
      const response = await reportApi.getReportsList({
        page: reportCurrentPage,
        limit: reportsPerPage,
        search: reportSearchQuery,
        status: reportStatusFilter !== "all" ? reportStatusFilter : undefined
      });
      const data = handlePaginatedResponse<ReportItem>(response);
      setReports(data.data);
      setLoading(prev => ({ ...prev, reports: LOADING_STATES.SUCCESS }));
    } catch (err) {
      error(getErrorMessage(err));
      setLoading(prev => ({ ...prev, reports: LOADING_STATES.ERROR }));
      setReports([]); // Set empty array on error
    }
  };

  // Fetch notification history
  const fetchNotifications = async () => {
    try {
      setLoading(prev => ({ ...prev, notifications: LOADING_STATES.LOADING }));
      const response = await notificationApi.getNotificationHistory({
        page: historyCurrentPage,
        limit: historyPerPage,
        search: historySearchQuery,
        type: historyTypeFilter !== "all" ? historyTypeFilter : undefined
      });
      const data = handlePaginatedResponse<NotificationHistory>(response);
      setNotifications(data.data);
      setLoading(prev => ({ ...prev, notifications: LOADING_STATES.SUCCESS }));
    } catch (err) {
      error(getErrorMessage(err));
      setLoading(prev => ({ ...prev, notifications: LOADING_STATES.ERROR }));
      setNotifications([]); // Set empty array on error
    }
  };

  // Fetch templates
  const fetchTemplates = async () => {
    try {
      setLoading(prev => ({ ...prev, templates: LOADING_STATES.LOADING }));
      const response = await templateApi.getTemplatesList({
        search: templateSearchQuery,
        type: templateTypeFilter !== "all" ? templateTypeFilter : undefined
      });
      const data = handlePaginatedResponse<TemplateItem>(response);
      setTemplates(data.data);
      setLoading(prev => ({ ...prev, templates: LOADING_STATES.SUCCESS }));
    } catch (err) {
      error(getErrorMessage(err));
      setLoading(prev => ({ ...prev, templates: LOADING_STATES.ERROR }));
      setTemplates([]); // Set empty array on error
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const [userStatsRes, newsStatsRes, reportStatsRes, notificationStatsRes, templateStatsRes] = await Promise.all([
        userApi.getUserStats(),
        newsApi.getNewsStats(),
        reportApi.getReportStats(),
        notificationApi.getNotificationStats(),
        templateApi.getTemplateStats()
      ]);

      setUserStats(handleApiResponse(userStatsRes));
      setNewsStats(handleApiResponse(newsStatsRes));
      setReportStats(handleApiResponse(reportStatsRes));
      setNotificationStats(handleApiResponse(notificationStatsRes));
      setTemplateStats(handleApiResponse(templateStatsRes));
    } catch (err) {
      error(getErrorMessage(err));
    }
  };

  // Load data on component mount (authentication handled by backend via cookies)
  useEffect(() => {
    fetchUsers();
    fetchNews();
    fetchReports();
    fetchNotifications();
    fetchTemplates();
    fetchStats();
  }, []);

  // Load data when filters change
  useEffect(() => {
    fetchUsers();
  }, [currentPage, userSearchQuery]);

  useEffect(() => {
    fetchNews();
  }, [newsCurrentPage, newsSearchQuery, newsStatusFilter]);

  useEffect(() => {
    fetchReports();
  }, [reportCurrentPage, reportSearchQuery, reportStatusFilter]);

  useEffect(() => {
    fetchNotifications();
  }, [historyCurrentPage, historySearchQuery, historyTypeFilter]);

  useEffect(() => {
    setTemplateCurrentPage(1); // Reset to page 1 when search/filter changes
    fetchTemplates();
  }, [templateSearchQuery, templateTypeFilter]);

  // Notification Actions
  const handleSendNotification = async (type: "all" | "specific") => {
    if (type === "specific" && selectedUsers.length === 0) {
      error("Vui lòng chọn ít nhất một người dùng");
      return;
    }
    if (!notificationTitle || !notificationMessage) {
      error("Vui lòng điền đầy đủ tiêu đề và nội dung");
      return;
    }

    try {
      setLoading(prev => ({ ...prev, sending: LOADING_STATES.LOADING }));
      
      if (type === "all") {
        await notificationApi.sendSystemNotification({
          title: notificationTitle,
          message: notificationMessage,
          type: "system"
        });
        success("Đã gửi thông báo đến tất cả người dùng");
      } else {
        await notificationApi.sendSpecificNotification({
          title: notificationTitle,
          message: notificationMessage,
          type: "personal",
          recipientIds: selectedUsers
        });
        success(`Đã gửi thông báo đến ${selectedUsers.length} người dùng`);
      }
      
      setNotificationTitle("");
      setNotificationMessage("");
      setSelectedUsers([]);
      fetchNotifications(); // Refresh notification history
      fetchStats(); // Refresh stats
    } catch (err) {
      error(getErrorMessage(err));
    } finally {
      setLoading(prev => ({ ...prev, sending: LOADING_STATES.IDLE }));
    }
  };

  const handleCreateNews = async () => {
    if (!newsTitle || !newsContent) {
      error("Vui lòng điền đầy đủ tiêu đề và nội dung");
      return;
    }

    try {
      setLoading(prev => ({ ...prev, sending: LOADING_STATES.LOADING }));
      
      await newsApi.createNews({
        title: newsTitle,
        content: newsContent,
        category: "general",
        tags: []
      });
      
      success("Đã tạo bài tin tức mới");
      setNewsTitle("");
      setNewsContent("");
      fetchNews(); // Refresh news list
      fetchStats(); // Refresh stats
    } catch (err) {
      error(getErrorMessage(err));
    } finally {
      setLoading(prev => ({ ...prev, sending: LOADING_STATES.IDLE }));
    }
  };

  const handleCreateTemplate = async () => {
    if (!templateName || !templateMessage) {
      error("Vui lòng điền đầy đủ tên và nội dung template");
      return;
    }

    try {
      setLoading(prev => ({ ...prev, sending: LOADING_STATES.LOADING }));
      
      await templateApi.createTemplate({
        name: templateName,
        title: templateTitle,
        message: templateMessage,
        type: "system"
      });
      
      success("Đã tạo template mới");
      setTemplateName("");
      setTemplateTitle("");
      setTemplateMessage("");
      fetchTemplates(); // Refresh templates list
      fetchStats(); // Refresh stats
    } catch (err) {
      error(getErrorMessage(err));
    } finally {
      setLoading(prev => ({ ...prev, sending: LOADING_STATES.IDLE }));
    }
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
  const handleEditTemplate = (template: TemplateItem) => {
    setEditingTemplate(template);
    setShowEditTemplateModal(true);
  };

  // Use Template Handler
  const handleUseTemplate = async (template: TemplateItem) => {
    try {
      await templateApi.useTemplate(template.id);
      setActiveTab("notifications");
      setNotificationTitle(template.title);
      setNotificationMessage(template.message);
      success(`Đã áp dụng template "${template.name}" vào form gửi thông báo`);
      fetchTemplates(); // Refresh templates to update usage count
    } catch (err) {
      error(getErrorMessage(err));
    }
  };

  // Update Template Handler
  const handleUpdateTemplate = async () => {
    if (editingTemplate) {
      try {
        setLoading(prev => ({ ...prev, sending: LOADING_STATES.LOADING }));
        
        await templateApi.updateTemplate(editingTemplate.id, {
          name: editingTemplate.name,
          title: editingTemplate.title,
          message: editingTemplate.message,
          type: editingTemplate.type
        });
        
        success(`Template "${editingTemplate.name}" đã được cập nhật thành công!`);
        setShowEditTemplateModal(false);
        setEditingTemplate(null);
        fetchTemplates(); // Refresh templates list
        fetchStats(); // Refresh stats
      } catch (err) {
        error(getErrorMessage(err));
      } finally {
        setLoading(prev => ({ ...prev, sending: LOADING_STATES.IDLE }));
      }
    }
  };

  // Delete Template Handler
  const handleDeleteTemplate = async (template: TemplateItem) => {
    try {
      setLoading(prev => ({ ...prev, sending: LOADING_STATES.LOADING }));
      
      await templateApi.deleteTemplate(template.id);
      
      success(`Template "${template.name}" đã được xóa thành công!`);
      fetchTemplates(); // Refresh templates list
      fetchStats(); // Refresh stats
    } catch (err) {
      error(getErrorMessage(err));
    } finally {
      setLoading(prev => ({ ...prev, sending: LOADING_STATES.IDLE }));
    }
  };

  // News CRUD Handlers
  const handleEditNews = (news: NewsItem) => {
    setEditingNews(news);
    setShowEditNewsModal(true);
  };

  const handleViewNews = (news: NewsItem) => {
    setViewingNews(news);
    setShowViewNewsModal(true);
  };

  const handleDeleteNews = (news: NewsItem) => {
    setDeletingNews(news);
    setShowDeleteConfirmModal(true);
  };

  const handleUpdateNews = async () => {
    if (editingNews) {
      try {
        setLoading(prev => ({ ...prev, sending: LOADING_STATES.LOADING }));
        
        await newsApi.updateNews(editingNews._id, {
          title: editingNews.title,
          content: editingNews.content,
          status: editingNews.status
        });
        
        success(`Tin tức "${editingNews.title}" đã được cập nhật thành công!`);
        setShowEditNewsModal(false);
        setEditingNews(null);
        fetchNews(); // Refresh news list
        fetchStats(); // Refresh stats
      } catch (err) {
        error(getErrorMessage(err));
      } finally {
        setLoading(prev => ({ ...prev, sending: LOADING_STATES.IDLE }));
      }
    }
  };

  const handleConfirmDeleteNews = async () => {
    if (deletingNews) {
      try {
        setLoading(prev => ({ ...prev, sending: LOADING_STATES.LOADING }));
        
        await newsApi.deleteNews(deletingNews._id);
        
        success(`Tin tức "${deletingNews.title}" đã được xóa thành công!`);
        setShowDeleteConfirmModal(false);
        setDeletingNews(null);
        fetchNews(); // Refresh news list
        fetchStats(); // Refresh stats
      } catch (err) {
        error(getErrorMessage(err));
      } finally {
        setLoading(prev => ({ ...prev, sending: LOADING_STATES.IDLE }));
      }
    }
  };

  // Export Handlers
  const handleExportNews = async () => {
    try {
      setLoading(prev => ({ ...prev, sending: LOADING_STATES.LOADING }));
      const response = await newsApi.exportNews('excel');
      handleExportResponse(response, 'news', 'excel');
      success("Đã xuất danh sách tin tức ra Excel");
    } catch (err) {
      error(getErrorMessage(err));
    } finally {
      setLoading(prev => ({ ...prev, sending: LOADING_STATES.IDLE }));
    }
  };

  const handleExportReports = async () => {
    try {
      setLoading(prev => ({ ...prev, sending: LOADING_STATES.LOADING }));
      const response = await reportApi.exportReports('excel');
      handleExportResponse(response, 'reports', 'excel');
      success("Đã xuất danh sách tố cáo ra Excel");
    } catch (err) {
      error(getErrorMessage(err));
    } finally {
      setLoading(prev => ({ ...prev, sending: LOADING_STATES.IDLE }));
    }
  };

  const handleExportNotifications = async () => {
    try {
      setLoading(prev => ({ ...prev, sending: LOADING_STATES.LOADING }));
      const response = await notificationApi.exportNotificationHistory('excel');
      handleExportResponse(response, 'notifications', 'excel');
      success("Đã xuất lịch sử thông báo ra Excel");
    } catch (err) {
      error(getErrorMessage(err));
    } finally {
      setLoading(prev => ({ ...prev, sending: LOADING_STATES.IDLE }));
    }
  };

  const handleExportTemplates = async () => {
    try {
      setLoading(prev => ({ ...prev, sending: LOADING_STATES.LOADING }));
      const response = await templateApi.exportTemplates('excel');
      handleExportResponse(response, 'templates', 'excel');
      success("Đã xuất danh sách template ra Excel");
    } catch (err) {
      error(getErrorMessage(err));
    } finally {
      setLoading(prev => ({ ...prev, sending: LOADING_STATES.IDLE }));
    }
  };


  const handleApproveReport = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (report) {
      setCurrentReport(report);
      setReportAction("approve");
      setAdminNote("Đã xem xét và duyệt tố cáo"); // Default note
      setShowAdminNoteModal(true);
    }
  };

  const handleRejectReport = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (report) {
      setCurrentReport(report);
      setReportAction("reject");
      setAdminNote("Không đủ bằng chứng, từ chối tố cáo"); // Default note
      setShowAdminNoteModal(true);
    }
  };

  const handleConfirmReportAction = async () => {
    if (currentReport && adminNote.trim()) {
      try {
        setLoading(prev => ({ ...prev, sending: LOADING_STATES.LOADING }));
        
        if (reportAction === "approve") {
          await reportApi.approveReport(currentReport.id, { adminNote });
        } else {
          await reportApi.rejectReport(currentReport.id, { adminNote });
        }
        
        const actionText = reportAction === "approve" ? "duyệt" : "từ chối";
        success(`Đã ${actionText} tố cáo với ghi chú: "${adminNote}"`);
        
        setShowAdminNoteModal(false);
        setCurrentReport(null);
        setAdminNote("");
        fetchReports(); // Refresh reports list
        fetchStats(); // Refresh stats
      } catch (err) {
        error(getErrorMessage(err));
      } finally {
        setLoading(prev => ({ ...prev, sending: LOADING_STATES.IDLE }));
      }
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
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user._id));
    }
  };

  // Pagination calculations (data is already paginated from API)
  const userTotalPages = Math.ceil((userStats?.total || 0) / usersPerPage);
  const newsTotalPages = Math.ceil((newsStats?.total || 0) / newsPerPage);
  const reportTotalPages = Math.ceil((reportStats?.total || 0) / reportsPerPage);
  const historyTotalPages = Math.ceil((notificationStats?.total || 0) / historyPerPage);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản Lý Nội Dung & Thông Báo</h1>
            <p className="text-gray-600">Quản lý tin tức, thông báo và xét duyệt tố cáo</p>
          </div>
          <BackendStatus />
        </div>
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
                  disabled={loading.sending === LOADING_STATES.LOADING}
                >
                  {loading.sending === LOADING_STATES.LOADING ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <SendHorizontal className="w-4 h-4 mr-2" />
                  )}
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
                      Chọn người dùng ({selectedUsers.length} đã chọn / {users.length} kết quả)
                    </Label>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={handleSelectAllUsers}
                        className="text-xs"
                        disabled={loading.users === LOADING_STATES.LOADING}
                      >
                        {selectedUsers.length === users.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Search */}
                  <div className="mb-3">
                    <Input
                      placeholder="Tìm kiếm theo tên hoặc email..."
                      onChange={(e) => debouncedUserSearch(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  
                  {/* Users List */}
                  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md p-2 space-y-2 mb-3">
                    {loading.users === LOADING_STATES.LOADING ? (
                      <div className="text-center py-4 text-gray-500">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-gray-600">Đang tải danh sách người dùng...</p>
                      </div>
                    ) : loading.users === LOADING_STATES.ERROR ? (
                      <div className="text-center py-4 text-red-500">
                        <p>Không thể tải danh sách người dùng. Vui lòng thử lại.</p>
                      </div>
                    ) : !Array.isArray(users) || users.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">
                        <p>Không tìm thấy người dùng nào.</p>
                      </div>
                    ) : (
                      <>
                        {users.map((user) => (
                          <div key={user._id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                            <Checkbox
                              id={user._id}
                              checked={selectedUsers.includes(user._id)}
                              onCheckedChange={() => handleToggleUserSelection(user._id)}
                            />
                            <Label htmlFor={user._id} className="flex items-center gap-2 flex-1 cursor-pointer">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback>{user.fullname.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <span className="text-sm text-gray-900 font-medium">{user.fullname}</span>
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
                        
                        {users.length === 0 && (
                          <div className="text-center py-4 text-gray-500">
                            <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-gray-700 font-medium">Không tìm thấy người dùng nào</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  
                  {/* Pagination */}
                  {userTotalPages > 1 && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-700 font-medium">
                        Trang {currentPage} / {userTotalPages} ({userStats?.total || 0} kết quả)
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1 || loading.users === LOADING_STATES.LOADING}
                        >
                          Trước
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setCurrentPage(prev => Math.min(userTotalPages, prev + 1))}
                          disabled={currentPage === userTotalPages || loading.users === LOADING_STATES.LOADING}
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
                  disabled={selectedUsers.length === 0 || loading.sending === LOADING_STATES.LOADING}
                >
                  {loading.sending === LOADING_STATES.LOADING ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <SendHorizontal className="w-4 h-4 mr-2" />
                  )}
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
                    <p className="text-2xl font-bold text-gray-900">{newsStats?.total || 0}</p>
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
                    <p className="text-2xl font-bold text-green-600">{newsStats?.published || 0}</p>
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
                    <p className="text-2xl font-bold text-yellow-600">{newsStats?.draft || 0}</p>
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
                    <p className="text-2xl font-bold text-blue-600">{(newsStats?.totalViews || 0).toLocaleString()}</p>
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
                    disabled={loading.sending === LOADING_STATES.LOADING}
                  >
                    {loading.sending === LOADING_STATES.LOADING ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
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
                      onChange={(e) => debouncedNewsSearch(e.target.value)}
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
                  {loading.news === LOADING_STATES.LOADING ? (
                    <div className="text-center py-12 text-gray-500">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Đang tải dữ liệu...</p>
                    </div>
                  ) : (
                    <>
                      {news.map((newsItem) => (
                        <div key={newsItem._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{newsItem.title}</h3>
                            <p className="text-sm text-gray-700 line-clamp-2 mt-1">{newsItem.content}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-700">
                              <span className="font-semibold text-gray-900">Tác giả: {typeof newsItem.author === 'object' ? newsItem.author?.fullname || 'Unknown' : newsItem.author}</span>
                              <span className="font-semibold text-gray-900">Lượt xem: {newsItem.views || 0}</span>
                              <span className="font-semibold text-gray-900">Thích: {newsItem.likes || 0}</span>
                              <span className="font-semibold text-gray-900">Bình luận: {newsItem.comments || 0}</span>
                              <Badge className="bg-blue-100 text-blue-800 text-xs font-medium">{newsItem.category || 'General'}</Badge>
                              <span className="font-semibold text-gray-900">Cập nhật: {formatTimeAgo(newsItem.updatedAt)}</span>
                            </div>
                            <div className="flex gap-1 mt-2">
                              {newsItem.tags && newsItem.tags.length > 0 ? (
                                newsItem.tags.map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs text-gray-800 border-gray-400">
                                    #{tag}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-xs text-gray-500">Chưa có tags</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={newsItem.status === "published" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                              {newsItem.status === "published" ? "Đã xuất bản" : "Bản nháp"}
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditNews(newsItem)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Chỉnh sửa
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleViewNews(newsItem)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Xem
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => handleDeleteNews(newsItem)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Xóa
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                      
                      {news.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                          <Newspaper className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-semibold text-gray-800">Không tìm thấy tin tức nào</p>
                          <p className="text-sm text-gray-600">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
                
                {/* Pagination */}
                {newsTotalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-gray-800 font-semibold">
                      Trang {newsCurrentPage} / {newsTotalPages} ({newsStats?.total || 0} kết quả)
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setNewsCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={newsCurrentPage === 1 || loading.news === LOADING_STATES.LOADING}
                      >
                        Trước
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setNewsCurrentPage(prev => Math.min(newsTotalPages, prev + 1))}
                        disabled={newsCurrentPage === newsTotalPages || loading.news === LOADING_STATES.LOADING}
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
                    <p className="text-2xl font-bold text-gray-900">{reportStats?.total || 0}</p>
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
                    <p className="text-2xl font-bold text-yellow-600">{reportStats?.pending || 0}</p>
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
                    <p className="text-2xl font-bold text-green-600">{reportStats?.approved || 0}</p>
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
                    <p className="text-2xl font-bold text-red-600">{reportStats?.rejected || 0}</p>
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
                    <p className="text-2xl font-bold text-purple-600">{reportStats?.highPriority || 0}</p>
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
                    onChange={(e) => debouncedReportSearch(e.target.value)}
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
                  {loading.reports === LOADING_STATES.LOADING ? (
                    <div className="text-center py-12 text-gray-500">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Đang tải danh sách tố cáo...</p>
                    </div>
                  ) : (
                    <>
                      {reports.map((report) => (
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
                                  disabled={loading.sending === LOADING_STATES.LOADING}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Duyệt
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="border-red-300 text-red-600 hover:bg-red-50"
                                  onClick={() => handleRejectReport(report.id)}
                                  disabled={loading.sending === LOADING_STATES.LOADING}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Từ chối
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {reports.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                          <Flag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-semibold text-gray-800">Không tìm thấy tố cáo nào</p>
                          <p className="text-sm text-gray-600">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              
              {/* Pagination */}
              {reportTotalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-gray-800 font-semibold">
                    Trang {reportCurrentPage} / {reportTotalPages} ({reportStats?.total || 0} kết quả)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setReportCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={reportCurrentPage === 1 || loading.reports === LOADING_STATES.LOADING}
                    >
                      Trước
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setReportCurrentPage(prev => Math.min(reportTotalPages, prev + 1))}
                      disabled={reportCurrentPage === reportTotalPages || loading.reports === LOADING_STATES.LOADING}
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
                    <p className="text-2xl font-bold text-gray-900">{notificationStats?.total || 0}</p>
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
                    <p className="text-2xl font-bold text-blue-600">{notificationStats?.system || 0}</p>
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
                    <p className="text-2xl font-bold text-green-600">{notificationStats?.personal || 0}</p>
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
                    <p className="text-2xl font-bold text-purple-600">{(notificationStats?.totalRecipients || 0).toLocaleString()}</p>
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
                    onChange={(e) => debouncedHistorySearch(e.target.value)}
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
                {loading.notifications === LOADING_STATES.LOADING ? (
                  <div className="text-center py-12 text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải lịch sử thông báo...</p>
                  </div>
                ) : (
                  <>
                    {notifications.map((notification) => (
                      <div key={notification._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
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
                    
                    {notifications.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-semibold text-gray-800">Không tìm thấy thông báo nào</p>
                        <p className="text-sm text-gray-600">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                      </div>
                    )}
                  </>
                )}
              </div>
              
              {/* Pagination */}
              {historyTotalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-gray-800 font-semibold">
                    Trang {historyCurrentPage} / {historyTotalPages} ({notificationStats?.total || 0} kết quả)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setHistoryCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={historyCurrentPage === 1 || loading.notifications === LOADING_STATES.LOADING}
                    >
                      Trước
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setHistoryCurrentPage(prev => Math.min(historyTotalPages, prev + 1))}
                      disabled={historyCurrentPage === historyTotalPages || loading.notifications === LOADING_STATES.LOADING}
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
                    <p className="text-2xl font-bold text-gray-900">{templateStats?.total || 0}</p>
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
                    <p className="text-2xl font-bold text-blue-600">{templateStats?.system || 0}</p>
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
                    <p className="text-2xl font-bold text-green-600">{templateStats?.personal || 0}</p>
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
                    <p className="text-2xl font-bold text-purple-600">{templateStats?.totalUsage || 0}</p>
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
                  disabled={loading.sending === LOADING_STATES.LOADING}
                >
                  {loading.sending === LOADING_STATES.LOADING ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
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
                      onChange={(e) => debouncedTemplateSearch(e.target.value)}
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
                  {loading.templates === LOADING_STATES.LOADING ? (
                    <div className="text-center py-12 text-gray-500">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Đang tải danh sách template...</p>
                    </div>
                  ) : loading.templates === LOADING_STATES.ERROR ? (
                    <div className="text-center py-12 text-red-500">
                      <p>Không thể tải danh sách template. Vui lòng thử lại.</p>
                    </div>
                  ) : templates.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-semibold text-gray-800">Không tìm thấy template nào</p>
                      <p className="text-sm text-gray-600">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                    </div>
                  ) : (
                    <>
                      {templates
                        .slice((templateCurrentPage - 1) * templatesPerPage, templateCurrentPage * templatesPerPage)
                        .map((template) => (
                        <div key={template._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{template.name}</h3>
                            <p className="text-sm font-medium text-blue-600 mt-1">{template.title}</p>
                            <p className="text-sm text-gray-700 line-clamp-2 mt-1">{template.message}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-700">
                              <Badge className="bg-blue-100 text-blue-800 font-medium">{template.type}</Badge>
                              <span className="font-semibold text-gray-900">Sử dụng: {template.usageCount || 0} lần</span>
                              <span className="font-semibold text-gray-900">Tạo: {formatTimeAgo(template.createdAt)}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEditTemplate(template)}
                              disabled={loading.sending === LOADING_STATES.LOADING}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Sửa
                            </Button>
                            <Button 
                              size="sm" 
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                              onClick={() => handleUseTemplate(template)}
                              disabled={loading.sending === LOADING_STATES.LOADING}
                            >
                              <SendHorizontal className="w-4 h-4 mr-1" />
                              Sử dụng
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-red-600 hover:bg-red-50"
                              onClick={() => handleDeleteTemplate(template)}
                              disabled={loading.sending === LOADING_STATES.LOADING}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      {/* Pagination */}
                      {templates.length > templatesPerPage && (
                        <div className="flex items-center justify-between pt-4 border-t">
                          <p className="text-sm text-gray-600">
                            Trang {templateCurrentPage} / {Math.ceil(templates.length / templatesPerPage)} 
                            <span className="ml-2 text-gray-500">
                              ({templates.length} templates)
                            </span>
                          </p>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setTemplateCurrentPage(prev => Math.max(1, prev - 1))}
                              disabled={templateCurrentPage === 1}
                            >
                              Trước
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setTemplateCurrentPage(prev => Math.min(Math.ceil(templates.length / templatesPerPage), prev + 1))}
                              disabled={templateCurrentPage === Math.ceil(templates.length / templatesPerPage)}
                            >
                              Sau
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
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
              disabled={loading.sending === LOADING_STATES.LOADING}
            >
              {loading.sending === LOADING_STATES.LOADING ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : null}
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
              disabled={loading.sending === LOADING_STATES.LOADING}
            >
              {loading.sending === LOADING_STATES.LOADING ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : null}
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
              disabled={loading.sending === LOADING_STATES.LOADING}
            >
              {loading.sending === LOADING_STATES.LOADING ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : null}
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
              disabled={loading.sending === LOADING_STATES.LOADING}
            >
              {loading.sending === LOADING_STATES.LOADING ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : null}
              {reportAction === "approve" ? "Duyệt tố cáo" : "Từ chối tố cáo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}