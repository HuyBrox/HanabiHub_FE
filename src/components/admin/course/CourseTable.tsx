"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, BookOpen, Users, Clock } from "lucide-react";
import { useGetAllCoursesQuery, Course } from "@/store/services/courseApi";
import styles from "./CourseTable.module.css";

const CourseCard = ({ course }: { course: Course }) => {
  const router = useRouter();

  const handleViewDetails = () => {
    router.push(`/admin/courses/${course._id}`);
  };

  return (
    <motion.div
      className={styles.courseCard}
      whileHover={{ y: -8, transition: { type: "spring", stiffness: 300 } }}
    >
      <div className={styles.imageWrapper}>
        <Image
          src={course.thumbnail || "https://i.postimg.cc/LXt5Hbnf/image.png"}
          alt={course.title}
          fill
          className={styles.courseImage}
        />
        <div className={styles.overlay}></div>
        <div className={styles.price}>
          {course.price === 0
            ? "Miễn phí"
            : `${course.price.toLocaleString()} ₫`}
        </div>
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{course.title}</h3>
        <p className={styles.description}>
          {course.description.length > 80
            ? `${course.description.substring(0, 80)}...`
            : course.description}
        </p>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <BookOpen className={styles.statIcon} />
            <span>{course.lessons?.length || 0} bài</span>
          </div>
          <div className={styles.stat}>
            <Users className={styles.statIcon} />
            <span>
              {course.studentCount || course.students?.length || 0} HV
            </span>
          </div>
        </div>

        {course.instructor && (
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
            <span className={styles.instructorName}>
              {course.instructor.fullname}
            </span>
          </div>
        )}

        <button onClick={handleViewDetails} className={styles.viewButton}>
          <Eye className={styles.buttonIcon} />
          Xem chi tiết
        </button>
      </div>
    </motion.div>
  );
};

export default function CourseTable() {
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragConstraint, setDragConstraint] = useState(0);

  // Sử dụng RTK Query thay vì fetch trực tiếp
  const {
    data: coursesData,
    isLoading,
    isError,
    error,
  } = useGetAllCoursesQuery({ limit: 20 });

  const courses = coursesData?.data || [];

  useEffect(() => {
    const calculateConstraints = () => {
      if (containerRef.current && trackRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const trackWidth = trackRef.current.scrollWidth;
        setDragConstraint(containerWidth - trackWidth);
      }
    };

    calculateConstraints();
    window.addEventListener("resize", calculateConstraints);

    return () => window.removeEventListener("resize", calculateConstraints);
  }, [courses]);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>Đang tải khóa học...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorText}>
          {error
            ? (error as any)?.data?.message ||
              "Không thể tải danh sách khóa học"
            : "Có lỗi xảy ra"}
        </p>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <BookOpen className={styles.emptyIcon} />
        <p className={styles.emptyText}>Chưa có khóa học nào</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <motion.div
        ref={containerRef}
        className={styles.carouselContainer}
        whileTap={{ cursor: "grabbing" }}
      >
        <motion.div
          ref={trackRef}
          className={styles.track}
          drag="x"
          dragConstraints={{
            right: 0,
            left: dragConstraint - 32,
          }}
          dragElastic={0.15}
        >
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
