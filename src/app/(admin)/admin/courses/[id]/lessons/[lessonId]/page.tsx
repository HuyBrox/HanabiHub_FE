"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Loader2,
  Video,
  FileText,
  ListChecks,
  Calendar,
  Clock,
  User,
  CheckCircle
} from "lucide-react";
import { useGetLessonByIdQuery, Lesson } from "@/store/services/courseApi";
import { DeleteLessonDialog } from "@/components/admin/course";
import { useNotification } from "@/components/notification/NotificationProvider";
import styles from "./lesson-detail.module.css";

interface ApiResponse {
  success: boolean;
  message: string;
  data: Lesson;
  timestamp: string;
}

export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const lessonId = params.lessonId as string;

  const {
    data,
    isLoading,
    error: queryError,
  } = useGetLessonByIdQuery(lessonId);

  const lesson = data?.data || null;
  const error = queryError ? "Không thể tải thông tin bài học" : "";

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { success, error: showError } = useNotification();

  const handleDeleteSuccess = () => {
    router.push(`/admin/courses/${courseId}`);
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.spinner} size={48} />
        <p className={styles.loadingText}>Đang tải thông tin bài học...</p>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>
          {error || "Không tìm thấy bài học"}
        </p>
        <button
          onClick={() => router.push(`/admin/courses/${courseId}`)}
          className={styles.backButton}
        >
          <ArrowLeft size={18} />
          Quay lại khóa học
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button
          onClick={() => router.push(`/admin/courses/${courseId}`)}
          className={styles.backBtn}
        >
          <ArrowLeft size={18} />
          Quay lại
        </button>
        <div className={styles.headerActions}>
          <button
            onClick={() => router.push(`/admin/courses/${courseId}/lessons/${lessonId}/edit`)}
            className={styles.editBtn}
          >
            <Edit size={18} />
            Chỉnh sửa
          </button>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className={styles.deleteBtn}
          >
            <Trash2 size={18} />
            Xóa
          </button>
        </div>
      </div>

      {/* Type Badge */}
      <div className={styles.typeBadge}>
        {lesson.type === "video" ? (
          <>
            <Video size={16} />
            <span>Bài học Video</span>
          </>
        ) : (
          <>
            <ListChecks size={16} />
            <span>Bài tập - {lesson.taskType}</span>
          </>
        )}
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        {/* Title Section */}
        <div className={styles.titleSection}>
          <h1 className={styles.title}>{lesson.title}</h1>
          <div className={styles.meta}>
            <div className={styles.metaItem}>
              <Calendar size={16} />
              <span>{new Date(lesson.createdAt).toLocaleDateString("vi-VN")}</span>
            </div>
            <div className={styles.metaItem}>
              <User size={16} />
              <span>{lesson.userCompleted.length} người hoàn thành</span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <FileText size={20} />
            <h2>Nội dung mô tả</h2>
          </div>
          <div className={styles.sectionContent}>
            <p className={styles.description}>{lesson.content}</p>
          </div>
        </div>

        {/* Video Section */}
        {lesson.type === "video" && lesson.videoUrl && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <Video size={20} />
              <h2>Video bài học</h2>
            </div>
            <div className={styles.sectionContent}>
              <div className={styles.videoInfo}>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Loại:</span>
                  <span className={styles.value}>
                    {lesson.videoType === "youtube" ? "YouTube" : "Upload"}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>URL:</span>
                  <a
                    href={lesson.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.videoLink}
                  >
                    {lesson.videoUrl}
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Task Section */}
        {lesson.type === "task" && lesson.jsonTask && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <ListChecks size={20} />
              <h2>Nội dung bài tập</h2>
            </div>
            <div className={styles.sectionContent}>
              <div className={styles.taskInfo}>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Loại bài tập:</span>
                  <span className={styles.taskTypeBadge}>
                    {lesson.taskType === "multiple_choice" && "Trắc nghiệm"}
                    {lesson.taskType === "fill_blank" && "Điền từ"}
                    {lesson.taskType === "listening" && "Nghe hiểu"}
                    {lesson.taskType === "matching" && "Ghép cặp"}
                    {lesson.taskType === "speaking" && "Phát âm"}
                    {lesson.taskType === "reading" && "Đọc hiểu"}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Hướng dẫn:</span>
                  <span className={styles.value}>{lesson.jsonTask.instructions}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Số câu/mục:</span>
                  <span className={styles.value}>
                    {lesson.jsonTask.items?.length || 0} câu
                  </span>
                </div>
              </div>

              {/* Preview Task Items */}
              <div className={styles.taskPreview}>
                <h3>Xem trước bài tập:</h3>
                <pre className={styles.jsonPreview}>
                  {JSON.stringify(lesson.jsonTask, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Clock size={20} />
            <h2>Thông tin chi tiết</h2>
          </div>
          <div className={styles.sectionContent}>
            <div className={styles.infoGrid}>
              <div className={styles.infoCard}>
                <span className={styles.infoLabel}>Ngày tạo</span>
                <span className={styles.infoValue}>
                  {new Date(lesson.createdAt).toLocaleString("vi-VN")}
                </span>
              </div>
              <div className={styles.infoCard}>
                <span className={styles.infoLabel}>Cập nhật lần cuối</span>
                <span className={styles.infoValue}>
                  {new Date(lesson.updatedAt).toLocaleString("vi-VN")}
                </span>
              </div>
              <div className={styles.infoCard}>
                <span className={styles.infoLabel}>Người hoàn thành</span>
                <span className={styles.infoValue}>
                  {lesson.userCompleted.length} học viên
                </span>
              </div>
              <div className={styles.infoCard}>
                <span className={styles.infoLabel}>Bình luận</span>
                <span className={styles.infoValue}>
                  {lesson.Comments.length} bình luận
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      <DeleteLessonDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onSuccess={handleDeleteSuccess}
        lesson={{
          _id: lesson._id,
          title: lesson.title,
          duration: 0,
          videoUrl: lesson.videoUrl
        }}
        courseId={courseId}
      />
    </div>
  );
}
