"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Clock, Users, Star, BookOpen, Filter } from "lucide-react";

const courses = [
  {
    id: 1,
    title: "Hiragana Mastery",
    description:
      "Master all 46 hiragana characters with interactive exercises and mnemonics",
    image: "/japanese-hiragana-characters-colorful-illustration.png",
    level: "Beginner",
    duration: "2 weeks",
    students: 1234,
    rating: 4.8,
    price: "Free",
    category: "Writing System",
    instructor: "Tanaka Sensei",
    lessons: 12,
    isPopular: true,
  },
  {
    id: 2,
    title: "Katakana Essentials",
    description:
      "Learn katakana characters used for foreign words and modern Japanese",
    image: "/japanese-katakana-characters-modern-design.png",
    level: "Beginner",
    duration: "2 weeks",
    students: 987,
    rating: 4.7,
    price: "$29",
    category: "Writing System",
    instructor: "Sato Sensei",
    lessons: 10,
    isPopular: false,
  },
  {
    id: 3,
    title: "Essential Kanji",
    description: "Start your kanji journey with the most common 100 characters",
    image: "/japanese-kanji-characters-traditional-calligraphy.png",
    level: "Intermediate",
    duration: "4 weeks",
    students: 756,
    rating: 4.9,
    price: "$49",
    category: "Writing System",
    instructor: "Yamamoto Sensei",
    lessons: 20,
    isPopular: true,
  },
  {
    id: 4,
    title: "JLPT N5 Grammar",
    description:
      "Complete grammar course for JLPT N5 level with practice tests",
    image: "/japanese-grammar-book-illustration.png",
    level: "Beginner",
    duration: "6 weeks",
    students: 2341,
    rating: 4.6,
    price: "$79",
    category: "Grammar",
    instructor: "Suzuki Sensei",
    lessons: 25,
    isPopular: true,
  },
  {
    id: 5,
    title: "Business Japanese",
    description:
      "Professional Japanese for workplace communication and meetings",
    image: "/japanese-business-meeting.png",
    level: "Advanced",
    duration: "8 weeks",
    students: 432,
    rating: 4.8,
    price: "$129",
    category: "Business",
    instructor: "Watanabe Sensei",
    lessons: 30,
    isPopular: false,
  },
  {
    id: 6,
    title: "Japanese Conversation",
    description: "Practice speaking with native speakers and build confidence",
    image: "/japanese-conversation-practice.png",
    level: "Intermediate",
    duration: "5 weeks",
    students: 1876,
    rating: 4.7,
    price: "$89",
    category: "Speaking",
    instructor: "Kobayashi Sensei",
    lessons: 18,
    isPopular: true,
  },
];

const categories = [
  "All",
  "Writing System",
  "Grammar",
  "Speaking",
  "Business",
  "Culture",
];
const levels = ["All", "Beginner", "Intermediate", "Advanced"];

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || course.category === selectedCategory;
    const matchesLevel =
      selectedLevel === "All" || course.level === selectedLevel;

    return matchesSearch && matchesCategory && matchesLevel;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Discover Japanese Courses
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              From beginner to advanced, find the perfect course for your
              Japanese learning journey
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-4 text-lg rounded-full border-0 shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Filters:
            </span>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={
                  selectedCategory === category
                    ? "bg-orange-500 hover:bg-orange-600"
                    : ""
                }
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Level Filter */}
          <div className="flex flex-wrap gap-2">
            {levels.map((level) => (
              <Button
                key={level}
                variant={selectedLevel === level ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedLevel(level)}
                className={
                  selectedLevel === level
                    ? "bg-orange-500 hover:bg-orange-600"
                    : ""
                }
              >
                {level}
              </Button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            Showing {filteredCourses.length} of {courses.length} courses
          </p>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <Card
              key={course.id}
              className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
            >
              <div className="relative">
                <img
                  src={course.image || "/placeholder.svg"}
                  alt={course.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {course.isPopular && (
                  <Badge className="absolute top-4 left-4 bg-orange-500 hover:bg-orange-600">
                    Popular
                  </Badge>
                )}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-sm font-medium">
                  {course.price}
                </div>
              </div>

              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl mb-2 group-hover:text-orange-500 transition-colors">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                      {course.description}
                    </CardDescription>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500 mt-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{course.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{course.students.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="secondary">{course.level}</Badge>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <BookOpen className="h-4 w-4" />
                    <span>{course.lessons} lessons</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Instructor: {course.instructor}
                </p>
              </CardContent>

              <CardFooter>
                <Link href={`/courses/${course.id}/preview`} className="w-full">
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                    View Course
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <BookOpen className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              No courses found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
