"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { X, Upload, Loader2 } from "lucide-react";
import { useUpdateCourseMutation } from "@/store/services/courseApi";
import { useNotification } from "@/components/notification/NotificationProvider";
import styles from "./UpdateCourseModal.module.css";

interface UpdateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  course: {
    _id: string;
    title: string;
    description: string;
    price: number;
    thumbnail?: string;
  };
}

const UpdateCourseModal = ({
  isOpen,
  onClose,
  onSuccess,
  course,
}: UpdateCourseModalProps) => {
  const [updateCourse, { isLoading: isSubmitting }] = useUpdateCourseMutation();
  const { success, error: showError } = useNotification();

  const [formData, setFormData] = useState({
    title: course?.title || "",
    description: course?.description || "",
    price: course?.price || 0,
  });
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(course?.thumbnail || "");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? Number(value) : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setThumbnail(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, thumbnail: "" }));
    } else {
      setErrors((prev) => ({ ...prev, thumbnail: "Ảnh không hợp lệ" }));
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.title.trim()) newErrors.title = "Tên không được để trống";
    if (!formData.description.trim())
      newErrors.description = "Mô tả không được để trống";
    if (formData.price < 0) newErrors.price = "Giá không hợp lệ";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const form = new FormData();
      form.append("title", formData.title);
      form.append("description", formData.description);
      form.append("price", String(formData.price));
      form.append("level", "N5");
      if (thumbnail) form.append("thumbnail", thumbnail);

      await updateCourse({ id: course._id, formData: form }).unwrap();
      success("Cập nhật khóa học thành công!");
      onSuccess && onSuccess();
      handleClose();
    } catch (error: any) {
      const errorMessage = error?.data?.message || "Lỗi cập nhật";
      setErrors({
        submit: errorMessage,
      });
      showError(errorMessage);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        title: course?.title || "",
        description: course?.description || "",
        price: course?.price || 0,
      });
      setThumbnail(null);
      setPreviewUrl(course?.thumbnail || "");
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalBackdrop} onClick={handleClose}>
      <div
        className={styles.modalContainer}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Cập nhật khóa học</h2>
          <button
            className={styles.closeButton}
            onClick={handleClose}
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>
        <form className={styles.modalBody} onSubmit={handleSubmit}>
          {/* Thumbnail */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Ảnh khóa học</label>
            <div className={styles.thumbnailWrapper}>
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="thumbnail"
                  width={120}
                  height={80}
                  className={styles.thumbnail}
                />
              ) : (
                <div className={styles.thumbnailPlaceholder}>Chưa có ảnh</div>
              )}
              <button
                type="button"
                className={styles.uploadButton}
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
              >
                <Upload size={18} /> Chọn ảnh
              </button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleThumbnailChange}
              />
            </div>
            {errors.thumbnail && (
              <span className={styles.errorText}>{errors.thumbnail}</span>
            )}
          </div>

          {/* Title */}
          <div className={styles.formGroup}>
            <label htmlFor="title" className={styles.formLabel}>
              Tên khóa học <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={styles.formInput}
              disabled={isSubmitting}
            />
            {errors.title && (
              <span className={styles.errorText}>{errors.title}</span>
            )}
          </div>

          {/* Description */}
          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.formLabel}>
              Mô tả <span className={styles.required}>*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={styles.formTextarea}
              rows={4}
              disabled={isSubmitting}
            />
            {errors.description && (
              <span className={styles.errorText}>{errors.description}</span>
            )}
          </div>

          {/* Price */}
          <div className={styles.formGroup}>
            <label htmlFor="price" className={styles.formLabel}>
              Giá (VNĐ)
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className={styles.formInput}
              min="0"
              disabled={isSubmitting}
            />
            {errors.price && (
              <span className={styles.errorText}>{errors.price}</span>
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
                  <Loader2 size={20} className={styles.spinner} /> Đang cập
                  nhật...
                </>
              ) : (
                "Cập nhật"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateCourseModal;
