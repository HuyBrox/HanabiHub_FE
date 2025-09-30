"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

type Language = "en" | "vi";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

const translations = {
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.courses": "Courses",
    "nav.community": "Community",
    "nav.messages": "Messages",
    "nav.flashcards": "Flashcards",
    "nav.aiPractice": "AI Practice",
    "nav.profile": "Profile",
    "nav.login": "Login",
    "nav.logout": "Logout",
    "nav.theme": "Theme",
    "nav.videoCall": "Hanabi Studio",

    // Homepage
    "home.hero.title": "Learn Japanese Easily",
    "home.hero.subtitle":
      "Master Japanese with interactive lessons, flashcards, and AI-powered practice sessions.",
    "home.hero.cta": "Start Learning",
    "home.courses.title": "Popular Courses",
    "home.courses.hiragana.title": "Hiragana Basics",
    "home.courses.hiragana.desc":
      "Learn the fundamental Japanese writing system",
    "home.courses.katakana.title": "Katakana Mastery",
    "home.courses.katakana.desc": "Master foreign words and names in Japanese",
    "home.courses.kanji.title": "Essential Kanji",
    "home.courses.kanji.desc": "Build your kanji vocabulary step by step",
    "home.courses.enroll": "Enroll Now",
    "home.community.title": "Community Highlights",
    "home.community.viewAll": "View All Posts",
    "home.flashcards.title": "Try Flashcards",
    "home.flashcards.subtitle": "Click to flip and test your knowledge",
    "home.flashcards.front": "Front",
    "home.flashcards.back": "Back",

    // Footer
    "footer.about": "About",
    "footer.contact": "Contact",
    "footer.privacy": "Privacy",

    // Community
    "community.newPost": "What's on your mind?",
    "community.post": "Post",
    "community.trending": "Trending Topics",
    "community.suggestions": "Friend Suggestions",
    "community.studyGroups": "Study Groups",
    "community.follow": "Follow",
    "community.join": "Join",
    "community.like": "Like",
    "community.comment": "Comment",

    // Profile
    "profile.editProfile": "Edit Profile",
    "profile.overview": "Overview",
    "profile.courses": "Courses",
    "profile.achievements": "Achievements",
    "profile.settings": "Settings",
    "profile.learningProgress": "Learning Progress",
    "profile.badgesEarned": "Badges Earned",
    "profile.enrolledCourses": "Enrolled Courses",
    "profile.weeklyGoal": "Weekly Goal",
    "profile.currentStreak": "Current Streak",
    "profile.totalStudyTime": "Total Study Time",
    "profile.wordsLearned": "Words Learned",

    // Flashcards
    "flashcards.title": "Flashcards Practice",
    "flashcards.subtitle": "Click the card to reveal the answer",
    "flashcards.previous": "Previous",
    "flashcards.next": "Next",
    "flashcards.correct": "Correct",
    "flashcards.incorrect": "Incorrect",
    "flashcards.progress": "Progress",
    "flashcards.completed": "Completed",
    "flashcards.remaining": "Remaining",
    "flashcards.accuracy": "Accuracy",
  },
  vi: {
    // Navigation
    "nav.home": "Trang chủ",
    "nav.courses": "Khóa học",
    "nav.community": "Cộng đồng",
    "nav.messages": "Tin nhắn",
    "nav.flashcards": "Thẻ ghi nhớ",
    "nav.aiPractice": "Luyện tập AI",
    "nav.profile": "Hồ sơ",
    "nav.login": "Đăng nhập",
    "nav.logout": "Đăng xuất",
    "nav.theme": "Chủ đề",
    "nav.videoCall": "Hanabi thoại",

    // Homepage
    "home.hero.title": "Học tiếng Nhật dễ dàng",
    "home.hero.subtitle":
      "Thành thạo tiếng Nhật với các bài học tương tác, thẻ ghi nhớ và phiên luyện tập được hỗ trợ bởi AI.",
    "home.hero.cta": "Bắt đầu học",
    "home.courses.title": "Khóa học phổ biến",
    "home.courses.hiragana.title": "Hiragana cơ bản",
    "home.courses.hiragana.desc": "Học hệ thống chữ viết cơ bản của tiếng Nhật",
    "home.courses.katakana.title": "Thành thạo Katakana",
    "home.courses.katakana.desc":
      "Thành thạo từ ngoại lai và tên riêng trong tiếng Nhật",
    "home.courses.kanji.title": "Kanji thiết yếu",
    "home.courses.kanji.desc": "Xây dựng vốn từ vựng kanji từng bước",
    "home.courses.enroll": "Đăng ký ngay",
    "home.community.title": "Nổi bật cộng đồng",
    "home.community.viewAll": "Xem tất cả bài viết",
    "home.flashcards.title": "Thử thẻ ghi nhớ",
    "home.flashcards.subtitle": "Nhấp để lật và kiểm tra kiến thức của bạn",
    "home.flashcards.front": "Mặt trước",
    "home.flashcards.back": "Mặt sau",

    // Footer
    "footer.about": "Giới thiệu",
    "footer.contact": "Liên hệ",
    "footer.privacy": "Bảo mật",

    // Community
    "community.newPost": "Bạn đang nghĩ gì?",
    "community.post": "Đăng",
    "community.trending": "Chủ đề thịnh hành",
    "community.suggestions": "Gợi ý kết bạn",
    "community.studyGroups": "Nhóm học tập",
    "community.follow": "Theo dõi",
    "community.join": "Tham gia",
    "community.like": "Thích",
    "community.comment": "Bình luận",

    // Profile
    "profile.editProfile": "Chỉnh sửa hồ sơ",
    "profile.overview": "Tổng quan",
    "profile.courses": "Khóa học",
    "profile.achievements": "Thành tích",
    "profile.settings": "Cài đặt",
    "profile.learningProgress": "Tiến độ học tập",
    "profile.badgesEarned": "Huy hiệu đạt được",
    "profile.enrolledCourses": "Khóa học đã đăng ký",
    "profile.weeklyGoal": "Mục tiêu tuần",
    "profile.currentStreak": "Chuỗi hiện tại",
    "profile.totalStudyTime": "Tổng thời gian học",
    "profile.wordsLearned": "Từ đã học",

    // Flashcards
    "flashcards.title": "Luyện tập thẻ ghi nhớ",
    "flashcards.subtitle": "Nhấp vào thẻ để hiển thị câu trả lời",
    "flashcards.previous": "Trước",
    "flashcards.next": "Tiếp",
    "flashcards.correct": "Đúng",
    "flashcards.incorrect": "Sai",
    "flashcards.progress": "Tiến độ",
    "flashcards.completed": "Đã hoàn thành",
    "flashcards.remaining": "Còn lại",
    "flashcards.accuracy": "Độ chính xác",

    //videocall
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language;
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "vi")) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem("language", newLanguage);
  };

  const t = (key: string): string => {
    return (
      translations[language][
        key as keyof (typeof translations)[typeof language]
      ] || key
    );
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage: handleSetLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
