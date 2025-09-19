"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, MessageCircle, RotateCcw } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useLanguage } from "@/lib/language-context";

// ImageWithSkeleton: Hiển thị skeleton + LQIP cho ảnh
type ImageWithSkeletonProps = {
  src: string;
  alt: string;
  lqip: string;
  className?: string;
};
import Image from "next/image";
 


export default function HomePage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="px-6 py-16 md:py-24 bg-gradient-to-b from-primary/10 to-primary/5 relative"
        style={{
          backgroundImage: "url('/images/backgrounds/japan-1.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            {t("home.hero.title")}
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t("home.hero.subtitle")}
          </p>
          <Link href="/login">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg"
            >
              {t("home.hero.cta")}
            </Button>
          </Link>
        </div>
      </section>

      {/* Course Cards Section */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t("home.courses.title")}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Image
                  src="/images/japanese/japanese-hiragana-characters-colorful-illustration.png"
                  alt="Hiragana Course"
                  width={400}
                  height={192}
                  placeholder="blur"
                  blurDataURL="/images/placeholders/placeholder.jpg"
                  className="w-full h-48 object-cover rounded-lg mb-4"
                  priority
                />
                <CardTitle>{t("home.courses.hiragana.title")}</CardTitle>
                <CardDescription>
                  {t("home.courses.hiragana.desc")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{t("home.courses.level.beginner")}</Badge>
                  <Button className="bg-primary hover:bg-primary/90">
                    {t("home.courses.enroll")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Image
                  src="/images/japanese/japanese-katakana-characters-modern-design.png"
                  alt="Katakana Course"
                  width={400}
                  height={192}
                  placeholder="blur"
                  blurDataURL="/images/placeholders/placeholder.jpg"
                  className="w-full h-48 object-cover rounded-lg mb-4"
                  priority
                />
                <CardTitle>{t("home.courses.katakana.title")}</CardTitle>
                <CardDescription>
                  {t("home.courses.katakana.desc")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{t("home.courses.level.beginner")}</Badge>
                  <Button className="bg-primary hover:bg-primary/90">
                    {t("home.courses.enroll")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Image
                  src="/images/japanese/japanese-kanji-characters-traditional-calligraphy.png"
                  alt="Kanji Course"
                  width={400}
                  height={192}
                  placeholder="blur"
                  blurDataURL="/images/placeholders/placeholder.jpg"
                  className="w-full h-48 object-cover rounded-lg mb-4"
                  priority
                />
                <CardTitle>{t("home.courses.kanji.title")}</CardTitle>
                <CardDescription>
                  {t("home.courses.kanji.desc")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{t("home.courses.level.intermediate")}</Badge>
                  <Button className="bg-primary hover:bg-primary/90">
                    {t("home.courses.enroll")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Community Preview Section */}
      <section className="bg-muted/30 px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t("home.community.title")}
          </h2>
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src="/images/avatars/anime-style-avatar-girl.png" />
                    <AvatarFallback>SK</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">SakuraKid</span>
                      <Badge variant="outline" className="text-xs">N4 {t("home.community.level")}</Badge>
                    </div>
                    <p className="text-muted-foreground mb-3">
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

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src="/images/avatars/anime-style-avatar-boy.png" />
                    <AvatarFallback>TM</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">TokyoMaster</span>
                      <Badge variant="outline" className="text-xs">N2 {t("home.community.level")}</Badge>
                    </div>
                    <p className="text-muted-foreground mb-3">
                      {t("home.community.post2")} 🎌
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

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src="/images/avatars/anime-style-avatar-woman.png" />
                    <AvatarFallback>YL</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">YukiLearner</span>
                      <Badge variant="outline" className="text-xs">N5 {t("home.community.level")}</Badge>
                    </div>
                    <p className="text-muted-foreground mb-3">
                      {t("home.community.post3")} ありがとうございます！
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
          <div className="text-center mt-8">
            <Link href="/community">
              <Button variant="outline" size="lg">
                {t("home.community.viewAll")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Flashcards Demo Section */}
      <section className="px-6 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">{t("flashcards.title")}</h2>
          <Card className="relative mx-auto w-80 h-48 cursor-pointer group">
            <CardContent className="flex items-center justify-center h-full p-8 group-hover:hidden">
              <div className="text-center">
                <div className="text-6xl font-bold text-primary mb-2">水</div>
                <p className="text-sm text-muted-foreground">{t("home.flashcards.click")}</p>
              </div>
            </CardContent>
            <CardContent className="hidden group-hover:flex items-center justify-center h-full p-8 bg-primary/5">
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground mb-2">
                  みず / mizu
                </div>
                <p className="text-lg text-muted-foreground">water</p>
              </div>
            </CardContent>
            <div className="absolute top-4 right-4">
              <RotateCcw className="h-5 w-5 text-muted-foreground" />
            </div>
          </Card>
          <div className="mt-8">
            <Link href="/flashcards">
              <Button className="bg-primary hover:bg-primary/90" size="lg">
                {t("flashcards.start")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 px-6 py-12 mt-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  日
                </span>
              </div>
              <span className="font-semibold text-foreground">JapanLearn</span>
            </div>
            <div className="flex gap-6 text-sm">
              <Link
                href="/about"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("footer.about")}
              </Link>
              <Link
                href="/contact"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("footer.contact")}
              </Link>
              <Link
                href="/privacy"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("footer.privacy")}
              </Link>
            </div>
          </div>
          <div className="text-center mt-8 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">{t("footer.copyright")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
