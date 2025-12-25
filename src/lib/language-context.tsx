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
    "nav.notifications": "Notifications",
    "nav.flashcards": "Flashcards",
    "nav.aiPractice": "AI Practice",
    "nav.profile": "Profile",
    "nav.login": "Login",
    "nav.logout": "Logout",
    "nav.theme": "Theme",
    "nav.videoCall": "Hanabi Studio",
    "nav.admin": "Admin Management",
    "nav.search": "Search",

    // Homepage
    "home.hero.badge": "Vietnam's #1 Japanese Learning Platform",
    "home.hero.title": "Learn Japanese Easily",
    "home.hero.titlePart1": "Learn Japanese",
    "home.hero.titlePart2": "Easier",
    "home.hero.subtitle":
      "Master Japanese with interactive courses, smart AI practice, and supportive community. Start your journey from beginner to fluent today.",
    "home.hero.exploreCourses": "Explore Courses",
    "home.hero.stats.students": "Students",
    "home.hero.stats.courses": "Courses",
    "home.hero.stats.satisfaction": "Satisfaction",
    "home.hero.stats.support": "Support",
    "home.features.title": "Why Choose",
    "home.features.titleHighlight": "HanabiHub",
    "home.features.subtitle":
      "Comprehensive Japanese learning platform with AI technology and modern learning methods",
    "home.features.ai.title": "Smart AI",
    "home.features.ai.desc":
      "Practice with smart AI tutor, personalized lessons based on your level and progress",
    "home.features.courses.title": "Diverse Courses",
    "home.features.courses.desc":
      "Over 50 courses from basic to advanced, from Hiragana to Kanji, from grammar to conversation",
    "home.features.community.title": "Vibrant Community",
    "home.features.community.desc":
      "Connect with thousands of students, share experiences and learn from each other",
    "home.features.flashcards.title": "Smart Flashcards",
    "home.features.flashcards.desc":
      "Flashcard system with spaced repetition helps you memorize vocabulary effectively",
    "home.features.progress.title": "Track Progress",
    "home.features.progress.desc":
      "Detailed dashboard helps you track learning progress, strengths and weaknesses",
    "home.features.speaking.title": "Real Speaking Practice",
    "home.features.speaking.desc":
      "Practice speaking with AI and other learners via video call, improve communication skills",
    "home.about.badge": "About HanabiHub",
    "home.about.title": "Learn Japanese",
    "home.about.titleHighlight": "More Effectively",
    "home.about.desc1":
      "HanabiHub is Vietnam's leading online Japanese learning platform, built to help everyone learn Japanese in the easiest, most effective and fun way.",
    "home.about.desc2":
      "We combine advanced AI technology, modern learning methods and supportive community to create a unique and comprehensive learning experience.",
    "home.about.point1": "Scientifically proven learning methods",
    "home.about.point2": "Team of experienced teachers",
    "home.about.point3": "AI technology for personalized lessons",
    "home.about.point4": "Active student community",
    "home.about.stats.satisfaction": "Satisfied students",
    "home.courses.title": "Popular Courses",
    "home.courses.titleHighlight": "Featured",
    "home.courses.subtitle":
      "Discover the most popular courses, designed by top experts",
    "home.courses.students": "students",
    "home.courses.lessons": "lessons",
    "home.courses.viewDetails": "View Details",
    "home.courses.empty": "No courses available",
    "home.courses.viewAll": "View All Courses",
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
    "home.testimonials.title": "What Students Say About",
    "home.testimonials.titleHighlight": "HanabiHub",
    "home.testimonials.subtitle":
      "Thousands of students have trusted and achieved their Japanese learning goals with us",
    "home.testimonials.student1.name": "Nguyen Thi Lan",
    "home.testimonials.student1.level": "N4 Student",
    "home.testimonials.student1.content":
      '"HanabiHub helped me pass the JLPT N4 exam easily. The flashcard system and AI tutor are really effective. Thank you team very much!"',
    "home.testimonials.student2.name": "Tran Van Minh",
    "home.testimonials.student2.level": "N2 Student",
    "home.testimonials.student2.content":
      '"I\'ve tried many Japanese learning platforms but HanabiHub is the best. Vibrant community, quality courses and smart AI. Highly recommended!"',
    "home.testimonials.student3.name": "Le Thi Yen",
    "home.testimonials.student3.level": "N5 Student",
    "home.testimonials.student3.content":
      '"As a beginner, I was very worried but HanabiHub made learning fun and easy. I memorized all Hiragana in just 2 weeks!"',
    "home.community.title": "Vibrant",
    "home.community.titleHighlight": "Community",
    "home.community.subtitle":
      "Join thousands of students sharing and learning from each other",
    "home.community.viewAll": "View All Posts",
    "home.community.level": "Level",
    "home.community.join": "Join the Community",
    "home.community.post1":
      "Just passed my first JLPT practice test! The kanji flashcards really helped. 頑張って！ Anyone else preparing for December?",
    "home.community.post2":
      "Pro tip: When learning new vocabulary, try to use it in sentences immediately. Context makes everything stick better! 🎌",
    "home.community.post3":
      "Finally memorized all hiragana! The spaced repetition system here is amazing. Moving on to katakana next week. ありがとうございます！",
    "home.flashcards.badge": "Smart Flashcards",
    "home.flashcards.sectionTitle": "Learn Vocabulary",
    "home.flashcards.sectionTitleHighlight": "More Effectively",
    "home.flashcards.desc":
      "Smart flashcard system with spaced repetition algorithm helps you memorize vocabulary long-term. Learn anytime, anywhere with thousands of ready-made flashcard sets or create your own.",
    "home.flashcards.point1": "Spaced repetition algorithm",
    "home.flashcards.point2": "Thousands of ready-made flashcard sets",
    "home.flashcards.point3": "Create your own flashcards",
    "home.flashcards.point4": "Track learning progress",
    "home.flashcards.start": "Start Practicing",
    "home.flashcards.click": "Click to flip",
    "home.flashcards.demoTitle": "Try Flashcards",
    "home.flashcards.subtitle": "Click to flip and test your knowledge",
    "home.flashcards.front": "Front",
    "home.flashcards.back": "Back",
    "home.flashcards.water": "water",
    "home.cta.title": "Ready to Start Your Japanese Learning Journey?",
    "home.cta.subtitle":
      "Join thousands of students learning and progressing every day. Start free today!",
    "home.cta.exploreCourses": "Explore Courses",
    "home.footer.tagline":
      "Vietnam's leading Japanese learning platform. Learn anytime, anywhere with smart AI.",
    "home.footer.courses": "Courses",
    "home.footer.allCourses": "All Courses",
    "home.footer.beginner": "For Beginners",
    "home.footer.intermediate": "Intermediate",
    "home.footer.advanced": "Advanced",
    "home.footer.features": "Features",
    "home.footer.community": "Community",
    "home.footer.speaking": "Speaking Practice",
    "home.footer.support": "Support",
    "home.footer.about": "About Us",
    "home.footer.contact": "Contact",
    "home.footer.privacy": "Privacy Policy",
    "home.footer.terms": "Terms of Service",
    "home.footer.copyright":
      "© 2024 HanabiHub. All rights reserved. Made with ❤️ for Japanese learners.",
    "home.footer.stats.satisfaction": "98% satisfied",
    "home.footer.stats.students": "10K+ students",

    // Footer
    "footer.about": "About",
    "footer.contact": "Contact",
    "footer.privacy": "Privacy",
    "footer.copyright":
      "© 2024 JapanLearn. All rights reserved. Made with ❤️ for Japanese learners.",

    // Courses
    "courses.hero.title": "Discover Japanese Courses",
    "courses.hero.subtitle":
      "From beginner to advanced, find the perfect course for your Japanese learning journey",
    "courses.searchPlaceholder": "Search courses...",
    "courses.searchIndicator": "Searching for:",
    "courses.error.title": "An error occurred",
    "courses.error.message": "Unable to load course list. Please try again.",
    "courses.error.retry": "Try Again",
    "courses.filters": "Filters:",
    "courses.filter.all": "All",
    "courses.filter.free": "Free",
    "courses.filter.paid": "Paid",
    "courses.filter.rated": "Rated",
    "courses.filter.highRating": "High Rating",
    "courses.results.showing": "Showing",
    "courses.results.of": "of",
    "courses.results.courses": "courses",
    "courses.popular": "Popular",
    "courses.format.free": "Free",
    "courses.format.currency": "VND",
    "courses.format.weeks": "weeks",
    "courses.format.lessons": "lessons",
    "courses.instructor.unknown": "Unknown",
    "courses.button.details": "Details",
    "courses.button.learn": "Learn",
    "courses.empty.title": "No courses found",
    "courses.empty.subtitle": "Try adjusting your search keywords or filters",
    "courses.viewCourse": "View Course",
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
    "courses.items.1.description":
      "Master all 46 hiragana characters with interactive exercises and mnemonics",
    "courses.items.1.level": "Beginner",
    "courses.items.1.duration": "2 weeks",
    "courses.items.1.price": "Free",
    "courses.items.1.category": "Writing System",

    "courses.items.2.title": "Katakana Essentials",
    "courses.items.2.description":
      "Learn katakana characters used for foreign words and modern Japanese",
    "courses.items.2.level": "Beginner",
    "courses.items.2.duration": "2 weeks",
    "courses.items.2.price": "$29",
    "courses.items.2.category": "Writing System",

    "courses.items.3.title": "Essential Kanji",
    "courses.items.3.description":
      "Start your kanji journey with the most common 100 characters",
    "courses.items.3.level": "Intermediate",
    "courses.items.3.duration": "4 weeks",
    "courses.items.3.price": "$49",
    "courses.items.3.category": "Writing System",

    "courses.items.4.title": "JLPT N5 Grammar",
    "courses.items.4.description":
      "Complete grammar course for JLPT N5 level with practice tests",
    "courses.items.4.level": "Beginner",
    "courses.items.4.duration": "6 weeks",
    "courses.items.4.price": "$79",
    "courses.items.4.category": "Grammar",

    "courses.items.5.title": "Business Japanese",
    "courses.items.5.description":
      "Professional Japanese for workplace communication and meetings",
    "courses.items.5.level": "Advanced",
    "courses.items.5.duration": "8 weeks",
    "courses.items.5.price": "$129",
    "courses.items.5.category": "Business",

    "courses.items.6.title": "Japanese Conversation",
    "courses.items.6.description":
      "Practice speaking with native speakers and build confidence",
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
    "community.posts.1.content":
      "Just passed my first JLPT practice test! The kanji flashcards really helped. Anyone else preparing for December?",
    "community.posts.2.content":
      "Pro tip: When learning new vocabulary, try to use it in sentences immediately. Context makes everything stick better! Here's my study setup:",
    "community.posts.3.content":
      "Finally memorized all hiragana! The spaced repetition system here is amazing. Moving on to katakana next week.",
    "community.posts.4.content":
      "Today I learned that 雨 (rain) + 雲 (cloud) doesn't make a compound word, but 雨雲 (rain cloud) does exist! Japanese is fascinating. What's your favorite kanji discovery?",
    "community.posts.5.content":
      "Started learning Kansai dialect and it's so different from standard Japanese! だんだん instead of ありがとう is my new favorite. Anyone else studying dialects?",
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
    "messages.empty.subtitle":
      "Send photos and private messages to friends or groups",
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
    "courses.items.1.description":
      "Master all 46 hiragana characters with interactive exercises and mnemonics",
    "courses.items.1.duration": "2 weeks",
    "courses.items.1.price": "Free",
    "courses.items.2.title": "Katakana Essentials",
    "courses.items.2.description":
      "Learn katakana characters used for foreign words and modern Japanese",
    "courses.items.2.duration": "2 weeks",
    "courses.items.2.price": "$29",
    "courses.items.3.title": "Essential Kanji",
    "courses.items.3.description":
      "Start your kanji journey with the most common 100 characters",
    "courses.items.3.duration": "4 weeks",
    "courses.items.3.price": "$49",
    "courses.items.4.title": "JLPT N5 Grammar",
    "courses.items.4.description":
      "Complete grammar course for JLPT N5 level with practice tests",
    "courses.items.4.duration": "6 weeks",
    "courses.items.4.price": "$79",
    "courses.items.5.title": "Business Japanese",
    "courses.items.5.description":
      "Professional Japanese for workplace communication and meetings",
    "courses.items.5.duration": "8 weeks",
    "courses.items.5.price": "$129",
    "courses.items.6.title": "Japanese Conversation",
    "courses.items.6.description":
      "Practice speaking with native speakers and build confidence",
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
    "profile.enrolledCourses.subtitle":
      "Track your progress across all courses",
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
    "profile.achievements.subtitle":
      "Your learning milestones and accomplishments",
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
    "nav.notifications": "Thông báo",
    "nav.flashcards": "Thẻ ghi nhớ",
    "nav.aiPractice": "Luyện tập AI",
    "nav.profile": "Hồ sơ",
    "nav.login": "Đăng nhập",
    "nav.logout": "Đăng xuất",
    "nav.theme": "Chủ đề",
    "nav.videoCall": "Hanabi thoại",
    "nav.admin": "Quản lý",
    "nav.search": "Tìm kiếm",

    // Homepage
    "home.hero.badge": "Nền tảng học tiếng Nhật số 1 Việt Nam",
    "home.hero.title": "Học tiếng Nhật dễ dàng",
    "home.hero.titlePart1": "Học Tiếng Nhật",
    "home.hero.titlePart2": "Dễ Dàng Hơn",
    "home.hero.subtitle":
      "Làm chủ tiếng Nhật với các khóa học tương tác, luyện tập AI thông minh và cộng đồng hỗ trợ. Bắt đầu hành trình từ người mới đến thành thạo ngay hôm nay.",
    "home.hero.exploreCourses": "Khám phá khóa học",
    "home.hero.stats.students": "Học viên",
    "home.hero.stats.courses": "Khóa học",
    "home.hero.stats.satisfaction": "Hài lòng",
    "home.hero.stats.support": "Hỗ trợ",
    "home.features.title": "Tại sao chọn",
    "home.features.titleHighlight": "HanabiHub",
    "home.features.subtitle":
      "Nền tảng học tiếng Nhật toàn diện với công nghệ AI và phương pháp học hiện đại",
    "home.features.ai.title": "AI Thông Minh",
    "home.features.ai.desc":
      "Luyện tập với AI tutor thông minh, cá nhân hóa bài học theo trình độ và tiến độ của bạn",
    "home.features.courses.title": "Khóa Học Đa Dạng",
    "home.features.courses.desc":
      "Hơn 50 khóa học từ cơ bản đến nâng cao, từ Hiragana đến Kanji, từ ngữ pháp đến giao tiếp",
    "home.features.community.title": "Cộng Đồng Sôi Động",
    "home.features.community.desc":
      "Kết nối với hàng nghìn học viên, chia sẻ kinh nghiệm và học hỏi lẫn nhau",
    "home.features.flashcards.title": "Flashcards Thông Minh",
    "home.features.flashcards.desc":
      "Hệ thống flashcard với spaced repetition giúp bạn ghi nhớ từ vựng hiệu quả",
    "home.features.progress.title": "Theo Dõi Tiến Độ",
    "home.features.progress.desc":
      "Dashboard chi tiết giúp bạn theo dõi tiến độ học tập, điểm mạnh và điểm yếu",
    "home.features.speaking.title": "Luyện Nói Thực Tế",
    "home.features.speaking.desc":
      "Luyện nói với AI và người học khác qua video call, nâng cao kỹ năng giao tiếp",
    "home.about.badge": "Về HanabiHub",
    "home.about.title": "Học tiếng Nhật",
    "home.about.titleHighlight": "hiệu quả hơn",
    "home.about.desc1":
      "HanabiHub là nền tảng học tiếng Nhật trực tuyến hàng đầu Việt Nam, được xây dựng với mục tiêu giúp mọi người học tiếng Nhật một cách dễ dàng, hiệu quả và thú vị nhất.",
    "home.about.desc2":
      "Chúng tôi kết hợp công nghệ AI tiên tiến, phương pháp học hiện đại và cộng đồng hỗ trợ để tạo ra trải nghiệm học tập độc đáo và toàn diện.",
    "home.about.point1": "Phương pháp học được khoa học chứng minh",
    "home.about.point2": "Đội ngũ giáo viên giàu kinh nghiệm",
    "home.about.point3": "Công nghệ AI cá nhân hóa bài học",
    "home.about.point4": "Cộng đồng học viên tích cực",
    "home.about.stats.satisfaction": "Học viên hài lòng",
    "home.courses.title": "Khóa Học",
    "home.courses.titleHighlight": "Nổi Bật",
    "home.courses.subtitle":
      "Khám phá các khóa học được yêu thích nhất, được thiết kế bởi các chuyên gia hàng đầu",
    "home.courses.students": "học viên",
    "home.courses.lessons": "bài học",
    "home.courses.viewDetails": "Xem chi tiết",
    "home.courses.empty": "Chưa có khóa học nào",
    "home.courses.viewAll": "Xem tất cả khóa học",
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
    "home.testimonials.title": "Học Viên Nói Gì Về",
    "home.testimonials.titleHighlight": "HanabiHub",
    "home.testimonials.subtitle":
      "Hàng nghìn học viên đã tin tưởng và đạt được mục tiêu học tiếng Nhật với chúng tôi",
    "home.testimonials.student1.name": "Nguyễn Thị Lan",
    "home.testimonials.student1.level": "Học viên N4",
    "home.testimonials.student1.content":
      '"HanabiHub đã giúp tôi vượt qua kỳ thi JLPT N4 một cách dễ dàng. Hệ thống flashcard và AI tutor thực sự hiệu quả. Cảm ơn team rất nhiều!"',
    "home.testimonials.student2.name": "Trần Văn Minh",
    "home.testimonials.student2.level": "Học viên N2",
    "home.testimonials.student2.content":
      '"Tôi đã thử nhiều nền tảng học tiếng Nhật nhưng HanabiHub là tốt nhất. Cộng đồng sôi động, khóa học chất lượng và AI thông minh. Highly recommended!"',
    "home.testimonials.student3.name": "Lê Thị Yến",
    "home.testimonials.student3.level": "Học viên N5",
    "home.testimonials.student3.content":
      '"Là người mới bắt đầu, tôi rất lo lắng nhưng HanabiHub đã làm cho việc học trở nên thú vị và dễ dàng. Tôi đã nhớ được tất cả Hiragana chỉ sau 2 tuần!"',
    "home.community.title": "Cộng Đồng",
    "home.community.titleHighlight": "Sôi Động",
    "home.community.subtitle":
      "Tham gia cùng hàng nghìn học viên đang chia sẻ và học hỏi lẫn nhau",
    "home.community.viewAll": "Xem tất cả bài viết",
    "home.community.level": "Cấp độ",
    "home.community.post1":
      "Vừa vượt qua bài kiểm tra JLPT thử đầu tiên! Flashcard kanji thực sự hữu ích. 頑張って！ Có ai đang chuẩn bị cho tháng 12 không?",
    "home.community.post2":
      "Mẹo hay: Khi học từ vựng mới, hãy thử sử dụng nó ngay trong câu. Ngữ cảnh giúp ghi nhớ tốt hơn nhiều! 🎌",
    "home.community.post3":
      "Cuối cùng cũng nhớ hết Hiragana! Hệ thống spaced repetition ở đây thật tuyệt vời. Tuần sau sẽ học Katakana. ありがとうございます！",
    "home.flashcards.badge": "Flashcards Thông Minh",
    "home.flashcards.sectionTitle": "Học từ vựng",
    "home.flashcards.sectionTitleHighlight": "hiệu quả hơn",
    "home.flashcards.desc":
      "Hệ thống flashcard thông minh với thuật toán spaced repetition giúp bạn ghi nhớ từ vựng lâu dài. Học mọi lúc, mọi nơi với hàng nghìn bộ flashcard được tạo sẵn hoặc tự tạo bộ của riêng bạn.",
    "home.flashcards.point1": "Spaced repetition algorithm",
    "home.flashcards.point2": "Hàng nghìn bộ flashcard sẵn có",
    "home.flashcards.point3": "Tự tạo flashcard của riêng bạn",
    "home.flashcards.point4": "Theo dõi tiến độ học tập",
    "home.flashcards.start": "Bắt đầu luyện tập",
    "home.flashcards.click": "Nhấp để lật",
    "home.flashcards.demoTitle": "Thử thẻ ghi nhớ",
    "home.flashcards.subtitle": "Nhấp để lật và kiểm tra kiến thức của bạn",
    "home.flashcards.front": "Mặt trước",
    "home.flashcards.back": "Mặt sau",
    "home.flashcards.water": "nước",
    "home.community.join": "Tham gia cộng đồng",

    "home.cta.title": "Sẵn sàng bắt đầu hành trình học tiếng Nhật?",
    "home.cta.subtitle":
      "Tham gia cùng hàng nghìn học viên đang học và tiến bộ mỗi ngày. Bắt đầu miễn phí ngay hôm nay!",
    "home.cta.exploreCourses": "Khám phá khóa học",
    "home.footer.tagline":
      "Nền tảng học tiếng Nhật hàng đầu Việt Nam. Học mọi lúc, mọi nơi với AI thông minh.",
    "home.footer.courses": "Khóa học",
    "home.footer.allCourses": "Tất cả khóa học",
    "home.footer.beginner": "Cho người mới bắt đầu",
    "home.footer.intermediate": "Trung cấp",
    "home.footer.advanced": "Nâng cao",
    "home.footer.features": "Tính năng",
    "home.footer.community": "Cộng đồng",
    "home.footer.speaking": "Luyện nói",
    "home.footer.support": "Hỗ trợ",
    "home.footer.about": "Về chúng tôi",
    "home.footer.contact": "Liên hệ",
    "home.footer.privacy": "Chính sách bảo mật",
    "home.footer.terms": "Điều khoản sử dụng",
    "home.footer.copyright":
      "© 2024 HanabiHub. Tất cả quyền được bảo lưu. Được tạo với ❤️ dành cho những người học tiếng Nhật.",
    "home.footer.stats.satisfaction": "98% hài lòng",
    "home.footer.stats.students": "10K+ học viên",

    // Footer
    "footer.about": "Giới thiệu",
    "footer.contact": "Liên hệ",
    "footer.privacy": "Bảo mật",
    "footer.copyright":
      "© 2024 JapanLearn. Bản quyền đã được bảo lưu. Được tạo với ❤️ cho người học tiếng Nhật.",

    // Courses
    "courses.hero.title": "Khám phá khóa học tiếng Nhật",
    "courses.hero.subtitle":
      "Từ cơ bản đến nâng cao, tìm khóa học hoàn hảo cho hành trình học tiếng Nhật của bạn",
    "courses.searchPlaceholder": "Tìm kiếm khóa học theo tên hoặc mô tả...",
    "courses.searchIndicator": "Đang tìm kiếm:",
    "courses.error.title": "Có lỗi xảy ra",
    "courses.error.message":
      "Không thể tải danh sách khóa học. Vui lòng thử lại.",
    "courses.error.retry": "Thử lại",
    "courses.filters": "Bộ lọc:",
    "courses.filter.all": "Tất cả",
    "courses.filter.free": "Miễn phí",
    "courses.filter.paid": "Có phí",
    "courses.filter.rated": "Có đánh giá",
    "courses.filter.highRating": "Đánh giá cao",
    "courses.results.showing": "Hiển thị",
    "courses.popular": "Phổ biến",
    "courses.format.free": "Miễn phí",
    "courses.format.currency": "VNĐ",
    "courses.format.weeks": "tuần",
    "courses.format.lessons": "bài",
    "courses.instructor.unknown": "Chưa xác định",
    "courses.button.details": "Chi tiết",
    "courses.button.learn": "Học",
    "courses.empty.title": "Không tìm thấy khóa học",
    "courses.empty.subtitle": "Thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc",
    "courses.viewCourse": "Xem khóa học",
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
    "courses.items.1.description":
      "Thành thạo 46 chữ hiragana với bài tập tương tác và phương pháp ghi nhớ",
    "courses.items.1.level": "Sơ cấp",
    "courses.items.1.duration": "2 tuần",
    "courses.items.1.price": "Miễn phí",
    "courses.items.1.category": "Hệ chữ viết",

    "courses.items.2.title": "Katakana thiết yếu",
    "courses.items.2.description":
      "Học chữ katakana dùng cho từ mượn và tiếng Nhật hiện đại",
    "courses.items.2.level": "Sơ cấp",
    "courses.items.2.duration": "2 tuần",
    "courses.items.2.price": "$29",
    "courses.items.2.category": "Hệ chữ viết",

    "courses.items.3.title": "Kanji cơ bản",
    "courses.items.3.description":
      "Bắt đầu hành trình kanji với 100 chữ thông dụng nhất",
    "courses.items.3.level": "Trung cấp",
    "courses.items.3.duration": "4 tuần",
    "courses.items.3.price": "$49",
    "courses.items.3.category": "Hệ chữ viết",

    "courses.items.4.title": "Ngữ pháp JLPT N5",
    "courses.items.4.description":
      "Khóa ngữ pháp đầy đủ cho JLPT N5 kèm bài kiểm tra",
    "courses.items.4.level": "Sơ cấp",
    "courses.items.4.duration": "6 tuần",
    "courses.items.4.price": "$79",
    "courses.items.4.category": "Ngữ pháp",

    "courses.items.5.title": "Tiếng Nhật kinh doanh",
    "courses.items.5.description":
      "Tiếng Nhật chuyên nghiệp cho giao tiếp và cuộc họp tại nơi làm việc",
    "courses.items.5.level": "Cao cấp",
    "courses.items.5.duration": "8 tuần",
    "courses.items.5.price": "$129",
    "courses.items.5.category": "Kinh doanh",

    "courses.items.6.title": "Hội thoại tiếng Nhật",
    "courses.items.6.description":
      "Luyện nói với người bản xứ và xây dựng tự tin",
    "courses.items.6.level": "Trung cấp",
    "courses.items.6.duration": "5 tuần",
    "courses.items.6.price": "$89",
    "courses.items.6.category": "Nói",

    // Community
    "community.create.placeholder":
      "Chia sẻ hành trình học tiếng Nhật của bạn...",
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
    "community.posts.1.content":
      "Vừa vượt qua bài thi JLPT thử đầu tiên! Thẻ kanji giúp rất nhiều. Có ai đang chuẩn bị cho tháng 12 không?",
    "community.posts.2.content":
      "Mẹo nhỏ: Khi học từ mới, hãy dùng ngay trong câu. Ngữ cảnh giúp ghi nhớ tốt hơn! Đây là góc học tập của mình:",
    "community.posts.3.content":
      "Cuối cùng đã thuộc hết hiragana! Hệ thống lặp lại ngắt quãng ở đây rất tuyệt. Tuần sau chuyển sang katakana.",
    "community.posts.4.content":
      "Hôm nay mình học được rằng 雨 (mưa) + 雲 (mây) không tạo thành từ ghép, nhưng 雨雲 (mây mưa) thì có! Tiếng Nhật thật thú vị. Khám phá kanji bạn thích nhất là gì?",
    "community.posts.5.content":
      "Bắt đầu học tiếng Kansai và nó khác tiếng Nhật chuẩn nhiều quá! だんだん thay cho ありがとう là yêu thích mới của mình. Có ai học phương ngữ không?",
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
    "messages.empty.subtitle":
      "Gửi ảnh và tin nhắn riêng tư cho bạn bè hoặc nhóm",
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
    "courses.items.1.description":
      "Thành thạo tất cả 46 ký tự hiragana với các bài tập tương tác và ghi nhớ",
    "courses.items.1.duration": "2 tuần",
    "courses.items.1.price": "Miễn phí",
    "courses.items.2.title": "Katakana Cơ bản",
    "courses.items.2.description":
      "Học các ký tự katakana dùng cho từ nước ngoài và tiếng Nhật hiện đại",
    "courses.items.2.duration": "2 tuần",
    "courses.items.2.price": "$29",
    "courses.items.3.title": "Kanji Thiết yếu",
    "courses.items.3.description":
      "Bắt đầu hành trình kanji với 100 ký tự phổ biến nhất",
    "courses.items.3.duration": "4 tuần",
    "courses.items.3.price": "$49",
    "courses.items.4.title": "Ngữ pháp JLPT N5",
    "courses.items.4.description":
      "Khóa học ngữ pháp hoàn chỉnh cho trình độ JLPT N5 với bài kiểm tra thực hành",
    "courses.items.4.duration": "6 tuần",
    "courses.items.4.price": "$79",
    "courses.items.5.title": "Tiếng Nhật Thương mại",
    "courses.items.5.description":
      "Tiếng Nhật chuyên nghiệp cho giao tiếp nơi làm việc và họp hành",
    "courses.items.5.duration": "8 tuần",
    "courses.items.5.price": "$129",
    "courses.items.6.title": "Hội thoại Tiếng Nhật",
    "courses.items.6.description":
      "Luyện nói với người bản xứ và xây dựng sự tự tin",
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
    "profile.enrolledCourses.subtitle":
      "Theo dõi tiến độ của bạn trên tất cả khóa học",
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
