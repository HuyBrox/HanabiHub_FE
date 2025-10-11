"use client";

import { useState, ChangeEvent } from "react";
import { X, Loader2 } from "lucide-react";
import styles from "./CreateLessonModal.module.css";

interface CreateLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  courseId: string;
}

export default function CreateLessonModal({
  isOpen,
  onClose,
  onSuccess,
  courseId,
}: CreateLessonModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    videoUrl: "",
    duration: 0,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "duration" ? Number(value) : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = "Tên bài học không được để trống";
    } else if (formData.title.length < 3) {
      newErrors.title = "Tên bài học phải có ít nhất 3 ký tự";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Nội dung không được để trống";
    } else if (formData.content.length < 10) {
      newErrors.content = "Nội dung phải có ít nhất 10 ký tự";
    }

    if (formData.videoUrl && !isValidUrl(formData.videoUrl)) {
      newErrors.videoUrl = "URL video không hợp lệ";
    }

    if (formData.duration < 0) {
      newErrors.duration = "Thời lượng không được âm";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/courses/lesson`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            ...formData,
            courseId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Tạo bài học thất bại");
      }

      // Success - notify parent and close modal
      onSuccess();
      handleClose();
    } catch (error) {
      console.error("Error creating lesson:", error);
      setErrors({
        submit:
          error instanceof Error
            ? error.message
            : "Đã có lỗi xảy ra khi tạo bài học",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ title: "", content: "", videoUrl: "", duration: 0 });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.modalTitle}>Tạo bài học mới</h2>
          <button
            className={styles.closeButton}
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Đóng modal"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Title */}
          <div className={styles.formGroup}>
            <label htmlFor="title" className={styles.label}>
              Tên bài học <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`${styles.input} ${
                errors.title ? styles.inputError : ""
              }`}
              placeholder="Nhập tên bài học"
              disabled={isSubmitting}
            />
            {errors.title && (
              <span className={styles.errorText}>{errors.title}</span>
            )}
          </div>

          {/* Content */}
          <div className={styles.formGroup}>
            <label htmlFor="content" className={styles.label}>
              Nội dung <span className={styles.required}>*</span>
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              className={`${styles.textarea} ${
                errors.content ? styles.inputError : ""
              }`}
              placeholder="Nhập nội dung bài học"
              rows={6}
              disabled={isSubmitting}
            />
            {errors.content && (
              <span className={styles.errorText}>{errors.content}</span>
            )}
          </div>

          {/* Video URL */}
          <div className={styles.formGroup}>
            <label htmlFor="videoUrl" className={styles.label}>
              URL Video
            </label>
            <input
              type="text"
              id="videoUrl"
              name="videoUrl"
              value={formData.videoUrl}
              onChange={handleChange}
              className={`${styles.input} ${
                errors.videoUrl ? styles.inputError : ""
              }`}
              placeholder="https://youtube.com/watch?v=..."
              disabled={isSubmitting}
            />
            {errors.videoUrl && (
              <span className={styles.errorText}>{errors.videoUrl}</span>
            )}
            <span className={styles.hint}>
              Để trống nếu bài học không có video
            </span>
          </div>

          {/* Duration */}
          <div className={styles.formGroup}>
            <label htmlFor="duration" className={styles.label}>
              Thời lượng (phút)
            </label>
            <input
              type="number"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className={`${styles.input} ${
                errors.duration ? styles.inputError : ""
              }`}
              placeholder="0"
              min="0"
              disabled={isSubmitting}
            />
            {errors.duration && (
              <span className={styles.errorText}>{errors.duration}</span>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className={styles.submitError}>{errors.submit}</div>
          )}

          {/* Actions */}
          <div className={styles.actions}>
            <button
              type="button"
              onClick={handleClose}
              className={styles.cancelButton}
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className={styles.spinner} />
                  Đang tạo...
                </>
              ) : (
                "Tạo bài học"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
