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
    "nav.logout": "Logout",
    "nav.theme": "Theme",
    "nav.videoCall": "Hanabi Studio",

    // Homepage
    "home.hero.title": "Learn Japanese Easily",
    "home.hero.subtitle":
      "Master Japanese with interactive lessons, flashcards, and AI-powered practice sessions.",
    "home.hero.cta": "Start Learning",
    "home.courses.title": "Popular Courses",
    "home.courses.level.beginner": "Beginner",
    "home.courses.level.intermediate": "Intermediate",
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
    "home.community.level": "Level",
    "home.community.post1": "Just passed my first JLPT practice test! The kanji flashcards really helped. Anyone else preparing for December?",
    "home.community.post2": "Pro tip: When learning new vocabulary, try to use it in sentences immediately. Context makes everything stick better!",
    "home.community.post3": "Finally memorized all hiragana! The spaced repetition system here is amazing. Moving on to katakana next week.",
    "home.flashcards.title": "Try Flashcards",
    "home.flashcards.subtitle": "Click to flip and test your knowledge",
    "home.flashcards.front": "Front",
    "home.flashcards.back": "Back",
    // Extra home/flashcards keys
    "home.community.join": "Join the Community",
    "home.flashcards.click": "Click to flip",
    "flashcards.start": "Start Practicing",
    "home.flashcards.water": "water",

    // Footer
    "footer.about": "About",
    "footer.contact": "Contact",
    "footer.privacy": "Privacy",
    "footer.copyright": "© 2024 JapanLearn. All rights reserved. Made with ❤️ for Japanese learners.",

    // Courses
    "courses.hero.title": "Discover Japanese Courses",
    "courses.hero.subtitle": "From beginner to advanced, find the perfect course for your Japanese learning journey",
    "courses.searchPlaceholder": "Search courses...",
    "courses.filters": "Filters:",
    "courses.popular": "Popular",
    "courses.viewCourse": "View Course",
    "courses.results.showing": "Showing",
    "courses.results.of": "of",
    "courses.results.courses": "courses",
    "courses.lessons": "lessons",
    "courses.instructor": "Instructor:",
    "courses.categories.all": "All",
    "courses.categories.writingSystem": "Writing System",
    "courses.categories.grammar": "Grammar",
    "courses.categories.speaking": "Speaking",
    "courses.categories.business": "Business",
    "courses.categories.culture": "Culture",
    "courses.levels.all": "All",
    "courses.levels.beginner": "Beginner",
    "courses.levels.intermediate": "Intermediate",
    "courses.levels.advanced": "Advanced",
    "courses.empty.title": "No courses found",
    "courses.empty.subtitle": "Try adjusting your search or filter criteria",

    // Courses items (Home/Courses)
    "courses.items.1.title": "Hiragana Mastery",
    "courses.items.1.description": "Master all 46 hiragana characters with interactive exercises and mnemonics",
    "courses.items.1.level": "Beginner",
    "courses.items.1.duration": "2 weeks",
    "courses.items.1.price": "Free",
    "courses.items.1.category": "Writing System",

    "courses.items.2.title": "Katakana Essentials",
    "courses.items.2.description": "Learn katakana characters used for foreign words and modern Japanese",
    "courses.items.2.level": "Beginner",
    "courses.items.2.duration": "2 weeks",
    "courses.items.2.price": "$29",
    "courses.items.2.category": "Writing System",

    "courses.items.3.title": "Essential Kanji",
    "courses.items.3.description": "Start your kanji journey with the most common 100 characters",
    "courses.items.3.level": "Intermediate",
    "courses.items.3.duration": "4 weeks",
    "courses.items.3.price": "$49",
    "courses.items.3.category": "Writing System",

    "courses.items.4.title": "JLPT N5 Grammar",
    "courses.items.4.description": "Complete grammar course for JLPT N5 level with practice tests",
    "courses.items.4.level": "Beginner",
    "courses.items.4.duration": "6 weeks",
    "courses.items.4.price": "$79",
    "courses.items.4.category": "Grammar",

    "courses.items.5.title": "Business Japanese",
    "courses.items.5.description": "Professional Japanese for workplace communication and meetings",
    "courses.items.5.level": "Advanced",
    "courses.items.5.duration": "8 weeks",
    "courses.items.5.price": "$129",
    "courses.items.5.category": "Business",

    "courses.items.6.title": "Japanese Conversation",
    "courses.items.6.description": "Practice speaking with native speakers and build confidence",
    "courses.items.6.level": "Intermediate",
    "courses.items.6.duration": "5 weeks",
    "courses.items.6.price": "$89",
    "courses.items.6.category": "Speaking",

    // Community
    "community.create.placeholder": "Share your Japanese learning journey...",
    "community.photo": "Photo",
    "community.post": "Post",
    "community.trendingTopics": "Trending Topics",
    "community.peopleToFollow": "People to Follow",
    "community.studyGroups": "Study Groups",
    "community.joinGroup": "Join Group",
    "community.follow": "Follow",
    "community.posts": "posts",
    "community.level": "Level",
    "community.share": "Share",
    "common.you": "You",
    // Community study groups
    "community.groups.n3.title": "JLPT N3 Study Group",
    "community.groups.n3.subtitle": "124 members • Daily practice",
    "community.groups.kanji.title": "Kanji Masters",
    "community.groups.kanji.subtitle": "89 members • Advanced learners",
    "community.groups.anime.title": "Anime Japanese Club",
    "community.groups.anime.subtitle": "256 members • Learn through anime",
    // Community posts (feed examples)
    "community.posts.1.content": "Just passed my first JLPT practice test! The kanji flashcards really helped. Anyone else preparing for December?",
    "community.posts.2.content": "Pro tip: When learning new vocabulary, try to use it in sentences immediately. Context makes everything stick better! Here's my study setup:",
    "community.posts.3.content": "Finally memorized all hiragana! The spaced repetition system here is amazing. Moving on to katakana next week.",
    "community.posts.4.content": "Today I learned that 雨 (rain) + 雲 (cloud) doesn't make a compound word, but 雨雲 (rain cloud) does exist! Japanese is fascinating. What's your favorite kanji discovery?",
    "community.posts.5.content": "Started learning Kansai dialect and it's so different from standard Japanese! だんだん instead of ありがとう is my new favorite. Anyone else studying dialects?",
    "community.time.2h": "2 hours ago",
    "community.time.4h": "4 hours ago",
    "community.time.6h": "6 hours ago",
    "community.time.8h": "8 hours ago",
    "community.time.12h": "12 hours ago",

    // Messages
    "messages.inbox.title": "Messages",
    "messages.inbox.pending": "Pending requests",
    "messages.searchPlaceholder": "Search",
    "messages.status.online": "Active now",
    "messages.status.offline": "Inactive",
    "messages.input.placeholder": "Aa",
    "messages.empty.title": "Your messages",
    "messages.empty.subtitle": "Send photos and private messages to friends or groups",
    "messages.empty.cta": "Send message",

    // Network indicator
    "network.noConnection": "No Connection",
    "network.excellent": "Excellent",
    "network.good": "Good",
    "network.fair": "Fair",
    "network.poor": "Poor",
    "network.sr": "Network connection: {status}, {bars} out of 5 bars",

    // Level selector
    "levels.title": "Japanese Level",
    "levels.subtitle": "Select your proficiency level",
    "levels.placeholder": "Choose your level",
    "levels.N5.name": "Beginner",
    "levels.N5.desc": "Basic greetings and simple phrases",
    "levels.N4.name": "Elementary",
    "levels.N4.desc": "Daily conversations and basic grammar",
    "levels.N3.name": "Intermediate",
    "levels.N3.desc": "Complex topics and detailed discussions",
    "levels.N2.name": "Upper Intermediate",
    "levels.N2.desc": "Abstract topics and nuanced expressions",
    "levels.N1.name": "Advanced",
    "levels.N1.desc": "Native-level fluency and complex texts",
    "community.mutualFriends": "mutual friends",

    // Flashcards page
    "flashcards.practiceTitle": "Flashcards Practice",
    "flashcards.masterSubtitle": "Master Japanese characters and vocabulary",
    "flashcards.clickToReveal": "Click to reveal",
    "flashcards.didYouGetItRight": "Did you get it right?",
    "flashcards.previous": "Previous",
    "flashcards.next": "Next",
    "flashcards.incorrect": "Incorrect",
    "flashcards.correct": "Correct",
    "flashcards.reset": "Reset Progress",
    "flashcards.learningProgress": "Learning Progress",
    "flashcards.cardsStudied": "Cards Studied",
    "flashcards.correctAnswers": "Correct Answers",
    "flashcards.accuracyRate": "Accuracy Rate",
    "flashcards.completePercent": "% Complete",
    "flashcards.keyboardHelp": "Use Space to flip • ← Previous • → Next",

    // Call / Random
    "call.random.title": "Random Japanese Call",
    "call.random.subtitle": "Practice Japanese with native speakers",
    "call.random.ready": "Ready to Practice Japanese?",
    "call.random.connecting": "Connecting...",
    "call.random.finding": "Finding a Japanese speaker for you",
    "call.random.start": "Start Random Call",
    "call.random.waiting": "Waiting...",
    "call.random.connect": "Connect with a native speaker at {level} level",

    // Video frame
    "video.cameraOff": "Camera is off",
    "video.cameraReady": "Camera ready",
    "video.waitingConnection": "Waiting for connection...",
    "video.you": "You",

    // Course details
    "courses.items.1.title": "Hiragana Mastery",
    "courses.items.1.description": "Master all 46 hiragana characters with interactive exercises and mnemonics",
    "courses.items.1.duration": "2 weeks",
    "courses.items.1.price": "Free",
    "courses.items.2.title": "Katakana Essentials", 
    "courses.items.2.description": "Learn katakana characters used for foreign words and modern Japanese",
    "courses.items.2.duration": "2 weeks",
    "courses.items.2.price": "$29",
    "courses.items.3.title": "Essential Kanji",
    "courses.items.3.description": "Start your kanji journey with the most common 100 characters",
    "courses.items.3.duration": "4 weeks", 
    "courses.items.3.price": "$49",
    "courses.items.4.title": "JLPT N5 Grammar",
    "courses.items.4.description": "Complete grammar course for JLPT N5 level with practice tests",
    "courses.items.4.duration": "6 weeks",
    "courses.items.4.price": "$79",
    "courses.items.5.title": "Business Japanese",
    "courses.items.5.description": "Professional Japanese for workplace communication and meetings",
    "courses.items.5.duration": "8 weeks",
    "courses.items.5.price": "$129",
    "courses.items.6.title": "Japanese Conversation",
    "courses.items.6.description": "Practice speaking with native speakers and build confidence",
    "courses.items.6.duration": "5 weeks",
    "courses.items.6.price": "$89",

    // Profile
    "profile.editProfile": "Edit Profile",
    "profile.overview": "Overview",
    "profile.courses": "Courses",
    "profile.achievements": "Achievements",
    "profile.progress": "Progress",
    "profile.settings": "Settings",
    "profile.learningProgress": "Learning Progress",
    "profile.badgesEarned": "Badges Earned",
    "profile.enrolledCourses": "Enrolled Courses",
    "profile.enrolledCourses.subtitle": "Track your progress across all courses",
    "profile.weeklyGoal": "Weekly Goal",
    "profile.currentStreak": "Current Streak",
    "profile.totalStudyTime": "Total Study Time",
    "profile.wordsLearned": "Words Learned",
    "profile.kanjiMastered": "Kanji Mastered",
    "profile.lessonsCompleted": "Lessons Completed",
    "profile.dayStreakLabel": "Day Streak",
    "profile.dayStreakSuffix": "day streak",
    "profile.joined": "Joined {date}",
    "profile.studiedHours": "{hours}h studied",
    "profile.thisWeekStudyTime": "This Week's Study Time",
    "profile.recentAchievements": "Recent Achievements",
    "profile.earned": "Earned",
    "profile.achievementsAndBadges": "Achievements & Badges",
    "profile.achievements.subtitle": "Your learning milestones and accomplishments",
    "profile.learningGoals": "Learning Goals",
    "profile.goal.jlptN3": "JLPT N3 Preparation",
    "profile.goal.dailyStudy": "Daily Study Goal ({hours}h)",
    "profile.goal.monthlyKanjiTarget": "Monthly Kanji Target ({count})",
    "profile.studyInsights": "Study Insights",
    "profile.mostActiveDay": "Most active day",
    "profile.averageSession": "Average session",
    "profile.avgSession.45min": "45 minutes",
    "profile.favoriteCategory": "Favorite category",
    "profile.kanji": "Kanji",
    "profile.nextMilestone": "Next milestone",
    "profile.milestone.100kanji": "100 Kanji",

    // Achievement titles
    "achievements.firstSteps": "First Steps",
    "achievements.hiraganaMaster": "Hiragana Master",
    "achievements.studyStreak": "Study Streak",
    "achievements.kanjiCollector": "Kanji Collector",
    "achievements.communityHelper": "Community Helper",
    "achievements.jlptReady": "JLPT Ready",

    // Common
    "common.progress": "Progress",
    "common.completed": "Completed",
    "common.inProgress": "In Progress",

    // Days
    "days.Mon": "Mon",
    "days.Tue": "Tue", 
    "days.Wed": "Wed",
    "days.Thu": "Thu",
    "days.Fri": "Fri",
    "days.Sat": "Sat",
    "days.Sun": "Sun",

    // Flashcards (legacy keys retained as needed by other pages)
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
    "nav.logout": "Đăng xuất",
    "nav.theme": "Chủ đề",
    "nav.videoCall": "Hanabi thoại",

    // Homepage
    "home.hero.title": "Học tiếng Nhật dễ dàng",
    "home.hero.subtitle":
      "Thành thạo tiếng Nhật với các bài học tương tác, thẻ ghi nhớ và phiên luyện tập được hỗ trợ bởi AI.",
    "home.hero.cta": "Bắt đầu học",
    "home.courses.title": "Khóa học phổ biến",
    "home.courses.level.beginner": "Sơ cấp",
    "home.courses.level.intermediate": "Trung cấp",
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
    "home.community.level": "Cấp độ",
    "home.community.post1": "Vừa vượt qua bài thi JLPT thử đầu tiên! Thẻ kanji hỗ trợ rất nhiều. Có ai đang chuẩn bị cho tháng 12 không?",
    "home.community.post2": "Mẹo nhỏ: Khi học từ mới, hãy thử dùng ngay trong câu. Ngữ cảnh giúp ghi nhớ tốt hơn!",
    "home.community.post3": "Cuối cùng cũng đã thuộc hết hiragana! Hệ thống lặp lại ngắt quãng ở đây rất tuyệt. Tuần sau chuyển sang katakana thôi.",
    "home.flashcards.title": "Thử thẻ ghi nhớ",
    "home.flashcards.subtitle": "Nhấp để lật và kiểm tra kiến thức của bạn",
    "home.flashcards.front": "Mặt trước",
    "home.flashcards.back": "Mặt sau",
    // Extra home/flashcards keys
    "home.community.join": "Tham gia cộng đồng",
    "home.flashcards.click": "Nhấp để lật",
    "flashcards.start": "Bắt đầu luyện tập",
    "home.flashcards.water": "nước",

    // Footer
    "footer.about": "Giới thiệu",
    "footer.contact": "Liên hệ",
    "footer.privacy": "Bảo mật",
    "footer.copyright": "© 2024 JapanLearn. Bản quyền đã được bảo lưu. Được tạo với ❤️ cho người học tiếng Nhật.",

    // Courses
    "courses.hero.title": "Khám phá các khóa học tiếng Nhật",
    "courses.hero.subtitle": "Từ sơ cấp đến nâng cao, tìm khóa học phù hợp cho hành trình học tiếng Nhật của bạn",
    "courses.searchPlaceholder": "Tìm kiếm khóa học...",
    "courses.filters": "Bộ lọc:",
    "courses.popular": "Phổ biến",
    "courses.viewCourse": "Xem khóa học",
    "courses.results.showing": "Hiển thị",
    "courses.results.of": "trong",
    "courses.results.courses": "khóa học",
    "courses.lessons": "bài học",
    "courses.instructor": "Giảng viên:",
    "courses.categories.all": "Tất cả",
    "courses.categories.writingSystem": "Hệ chữ viết",
    "courses.categories.grammar": "Ngữ pháp",
    "courses.categories.speaking": "Nói",
    "courses.categories.business": "Kinh doanh",
    "courses.categories.culture": "Văn hoá",
    "courses.levels.all": "Tất cả",
    "courses.levels.beginner": "Sơ cấp",
    "courses.levels.intermediate": "Trung cấp",
    "courses.levels.advanced": "Cao cấp",
    "courses.empty.title": "Không tìm thấy khóa học",
    "courses.empty.subtitle": "Hãy thử điều chỉnh từ khóa hoặc bộ lọc",

    // Courses items (Home/Courses)
    "courses.items.1.title": "Làm chủ Hiragana",
    "courses.items.1.description": "Thành thạo 46 chữ hiragana với bài tập tương tác và phương pháp ghi nhớ",
    "courses.items.1.level": "Sơ cấp",
    "courses.items.1.duration": "2 tuần",
    "courses.items.1.price": "Miễn phí",
    "courses.items.1.category": "Hệ chữ viết",

    "courses.items.2.title": "Katakana thiết yếu",
    "courses.items.2.description": "Học chữ katakana dùng cho từ mượn và tiếng Nhật hiện đại",
    "courses.items.2.level": "Sơ cấp",
    "courses.items.2.duration": "2 tuần",
    "courses.items.2.price": "$29",
    "courses.items.2.category": "Hệ chữ viết",

    "courses.items.3.title": "Kanji cơ bản",
    "courses.items.3.description": "Bắt đầu hành trình kanji với 100 chữ thông dụng nhất",
    "courses.items.3.level": "Trung cấp",
    "courses.items.3.duration": "4 tuần",
    "courses.items.3.price": "$49",
    "courses.items.3.category": "Hệ chữ viết",

    "courses.items.4.title": "Ngữ pháp JLPT N5",
    "courses.items.4.description": "Khóa ngữ pháp đầy đủ cho JLPT N5 kèm bài kiểm tra",
    "courses.items.4.level": "Sơ cấp",
    "courses.items.4.duration": "6 tuần",
    "courses.items.4.price": "$79",
    "courses.items.4.category": "Ngữ pháp",

    "courses.items.5.title": "Tiếng Nhật kinh doanh",
    "courses.items.5.description": "Tiếng Nhật chuyên nghiệp cho giao tiếp và cuộc họp tại nơi làm việc",
    "courses.items.5.level": "Cao cấp",
    "courses.items.5.duration": "8 tuần",
    "courses.items.5.price": "$129",
    "courses.items.5.category": "Kinh doanh",

    "courses.items.6.title": "Hội thoại tiếng Nhật",
    "courses.items.6.description": "Luyện nói với người bản xứ và xây dựng tự tin",
    "courses.items.6.level": "Trung cấp",
    "courses.items.6.duration": "5 tuần",
    "courses.items.6.price": "$89",
    "courses.items.6.category": "Nói",

    // Community
    "community.create.placeholder": "Chia sẻ hành trình học tiếng Nhật của bạn...",
    "community.photo": "Ảnh",
    "community.post": "Đăng",
    "community.trendingTopics": "Chủ đề thịnh hành",
    "community.peopleToFollow": "Gợi ý theo dõi",
    "community.studyGroups": "Nhóm học tập",
    "community.joinGroup": "Tham gia nhóm",
    "community.follow": "Theo dõi",
    "community.posts": "bài viết",
    "community.level": "Cấp độ",
    "community.share": "Chia sẻ",
    "common.you": "Bạn",
    // Community study groups
    "community.groups.n3.title": "Nhóm học JLPT N3",
    "community.groups.n3.subtitle": "124 thành viên • Luyện tập hằng ngày",
    "community.groups.kanji.title": "Cao thủ Kanji",
    "community.groups.kanji.subtitle": "89 thành viên • Học viên nâng cao",
    "community.groups.anime.title": "Câu lạc bộ tiếng Nhật qua Anime",
    "community.groups.anime.subtitle": "256 thành viên • Học qua anime",
    // Community posts (feed examples)
    "community.posts.1.content": "Vừa vượt qua bài thi JLPT thử đầu tiên! Thẻ kanji giúp rất nhiều. Có ai đang chuẩn bị cho tháng 12 không?",
    "community.posts.2.content": "Mẹo nhỏ: Khi học từ mới, hãy dùng ngay trong câu. Ngữ cảnh giúp ghi nhớ tốt hơn! Đây là góc học tập của mình:",
    "community.posts.3.content": "Cuối cùng đã thuộc hết hiragana! Hệ thống lặp lại ngắt quãng ở đây rất tuyệt. Tuần sau chuyển sang katakana.",
    "community.posts.4.content": "Hôm nay mình học được rằng 雨 (mưa) + 雲 (mây) không tạo thành từ ghép, nhưng 雨雲 (mây mưa) thì có! Tiếng Nhật thật thú vị. Khám phá kanji bạn thích nhất là gì?",
    "community.posts.5.content": "Bắt đầu học tiếng Kansai và nó khác tiếng Nhật chuẩn nhiều quá! だんだん thay cho ありがとう là yêu thích mới của mình. Có ai học phương ngữ không?",
    "community.time.2h": "2 giờ trước",
    "community.time.4h": "4 giờ trước",
    "community.time.6h": "6 giờ trước",
    "community.time.8h": "8 giờ trước",
    "community.time.12h": "12 giờ trước",

    // Messages
    "messages.inbox.title": "Tin nhắn",
    "messages.inbox.pending": "Tin nhắn đang chờ",
    "messages.searchPlaceholder": "Tìm kiếm",
    "messages.status.online": "Đang hoạt động",
    "messages.status.offline": "Không hoạt động",
    "messages.input.placeholder": "Aa",
    "messages.empty.title": "Tin nhắn của bạn",
    "messages.empty.subtitle": "Gửi ảnh và tin nhắn riêng tư cho bạn bè hoặc nhóm",
    "messages.empty.cta": "Gửi tin nhắn",

    // Network indicator
    "network.noConnection": "Mất kết nối",
    "network.excellent": "Rất tốt",
    "network.good": "Tốt",
    "network.fair": "Trung bình",
    "network.poor": "Kém",
    "network.sr": "Kết nối mạng: {status}, {bars} trên 5 vạch",

    // Level selector
    "levels.title": "Trình độ tiếng Nhật",
    "levels.subtitle": "Chọn trình độ hiện tại của bạn",
    "levels.placeholder": "Chọn trình độ",
    "levels.N5.name": "Sơ cấp",
    "levels.N5.desc": "Chào hỏi cơ bản và câu đơn giản",
    "levels.N4.name": "Sơ trung cấp",
    "levels.N4.desc": "Hội thoại hằng ngày và ngữ pháp cơ bản",
    "levels.N3.name": "Trung cấp",
    "levels.N3.desc": "Chủ đề phức tạp và thảo luận chi tiết",
    "levels.N2.name": "Trung cao cấp",
    "levels.N2.desc": "Chủ đề trừu tượng và sắc thái biểu đạt",
    "levels.N1.name": "Cao cấp",
    "levels.N1.desc": "Gần mức bản ngữ và văn bản phức tạp",

    // Video frame
    "video.cameraOff": "Camera đã tắt",
    "video.cameraReady": "Camera sẵn sàng",
    "video.waitingConnection": "Đang chờ kết nối...",
    "video.you": "Bạn",

    // Course details
    "courses.items.1.title": "Thành thạo Hiragana",
    "courses.items.1.description": "Thành thạo tất cả 46 ký tự hiragana với các bài tập tương tác và ghi nhớ",
    "courses.items.1.duration": "2 tuần",
    "courses.items.1.price": "Miễn phí",
    "courses.items.2.title": "Katakana Cơ bản",
    "courses.items.2.description": "Học các ký tự katakana dùng cho từ nước ngoài và tiếng Nhật hiện đại",
    "courses.items.2.duration": "2 tuần",
    "courses.items.2.price": "$29",
    "courses.items.3.title": "Kanji Thiết yếu",
    "courses.items.3.description": "Bắt đầu hành trình kanji với 100 ký tự phổ biến nhất",
    "courses.items.3.duration": "4 tuần",
    "courses.items.3.price": "$49",
    "courses.items.4.title": "Ngữ pháp JLPT N5",
    "courses.items.4.description": "Khóa học ngữ pháp hoàn chỉnh cho trình độ JLPT N5 với bài kiểm tra thực hành",
    "courses.items.4.duration": "6 tuần",
    "courses.items.4.price": "$79",
    "courses.items.5.title": "Tiếng Nhật Thương mại",
    "courses.items.5.description": "Tiếng Nhật chuyên nghiệp cho giao tiếp nơi làm việc và họp hành",
    "courses.items.5.duration": "8 tuần",
    "courses.items.5.price": "$129",
    "courses.items.6.title": "Hội thoại Tiếng Nhật",
    "courses.items.6.description": "Luyện nói với người bản xứ và xây dựng sự tự tin",
    "courses.items.6.duration": "5 tuần",
    "courses.items.6.price": "$89",

    "community.mutualFriends": "bạn chung",

    // Flashcards page
    "flashcards.practiceTitle": "Luyện tập thẻ ghi nhớ",
    "flashcards.masterSubtitle": "Thành thạo chữ cái và từ vựng tiếng Nhật",
    "flashcards.clickToReveal": "Nhấp để hiển thị",
    "flashcards.didYouGetItRight": "Bạn đã trả lời đúng chứ?",
    "flashcards.previous": "Trước",
    "flashcards.next": "Tiếp",
    "flashcards.incorrect": "Sai",
    "flashcards.correct": "Đúng",
    "flashcards.reset": "Đặt lại tiến độ",
    "flashcards.learningProgress": "Tiến độ học tập",
    "flashcards.cardsStudied": "Thẻ đã học",
    "flashcards.correctAnswers": "Câu trả lời đúng",
    "flashcards.accuracyRate": "Tỷ lệ chính xác",
    "flashcards.completePercent": "% Hoàn thành",
    "flashcards.keyboardHelp": "Dùng Space để lật • ← Trước • → Tiếp",

    // Call / Random
    "call.random.title": "Cuộc gọi tiếng Nhật ngẫu nhiên",
    "call.random.subtitle": "Luyện tập tiếng Nhật với người bản xứ",
    "call.random.ready": "Sẵn sàng luyện tập tiếng Nhật?",
    "call.random.connecting": "Đang kết nối...",
    "call.random.finding": "Đang tìm người nói tiếng Nhật cho bạn",
    "call.random.start": "Bắt đầu gọi ngẫu nhiên",
    "call.random.waiting": "Đang chờ...",
    "call.random.connect": "Kết nối với người bản ngữ ở mức {level}",

    // Profile
    "profile.editProfile": "Chỉnh sửa hồ sơ",
    "profile.overview": "Tổng quan",
    "profile.courses": "Khóa học",
    "profile.achievements": "Thành tích",
    "profile.progress": "Tiến trình",
    "profile.settings": "Cài đặt",
    "profile.learningProgress": "Tiến độ học tập",
    "profile.badgesEarned": "Huy hiệu đạt được",
    "profile.enrolledCourses": "Khóa học đã đăng ký",
    "profile.enrolledCourses.subtitle": "Theo dõi tiến độ của bạn trên tất cả khóa học",
    "profile.weeklyGoal": "Mục tiêu tuần",
    "profile.currentStreak": "Chuỗi hiện tại",
    "profile.totalStudyTime": "Tổng thời gian học",
    "profile.wordsLearned": "Từ đã học",
    "profile.kanjiMastered": "Kanji đã thành thạo",
    "profile.lessonsCompleted": "Bài học đã hoàn thành",
    "profile.dayStreakLabel": "Chuỗi ngày",
    "profile.dayStreakSuffix": "ngày liên tiếp",
    "profile.joined": "Tham gia {date}",
    "profile.studiedHours": "{hours}h đã học",
    "profile.thisWeekStudyTime": "Thời gian học tuần này",
    "profile.recentAchievements": "Thành tích gần đây",
    "profile.earned": "Đạt được",
    "profile.achievementsAndBadges": "Thành tích & Huy hiệu",
    "profile.achievements.subtitle": "Cột mốc và thành tựu học tập của bạn",
    "profile.learningGoals": "Mục tiêu học tập",
    "profile.goal.jlptN3": "Chuẩn bị JLPT N3",
    "profile.goal.dailyStudy": "Mục tiêu học mỗi ngày ({hours}h)",
    "profile.goal.monthlyKanjiTarget": "Mục tiêu Kanji tháng ({count})",
    "profile.studyInsights": "Thông tin học tập",
    "profile.mostActiveDay": "Ngày hoạt động nhiều nhất",
    "profile.averageSession": "Phiên học trung bình",
    "profile.avgSession.45min": "45 phút",
    "profile.favoriteCategory": "Danh mục yêu thích",
    "profile.kanji": "Kanji",
    "profile.nextMilestone": "Cột mốc tiếp theo",
    "profile.milestone.100kanji": "100 Kanji",

    // Achievement titles
    "achievements.firstSteps": "Bước đầu tiên",
    "achievements.hiraganaMaster": "Bậc thầy Hiragana",
    "achievements.studyStreak": "Chuỗi học tập",
    "achievements.kanjiCollector": "Người sưu tập Kanji",
    "achievements.communityHelper": "Người giúp đỡ cộng đồng",
    "achievements.jlptReady": "Sẵn sàng JLPT",

    // Common
    "common.progress": "Tiến độ",
    "common.completed": "Hoàn thành",
    "common.inProgress": "Đang học",

    // Days
    "days.Mon": "T2",
    "days.Tue": "T3",
    "days.Wed": "T4",
    "days.Thu": "T5",
    "days.Fri": "T6",
    "days.Sat": "T7",
    "days.Sun": "CN",

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
