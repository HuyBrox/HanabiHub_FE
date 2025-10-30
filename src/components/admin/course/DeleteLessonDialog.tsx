"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, Clock, Video } from "lucide-react";
import { useDeleteLessonMutation } from "@/store/services/courseApi";
import { useNotification } from "@/components/notification/NotificationProvider";
import styles from "./DeleteCourseDialog.module.css";

interface Lesson {
  _id: string;
  title: string;
  duration: number;
  videoUrl?: string;
}

interface DeleteLessonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lesson: Lesson;
  courseId: string;
}

export default function DeleteLessonDialog({
  isOpen,
  onClose,
  onSuccess,
  lesson,
  courseId,
}: DeleteLessonDialogProps) {
  const [deleteLesson, { isLoading: isDeleting }] = useDeleteLessonMutation();
  const [error, setError] = useState<string | null>(null);
  const { success, error: showError } = useNotification();

  const handleDelete = async () => {
    setError(null);

    try {
      await deleteLesson({ lessonId: lesson._id, courseId }).unwrap();
      success("Xóa bài học thành công!");
      // Success - notify parent and close dialog
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error("Error deleting lesson:", error);
      const errorMessage = error?.data?.message || "Đã có lỗi xảy ra khi xóa bài học";
      setError(errorMessage);
      showError(errorMessage);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.deleteDialog} onClick={handleClose}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <AlertTriangle size={24} />
          </div>
          <div className={styles.content}>
            <h2 className={styles.title}>Xác nhận xóa bài học</h2>
            <p className={styles.description}>
              Bạn có chắc chắn muốn xóa bài học này? Hành động này không thể
              hoàn tác.
            </p>
          </div>
        </div>

        <div className={styles.courseInfo}>
          <h3 className={styles.courseTitle}>{lesson.title}</h3>
          <div className={styles.courseDetails}>
            <div className={styles.detail}>
              <Clock size={16} />
              <span>{lesson.duration} phút</span>
            </div>
            {lesson.videoUrl && (
              <div className={styles.detail}>
                <Video size={16} />
                <span>Có video</span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.warning}>
          <p className={styles.warningText}>
            <strong>Chú ý:</strong> Khi xóa bài học, tất cả nội dung, video và
            tài liệu liên quan sẽ bị xóa vĩnh viễn. Học viên đang học bài này sẽ
            mất quyền truy cập.
          </p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.actions}>
          <button
            type="button"
            onClick={handleClose}
            className={styles.cancelButton}
            disabled={isDeleting}
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className={styles.deleteButton}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 size={20} className={styles.spinner} />
                Đang xóa...
              </>
            ) : (
              <>
                <AlertTriangle size={20} />
                Xóa bài học
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
