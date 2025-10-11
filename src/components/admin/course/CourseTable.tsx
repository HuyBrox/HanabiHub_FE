"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, BookOpen, Users, Clock } from "lucide-react";
import styles from "./CourseTable.module.css";

interface Lesson {
  _id: string;
  title: string;
}

interface Instructor {
  _id: string;
  fullname: string;
  username: string;
  avatar?: string;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  instructor: Instructor;
  lessons: Lesson[];
  students: string[];
  price: number;
  createdAt: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    courses: Course[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  timestamp: string;
}

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
            <span>{course.lessons.length} bài</span>
          </div>
          <div className={styles.stat}>
            <Users className={styles.statIcon} />
            <span>{course.students.length} HV</span>
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
          <span className={styles.instructorName}>
            {course.instructor.fullname}
          </span>
        </div>

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
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/courses?limit=20`,
          {
            credentials: "include",
          }
        );

        const result: ApiResponse = await response.json();

        if (result.success) {
          setCourses(result.data.courses);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError("Không thể tải danh sách khóa học");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

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

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorText}>{error}</p>
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
