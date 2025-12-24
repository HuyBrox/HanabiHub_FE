"use client";
import { Button } from "@/components/ui/button";
import { HeroCTA } from "@/components/common";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  MessageCircle,
  RotateCcw,
  BookOpen,
  Users,
  Award,
  Sparkles,
  Brain,
  MessageSquare,
  TrendingUp,
  Star,
  CheckCircle2,
  ArrowRight,
  GraduationCap,
  Languages,
  Zap,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import React, { useMemo, Suspense } from "react";
import { useGetAllCoursesQuery } from "@/store/services/courseApi";
import { LoadingSpinner } from "@/components/loading";
import { CountUpNumber } from "@/components/home/CountUpNumber";
import styles from "./hero-animations.module.css";
import { Poppins } from "next/font/google";
import { useLanguage } from "@/lib/language-context";

// Font đẹp cho hero section - Poppins (modern, clean, friendly)
// Tối ưu: chỉ load weights cần thiết và display swap
const poppins = Poppins({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"], // Giảm số weights để load nhanh hơn
  variable: "--font-hero-poppins",
  display: "swap", // Không block render
  preload: false, // Không preload font này vì chỉ dùng cho hero section
});

export default function HomePage() {
  const { t } = useLanguage();

  // Fetch popular courses - tối ưu: chỉ fetch khi cần
  const coursesQueryParams = useMemo(() => ({ limit: 6 }), []);
  const { data: coursesData, isLoading: coursesLoading } =
    useGetAllCoursesQuery(coursesQueryParams, {
      // Tối ưu: không refetch khi mount lại nếu đã có data
      refetchOnMountOrArgChange: false,
    });

  const popularCourses = coursesData?.data?.slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Beautiful & Animated */}
      <section
        className={`relative px-6 py-12 md:py-16 overflow-hidden min-h-[60vh] md:min-h-[70vh] flex items-center ${poppins.className}`}
      >
        {/* Background with parallax effect */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
          style={{
            backgroundImage: "url('/images/backgrounds/jp-bg2.jpg')",
          }}
        >
          {/* Overlay nhẹ để hình nền rõ hơn nhưng vẫn đảm bảo text dễ đọc */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/20 to-background/30 backdrop-blur-[1px]" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/1 via-transparent to-primary/1" />
        </div>

        {/* Animated floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={`particle-${i}`}
              className={`${styles.particle} ${styles.floatingElement} ${styles.animateFloat}`}
              style={{
                width: `${20 + i * 10}px`,
                height: `${20 + i * 10}px`,
                left: `${10 + i * 15}%`,
                top: `${20 + i * 10}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${6 + i}s`,
              }}
            />
          ))}
        </div>

        {/* Cherry blossoms animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={`cherry-${i}`}
              className={`${styles.floatingElement} ${styles.animateCherryBlossom}`}
              style={{
                left: `${5 + i * 12}%`,
                fontSize: "2rem",
                animationDelay: `${i * 2}s`,
                animationDuration: `${12 + i * 2}s`,
              }}
            >
              🌸
            </div>
          ))}
        </div>

        {/* Glowing orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className={`absolute w-96 h-96 bg-primary/10 rounded-full blur-3xl ${styles.animateFloat}`}
            style={{
              top: "10%",
              left: "5%",
              animationDuration: "8s",
            }}
          />
          <div
            className={`absolute w-80 h-80 bg-primary/5 rounded-full blur-3xl ${styles.animateFloatSlow}`}
            style={{
              bottom: "10%",
              right: "5%",
              animationDuration: "10s",
              animationDelay: "2s",
            }}
          />
        </div>

        {/* Main Content */}
        <div className="relative max-w-6xl mx-auto w-full z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge with animation */}
            <div
              className={`inline-flex items-center gap-2 px-5 py-2.5 bg-primary/20 backdrop-blur-md border-2 border-primary/30 rounded-full mb-6 ${styles.animateFadeInDown} ${styles.delay200} shadow-xl`}
            >
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-bold text-primary drop-shadow-sm tracking-wide">
                {t("home.hero.badge")}
              </span>
            </div>

            {/* Main Heading with gradient animation */}
            <h1
              className={`text-5xl md:text-6xl lg:text-8xl font-extrabold mb-5 ${styles.animateFadeInUp} ${styles.delay300} drop-shadow-lg tracking-tight`}
              style={{
                letterSpacing: "-0.02em",
              }}
            >
              <span className="text-foreground drop-shadow-md block mb-2">
                {t("home.hero.titlePart1")}
              </span>
              <span className={`${styles.gradientText} drop-shadow-md block`}>
                {t("home.hero.titlePart2")}
              </span>
            </h1>

            {/* Description with animation */}
            <p
              className={`text-lg md:text-xl font-semibold mb-8 max-w-2xl mx-auto leading-relaxed ${styles.animateFadeInUp} ${styles.delay400} text-foreground/95 drop-shadow-md`}
              style={{
                textShadow:
                  "0 2px 8px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2)",
                letterSpacing: "-0.01em",
              }}
            >
              {t("home.hero.subtitle")}
            </p>

            {/* CTA Buttons with animation */}
            <div
              className={`flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 ${styles.animateFadeInUp} ${styles.delay500}`}
            >
              <div className="transform hover:scale-105 transition-transform duration-300">
                <HeroCTA />
              </div>
              <Link
                href="/courses"
                className="transform hover:scale-105 transition-transform duration-300"
              >
                <Button
                  size="lg"
                  variant="outline"
                  className={`px-8 py-3 text-lg font-semibold border-2 backdrop-blur-sm bg-background/80 hover:bg-primary/10 hover:border-primary/50 ${styles.animateGlow} tracking-wide`}
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  {t("home.hero.exploreCourses")}
                </Button>
              </Link>
            </div>

            {/* Stats with count-up animation */}
            <div
              className={`grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-3xl mx-auto ${styles.animateFadeInUp} ${styles.delay600}`}
            >
              <div className="text-center p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg transform hover:scale-105">
                <div
                  className={`text-2xl md:text-3xl font-extrabold ${styles.gradientText} mb-1 tracking-tight`}
                >
                  <CountUpNumber end={10} suffix="K+" duration={2000} />
                </div>
                <div className="text-xs md:text-sm text-muted-foreground font-medium">
                  {t("home.hero.stats.students")}
                </div>
              </div>
              <div className="text-center p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg transform hover:scale-105">
                <div
                  className={`text-2xl md:text-3xl font-extrabold ${styles.gradientText} mb-1 tracking-tight`}
                >
                  <CountUpNumber end={50} suffix="+" duration={2000} />
                </div>
                <div className="text-xs md:text-sm text-muted-foreground font-medium">
                  {t("home.hero.stats.courses")}
                </div>
              </div>
              <div className="text-center p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg transform hover:scale-105">
                <div
                  className={`text-2xl md:text-3xl font-extrabold ${styles.gradientText} mb-1 tracking-tight`}
                >
                  <CountUpNumber end={98} suffix="%" duration={2000} />
                </div>
                <div className="text-xs md:text-sm text-muted-foreground font-medium">
                  {t("home.hero.stats.satisfaction")}
                </div>
              </div>
              <div className="text-center p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg transform hover:scale-105">
                <div
                  className={`text-2xl md:text-3xl font-extrabold ${styles.gradientText} mb-1 tracking-tight`}
                >
                  24/7
                </div>
                <div className="text-xs md:text-sm text-muted-foreground font-medium">
                  {t("home.hero.stats.support")}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce ${styles.delay700}`}
        >
          <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {t("home.features.title")}{" "}
              <span className="text-primary">
                {t("home.features.titleHighlight")}
              </span>
              ?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("home.features.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{t("home.features.ai.title")}</CardTitle>
                <CardDescription>{t("home.features.ai.desc")}</CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 2 */}
            <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{t("home.features.courses.title")}</CardTitle>
                <CardDescription>
                  {t("home.features.courses.desc")}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 3 */}
            <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{t("home.features.community.title")}</CardTitle>
                <CardDescription>
                  {t("home.features.community.desc")}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 4 */}
            <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{t("home.features.flashcards.title")}</CardTitle>
                <CardDescription>
                  {t("home.features.flashcards.desc")}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 5 */}
            <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{t("home.features.progress.title")}</CardTitle>
                <CardDescription>
                  {t("home.features.progress.desc")}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 6 */}
            <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Languages className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{t("home.features.speaking.title")}</CardTitle>
                <CardDescription>
                  {t("home.features.speaking.desc")}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4">{t("home.about.badge")}</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                {t("home.about.title")}
                <br />
                <span className="text-primary">
                  {t("home.about.titleHighlight")}
                </span>
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                {t("home.about.desc1")}
              </p>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                {t("home.about.desc2")}
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span>{t("home.about.point1")}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span>{t("home.about.point2")}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span>{t("home.about.point3")}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span>{t("home.about.point4")}</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/backgrounds/jp-bg2.jpg"
                  alt="HanabiHub Learning Platform"
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              </div>
              {/* Stats overlay */}
              <div className="absolute -bottom-6 -right-6 bg-card border-2 rounded-xl p-6 shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">98%</div>
                    <div className="text-sm text-muted-foreground">
                      {t("home.about.stats.satisfaction")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Courses Section */}
      <section className="px-6 py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {t("home.courses.title")}{" "}
              <span className="text-primary">
                {t("home.courses.titleHighlight")}
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("home.courses.subtitle")}
            </p>
          </div>

          {coursesLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : popularCourses.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              {popularCourses.map((course) => (
                <Card
                  key={course._id}
                  className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden border-2"
                >
                  <div className="relative">
                    <Image
                      src={
                        course.thumbnail ||
                        "/images/placeholders/placeholder.jpg"
                      }
                      alt={course.title}
                      width={400}
                      height={240}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-primary">
                        {course.level || "Beginner"}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {course.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>
                          {(
                            course.studentCount ||
                            course.students?.length ||
                            0
                          ).toLocaleString()}{" "}
                          {t("home.courses.students")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        <span>
                          {course.lessons?.length || 0}{" "}
                          {t("home.courses.lessons")}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardContent>
                    <Link
                      href={`/courses/${course._id}/detail`}
                      className="w-full"
                    >
                      <Button className="w-full bg-primary hover:bg-primary/90">
                        {t("home.courses.viewDetails")}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t("home.courses.empty")}</p>
            </div>
          )}

          <div className="text-center">
            <Link href="/courses">
              <Button size="lg" variant="outline" className="px-8">
                {t("home.courses.viewAll")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {t("home.testimonials.title")}{" "}
              <span className="text-primary">
                {t("home.testimonials.titleHighlight")}
              </span>
              ?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("home.testimonials.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <Card className="border-2 hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/images/avatars/anime-style-avatar-girl.png" />
                    <AvatarFallback>SK</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">
                      {t("home.testimonials.student1.name")}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t("home.testimonials.student1.level")}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-primary text-primary"
                    />
                  ))}
                </div>
                <CardDescription className="text-base">
                  {t("home.testimonials.student1.content")}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Testimonial 2 */}
            <Card className="border-2 hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/images/avatars/anime-style-avatar-boy.png" />
                    <AvatarFallback>TM</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">
                      {t("home.testimonials.student2.name")}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t("home.testimonials.student2.level")}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-primary text-primary"
                    />
                  ))}
                </div>
                <CardDescription className="text-base">
                  {t("home.testimonials.student2.content")}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Testimonial 3 */}
            <Card className="border-2 hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/images/avatars/anime-style-avatar-woman.png" />
                    <AvatarFallback>YL</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">
                      {t("home.testimonials.student3.name")}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t("home.testimonials.student3.level")}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-primary text-primary"
                    />
                  ))}
                </div>
                <CardDescription className="text-base">
                  {t("home.testimonials.student3.content")}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Community Preview Section - Improved */}
      <section className="px-6 py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {t("home.community.title")}{" "}
              <span className="text-primary">
                {t("home.community.titleHighlight")}
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("home.community.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-all border-2">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src="/images/avatars/anime-style-avatar-girl.png" />
                    <AvatarFallback>SK</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">SakuraKid</span>
                      <Badge variant="outline" className="text-xs">
                        N4 {t("home.community.level")}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-3 text-sm">
                      {t("home.community.post1")}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <Button variant="ghost" size="sm" className="p-0 h-auto">
                        <Heart className="h-4 w-4 mr-1" />
                        24
                      </Button>
                      <Button variant="ghost" size="sm" className="p-0 h-auto">
                        <MessageCircle className="h-4 w-4 mr-1" />8
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all border-2">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src="/images/avatars/anime-style-avatar-boy.png" />
                    <AvatarFallback>TM</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">TokyoMaster</span>
                      <Badge variant="outline" className="text-xs">
                        N2 {t("home.community.level")}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-3 text-sm">
                      {t("home.community.post2")}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <Button variant="ghost" size="sm" className="p-0 h-auto">
                        <Heart className="h-4 w-4 mr-1" />
                        42
                      </Button>
                      <Button variant="ghost" size="sm" className="p-0 h-auto">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        15
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all border-2">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src="/images/avatars/anime-style-avatar-woman.png" />
                    <AvatarFallback>YL</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">YukiLearner</span>
                      <Badge variant="outline" className="text-xs">
                        N5 {t("home.community.level")}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-3 text-sm">
                      {t("home.community.post3")}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <Button variant="ghost" size="sm" className="p-0 h-auto">
                        <Heart className="h-4 w-4 mr-1" />
                        18
                      </Button>
                      <Button variant="ghost" size="sm" className="p-0 h-auto">
                        <MessageCircle className="h-4 w-4 mr-1" />6
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Link href="/community">
              <Button size="lg" variant="outline" className="px-8">
                {t("home.community.join")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Flashcards Demo Section - Improved */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4">{t("home.flashcards.badge")}</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                {t("home.flashcards.sectionTitle")}
                <br />
                <span className="text-primary">
                  {t("home.flashcards.sectionTitleHighlight")}
                </span>
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                {t("home.flashcards.desc")}
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span>{t("home.flashcards.point1")}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span>{t("home.flashcards.point2")}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span>{t("home.flashcards.point3")}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span>{t("home.flashcards.point4")}</span>
                </div>
              </div>
              <Link href="/flashcards">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  {t("home.flashcards.start")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div className="relative">
              <Card className="relative mx-auto w-full max-w-md h-64 cursor-pointer group border-2 hover:shadow-xl transition-all">
                <CardContent className="flex items-center justify-center h-full p-8 group-hover:hidden">
                  <div className="text-center">
                    <div className="text-7xl font-bold text-primary mb-4">
                      水
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t("home.flashcards.click")}
                    </p>
                  </div>
                </CardContent>
                <CardContent className="hidden group-hover:flex items-center justify-center h-full p-8 bg-primary/5">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-foreground mb-2">
                      みず / mizu
                    </div>
                    <p className="text-2xl text-muted-foreground mb-2">
                      {t("home.flashcards.water")}
                    </p>
                    <p className="text-sm text-muted-foreground">nước</p>
                  </div>
                </CardContent>
                <div className="absolute top-4 right-4">
                  <RotateCcw className="h-5 w-5 text-muted-foreground" />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="px-6 py-20 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {t("home.cta.title")}
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t("home.cta.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <HeroCTA />
            <Link href="/courses">
              <Button size="lg" variant="outline" className="px-8 border-2">
                {t("home.cta.exploreCourses")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer - Improved */}
      <footer className="bg-muted/80 border-t border-border px-6 py-16 mt-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                  <Image
                    src="/images/logos/logohanabi.png"
                    alt="HanabiHub Logo"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <span className="font-bold text-lg text-foreground">
                  HanabiHub
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {t("home.footer.tagline")}
              </p>
            </div>

            {/* Links 1 */}
            <div>
              <h3 className="font-semibold mb-4">{t("home.footer.courses")}</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/courses"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {t("home.footer.allCourses")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/courses?level=Beginner"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {t("home.footer.beginner")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/courses?level=Intermediate"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {t("home.footer.intermediate")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/courses?level=Advanced"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {t("home.footer.advanced")}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Links 2 */}
            <div>
              <h3 className="font-semibold mb-4">
                {t("home.footer.features")}
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/flashcards"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Flashcards
                  </Link>
                </li>
                <li>
                  <Link
                    href="/ai-practice"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    AI Practice
                  </Link>
                </li>
                <li>
                  <Link
                    href="/community"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {t("home.footer.community")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/call/random"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {t("home.footer.speaking")}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Links 3 */}
            <div>
              <h3 className="font-semibold mb-4">{t("home.footer.support")}</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/about"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {t("home.footer.about")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {t("home.footer.contact")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {t("home.footer.privacy")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {t("home.footer.terms")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground text-center md:text-left">
                {t("home.footer.copyright")}
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Award className="h-4 w-4 text-primary" />
                  <span>{t("home.footer.stats.satisfaction")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4 text-primary" />
                  <span>{t("home.footer.stats.students")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
