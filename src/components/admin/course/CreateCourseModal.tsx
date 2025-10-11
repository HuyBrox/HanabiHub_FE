"use client";

import { useState } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import Image from "next/image";
import { useCreateCourseMutation } from "@/store/services/courseApi";
import { useNotification } from "@/components/notification/NotificationProvider";
import styles from "./CreateCourseModal.module.css";

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateCourseModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateCourseModalProps) {
  const [createCourse, { isLoading }] = useCreateCourseMutation();
  const { success, error: showError } = useNotification();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
  });
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [error, setError] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Vui lòng chọn file ảnh");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Kích thước ảnh không được vượt quá 5MB");
        return;
      }
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.title.trim() || !formData.description.trim()) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price || "0");
      formDataToSend.append("level", "N5"); // Default level
      if (thumbnail) {
        formDataToSend.append("thumbnail", thumbnail);
      }

      const result = await createCourse(formDataToSend).unwrap();

      if (result.success) {
        success("Tạo khóa học thành công!");
        onSuccess?.();
        onClose();
        // Reset form
        setFormData({ title: "", description: "", price: "" });
        setThumbnail(null);
        setThumbnailPreview("");
      }
    } catch (err: any) {
      const errorMessage = err?.data?.message || "Không thể kết nối đến máy chủ";
      setError(errorMessage);
      showError(errorMessage);
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      {/* Backdrop */}
      <div className={styles.backdrop} onClick={onClose} />

      {/* Modal */}
      <div className={styles.modalContainer}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h2>Tạo Khóa Học Mới</h2>
            <p>Điền thông tin để tạo khóa học mới</p>
          </div>
          <button
            onClick={onClose}
            className={styles.closeButton}
            disabled={isLoading}
          >
            <X className="h-5 w-5 text-[#475569]" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Error Message */}
          {error && <div className={styles.errorMessage}>{error}</div>}

          {/* Title */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Tên khóa học <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Nhập tên khóa học..."
              className={styles.input}
              disabled={isLoading}
            />
          </div>

          {/* Description */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Mô tả <span className={styles.required}>*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Nhập mô tả khóa học..."
              rows={4}
              className={styles.textarea}
              disabled={isLoading}
            />
          </div>

          {/* Price */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Giá (VNĐ)</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              placeholder="0"
              min="0"
              className={styles.input}
              disabled={isLoading}
            />
            <p className={styles.hint}>
              Để trống hoặc nhập 0 nếu khóa học miễn phí
            </p>
          </div>

          {/* Thumbnail */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Ảnh thumbnail</label>
            <div>
              {thumbnailPreview ? (
                <div className={styles.imagePreview}>
                  <Image
                    src={thumbnailPreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setThumbnail(null);
                      setThumbnailPreview("");
                    }}
                    className={styles.removeImageButton}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className={styles.uploadArea}>
                  <div className={styles.uploadContent}>
                    <Upload className="h-12 w-12 text-[#94a3b8] mb-3" />
                    <p className={styles.uploadText}>Nhấp để tải ảnh lên</p>
                    <p className={styles.uploadHint}>
                      PNG, JPG, GIF tối đa 5MB
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={isLoading}
                    style={{ display: "none" }}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className={styles.cancelButton}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={styles.submitButton}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Đang tạo...
                </>
              ) : (
                "Tạo khóa học"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
