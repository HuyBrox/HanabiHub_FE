"use client";

import { useState, useEffect, use } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Plus,
  BookOpen,
  Users,
  Clock,
  DollarSign,
  Calendar,
  Loader2,
  PlayCircle,
} from "lucide-react";
import {
  UpdateCourseModal,
  DeleteCourseDialog,
  DeleteLessonDialog,
} from "@/components/admin/course";
import {
  useGetCourseByIdQuery,
  Course,
  Lesson,
  Instructor,
} from "@/store/services/courseApi";
import styles from "./course-detail.module.css";

interface ApiResponse {
  success: boolean;
  message: string;
  data: Course;
  timestamp: string;
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = (params as any).id as string;

  const {
    data,
    isLoading,
    error: queryError,
    refetch,
  } = useGetCourseByIdQuery(courseId);

  const course = data?.data || null;
  const error = queryError ? "Không thể tải thông tin khóa học" : "";

  const [isNavigating, setIsNavigating] = useState(false);

  // Modal states
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeleteLessonDialog, setShowDeleteLessonDialog] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const handleUpdateSuccess = () => {
    refetch();
  };

  const handleDeleteLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setShowDeleteLessonDialog(true);
  };

  const handleNavigateToNewLesson = () => {
    setIsNavigating(true);
    router.push(`/admin/courses/${courseId}/lessons/new`);
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.spinner} />
        <p className={styles.loadingText}>Đang tải thông tin khóa học...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorText}>{error || "Không tìm thấy khóa học"}</p>
        <button
          onClick={() => router.push("/admin/courses")}
          className={styles.backButton}
        >
          <ArrowLeft className={styles.buttonIcon} />
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button
          onClick={() => router.push("/admin/courses")}
          className={styles.backBtn}
        >
          <ArrowLeft className={styles.icon} />
          Quay lại
        </button>
        <div className={styles.actions}>
          <button
            onClick={() => setShowUpdateModal(true)}
            className={styles.editBtn}
          >
            <Edit className={styles.icon} />
            Sửa khóa học
          </button>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className={styles.deleteBtn}
          >
            <Trash2 className={styles.icon} />
            Xóa khóa học
          </button>
        </div>
      </div>

      {/* Course Info */}
      <div className={styles.courseInfo}>
        <div className={styles.thumbnailWrapper}>
          <Image
            src={course.thumbnail || "https://i.postimg.cc/LXt5Hbnf/image.png"}
            alt={course.title}
            fill
            className={styles.thumbnail}
          />
        </div>

        <div className={styles.infoContent}>
          <h1 className={styles.courseTitle}>{course.title}</h1>
          <p className={styles.courseDescription}>{course.description}</p>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <BookOpen className={styles.statIcon} />
              <div>
                <p className={styles.statValue}>{course.lessons.length}</p>
                <p className={styles.statLabel}>Bài học</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <Users className={styles.statIcon} />
              <div>
                <p className={styles.statValue}>{course.students.length}</p>
                <p className={styles.statLabel}>Học viên</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <DollarSign className={styles.statIcon} />
              <div>
                <p className={styles.statValue}>
                  {course.price === 0
                    ? "Miễn phí"
                    : `${course.price.toLocaleString()} ₫`}
                </p>
                <p className={styles.statLabel}>Giá</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <Calendar className={styles.statIcon} />
              <div>
                <p className={styles.statValue}>
                  {new Date(course.createdAt).toLocaleDateString("vi-VN")}
                </p>
                <p className={styles.statLabel}>Ngày tạo</p>
              </div>
            </div>
          </div>

          <div className={styles.instructor}>
            <div className={styles.instructorAvatar}>
              {course.instructor.avatar ? (
                <Image
                  src={course.instructor.avatar}
                  alt={course.instructor.fullname}
                  fill
                  className={styles.avatar}
                />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {course.instructor.fullname.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <p className={styles.instructorLabel}>Giảng viên</p>
              <p className={styles.instructorName}>
                {course.instructor.fullname}
              </p>
              <p className={styles.instructorEmail}>
                {course.instructor.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lessons Section */}
      <div className={styles.lessonsSection}>
        <div className={styles.lessonsHeader}>
          <h2 className={styles.sectionTitle}>Danh Sách Bài Học</h2>
          <button
            onClick={handleNavigateToNewLesson}
            className={styles.addLessonBtn}
            disabled={isNavigating}
          >
            {isNavigating ? (
              <>
                <Loader2 className={styles.icon} style={{ animation: 'spin 1s linear infinite' }} />
                Đang tải...
              </>
            ) : (
              <>
                <Plus className={styles.icon} />
                Thêm bài học
              </>
            )}
          </button>
        </div>

        {course.lessons.length === 0 ? (
          <div className={styles.emptyLessons}>
            <BookOpen className={styles.emptyIcon} />
            <p className={styles.emptyText}>Chưa có bài học nào</p>
            <button
              onClick={handleNavigateToNewLesson}
              className={styles.addFirstLesson}
              disabled={isNavigating}
            >
              {isNavigating ? (
                <>
                  <Loader2 className={styles.icon} style={{ animation: 'spin 1s linear infinite' }} />
                  Đang tải...
                </>
              ) : (
                <>
                  <Plus className={styles.icon} />
                  Thêm bài học đầu tiên
                </>
              )}
            </button>
          </div>
        ) : (
          <div className={styles.lessonsList}>
            {[...course.lessons]
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((lesson, index) => (
                <div key={lesson._id} className={styles.lessonCard}>
                  <div className={styles.lessonNumber}>{index + 1}</div>
                  <div className={styles.lessonContent}>
                    <div className={styles.lessonInfo}>
                      <h3 className={styles.lessonTitle}>{lesson.title}</h3>
                      {lesson.content && (
                        <p className={styles.lessonDescription}>
                          {lesson.content.length > 100
                            ? `${lesson.content.substring(0, 100)}...`
                            : lesson.content}
                        </p>
                      )}
                      <div className={styles.lessonMeta}>
                        {lesson.videoUrl && (
                          <div className={styles.metaItem}>
                            <PlayCircle className={styles.metaIcon} />
                            <span>Video</span>
                          </div>
                        )}
                        {lesson.duration && (
                          <div className={styles.metaItem}>
                            <Clock className={styles.metaIcon} />
                            <span>{lesson.duration} phút</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={styles.lessonActions}>
                      <button
                        onClick={() =>
                          router.push(
                            `/admin/courses/${courseId}/lessons/${lesson._id}`
                          )
                        }
                        className={styles.lessonViewBtn}
                        title="Xem chi tiết"
                      >
                        <PlayCircle className={styles.icon} />
                      </button>
                      <button
                        onClick={() =>
                          router.push(
                            `/admin/courses/${courseId}/lessons/${lesson._id}/edit`
                          )
                        }
                        className={styles.lessonEditBtn}
                        title="Chỉnh sửa"
                      >
                        <Edit className={styles.icon} />
                      </button>
                      <button
                        onClick={() => handleDeleteLesson(lesson)}
                        className={styles.lessonDeleteBtn}
                        title="Xóa"
                      >
                        <Trash2 className={styles.icon} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <UpdateCourseModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onSuccess={handleUpdateSuccess}
        course={course}
      />

      <DeleteCourseDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        course={{
          _id: course._id,
          title: course.title,
          lessonCount: course.lessons.length,
          studentCount: course.studentCount,
        }}
      />

      {selectedLesson && (
        <DeleteLessonDialog
          isOpen={showDeleteLessonDialog}
          onClose={() => {
            setShowDeleteLessonDialog(false);
            setSelectedLesson(null);
          }}
          onSuccess={handleUpdateSuccess}
          lesson={{
            _id: selectedLesson._id,
            title: selectedLesson.title,
            duration: selectedLesson.duration,
            videoUrl: selectedLesson.videoUrl,
          }}
          courseId={courseId}
        />
      )}
    </div>
  );
}
