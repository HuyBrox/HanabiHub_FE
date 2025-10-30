"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, BookOpen, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDeleteCourseMutation } from "@/store/services/courseApi";
import { useNotification } from "@/components/notification/NotificationProvider";
import styles from "./DeleteCourseDialog.module.css";

interface Course {
  _id: string;
  title: string;
  lessonCount: number;
  studentCount: number;
}

interface DeleteCourseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
}

export default function DeleteCourseDialog({
  isOpen,
  onClose,
  course,
}: DeleteCourseDialogProps) {
  const [deleteCourse, { isLoading: isDeleting }] = useDeleteCourseMutation();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { success, error: showError } = useNotification();

  const handleDelete = async () => {
    setError(null);

    try {
      await deleteCourse(course._id).unwrap();
      success("Xóa khóa học thành công!");
      // Success - redirect back to courses list
      router.push("/admin/courses");
    } catch (error: any) {
      console.error("Error deleting course:", error);
      const errorMessage = error?.data?.message || "Đã có lỗi xảy ra khi xóa khóa học";
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
            <h2 className={styles.title}>Xác nhận xóa khóa học</h2>
            <p className={styles.description}>
              Bạn có chắc chắn muốn xóa khóa học này? Hành động này không thể
              hoàn tác.
            </p>
          </div>
        </div>

        <div className={styles.courseInfo}>
          <h3 className={styles.courseTitle}>{course.title}</h3>
          <div className={styles.courseDetails}>
            <div className={styles.detail}>
              <BookOpen size={16} />
              <span>{course.lessonCount} bài học</span>
            </div>
            <div className={styles.detail}>
              <Users size={16} />
              <span>{course.studentCount} học viên</span>
            </div>
          </div>
        </div>

        <div className={styles.warning}>
          <p className={styles.warningText}>
            <strong>Chú ý:</strong> Khi xóa khóa học, tất cả các bài học, tài
            liệu và dữ liệu liên quan sẽ bị xóa vĩnh viễn. Học viên đã đăng ký
            khóa học này sẽ mất quyền truy cập.
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
                Xóa khóa học
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
