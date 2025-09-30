"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { withAuth } from "@/components/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Play,
  Users,
  User,
  Shield,
  BookOpen,
  Clock,
  Star,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { AddNewModal } from "@/components/flashcard/AddNewModal";
import Link from "next/link";

// demo data
const flashcardSets = [
  {
    id: 1,
    title: "Basic Kanji Characters",
    description: "Learn fundamental kanji characters used in daily life",
    cardCount: 50,
    category: "admin",
    type: "flashlist",
    difficulty: "N5",
    studyTime: "15 min",
    rating: 4.8,
    thumbnail: "/japanese-kanji-characters-traditional-calligraphy.png",
    author: "Admin",
    lastUpdated: "2 days ago",
  },
  {
    id: 2,
    title: "Essential Greetings",
    description: "Master common Japanese greetings and polite expressions",
    cardCount: 25,
    category: "mine",
    type: "flashcard",
    difficulty: "N5",
    studyTime: "10 min",
    rating: 4.9,
    thumbnail: "/japanese-hiragana-characters-colorful-illustration.png",
    author: "You",
    lastUpdated: "Today",
  },
];

const categoryConfig = {
  admin: {
    label: "Official",
    icon: Shield,
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  others: {
    label: "Community",
    icon: Users,
    color: "bg-green-100 text-green-800 border-green-200",
  },
  mine: {
    label: "My Sets",
    icon: User,
    color: "bg-orange-100 text-orange-800 border-orange-200",
  },
};

function FlashcardsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedType, setSelectedType] = useState<"flashcard" | "flashlist">(
    "flashlist"
  );
  const [openModal, setOpenModal] = useState(false);

  const filteredSets = flashcardSets.filter((set) => {
    const matchesSearch =
      set.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      set.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || set.category === selectedCategory;
    const matchesLevel =
      selectedLevel === "all" || set.difficulty === selectedLevel;
    const matchesType = set.type === selectedType;

    return matchesSearch && matchesCategory && matchesLevel && matchesType;
  });

  const getCategoryIcon = (category: string) => {
    const config = categoryConfig[category as keyof typeof categoryConfig];
    const IconComponent = config.icon;
    return <IconComponent className="h-3 w-3" />;
  };

  const getCategoryStyle = (category: string) => {
    return (
      categoryConfig[category as keyof typeof categoryConfig]?.color ||
      "bg-gray-100 text-gray-800"
    );
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Thanh switcher bên phải */}
      <div className="fixed top-1/2 right-[15px] -translate-y-1/2 z-50 flex flex-col">
        <button
          onClick={() => setSelectedType("flashcard")}
          className={`w-12 h-14 bg-primary text-white font-bold text-sm shadow-md transition
      rounded-tl-2xl
      ${
        selectedType === "flashcard"
          ? "opacity-80 shadow-inner"
          : "hover:bg-primary/90"
      }
    `}
        >
          <span className="block rotate-90">CARD</span>
        </button>
        <button
          onClick={() => setSelectedType("flashlist")}
          className={`w-12 h-14 bg-primary text-white font-bold text-sm shadow-md transition
      rounded-bl-2xl
      ${
        selectedType === "flashlist"
          ? "opacity-80 shadow-inner"
          : "hover:bg-primary/90"
      }
    `}
        >
          <span className="block rotate-90">SETS</span>
        </button>
      </div>

      {/* Header: Search + Filters */}
      <div className="p-6 border-b border-border">
        <div className="max-w-6xl mx-auto flex flex-col gap-4">
          <h1 className="text-2xl font-bold">Flashcards & Sets</h1>
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
            {/* Nút tạo mới */}
            <Button
              variant="outline"
              className="border-2 border-dashed border-primary text-primary w-full lg:w-auto"
              onClick={() => setOpenModal(true)}
            >
              + Tạo mới
            </Button>
            <AddNewModal open={openModal} onClose={() => setOpenModal(false)} />

            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Bộ lọc */}
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Bộ lọc" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="mine">Của tôi</SelectItem>
                <SelectItem value="others">Cộng đồng</SelectItem>
              </SelectContent>
            </Select>

            {/* Level */}
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Cấp độ</SelectItem>
                <SelectItem value="N5">N5</SelectItem>
                <SelectItem value="N4">N4</SelectItem>
                <SelectItem value="N3">N3</SelectItem>
                <SelectItem value="N2">N2</SelectItem>
                <SelectItem value="N1">N1</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-xl font-semibold">
            {selectedType === "flashcard" ? "Flashcards" : "Flash Sets"}
          </h2>
          <span className="text-sm text-muted-foreground">
            {filteredSets.length}{" "}
            {selectedType === "flashcard" ? "cards" : "sets"} found
          </span>
        </div>
        <div className="max-w-6xl mx-auto">
          {filteredSets.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Không tìm thấy kết quả
              </h3>
              <p className="text-muted-foreground">
                Thử thay đổi từ khoá hoặc bộ lọc
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSets.map((set) => (
                <Card
                  key={set.id}
                  className="group hover:shadow-lg transition-all duration-200 cursor-pointer"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <Badge
                        variant="outline"
                        className={`text-xs ${getCategoryStyle(
                          set.category
                        )} flex items-center gap-1`}
                      >
                        {getCategoryIcon(set.category)}
                        {
                          categoryConfig[
                            set.category as keyof typeof categoryConfig
                          ]?.label
                        }
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {set.difficulty}
                      </Badge>
                    </div>
                    <div className="aspect-video bg-muted rounded-lg mb-3 overflow-hidden">
                      <img
                        src={set.thumbnail || "/placeholder.svg"}
                        alt={set.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    <CardTitle className="text-lg line-clamp-2">
                      {set.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {set.description}
                    </p>

                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {set.cardCount} cards
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {set.studyTime}
                        </span>
                        {set.rating > 0 && (
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {set.rating}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        <p>by {set.author}</p>
                        <p>{set.lastUpdated}</p>
                      </div>
                      <Link href={`/flashcards/practice/${set.id}`}>
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90"
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Study
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="pb-10">
        <div className="max-w-6xl mx-auto">
          <Pagination>
            <PaginationContent>
              <PaginationPrevious>
                <PaginationLink>Trước</PaginationLink>
              </PaginationPrevious>
              <PaginationItem>
                <PaginationLink isActive href="#">
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationEllipsis />
              <PaginationItem>
                <PaginationLink href="#">8</PaginationLink>
              </PaginationItem>
              <PaginationNext>
                <PaginationLink>Sau</PaginationLink>
              </PaginationNext>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}

export default withAuth(FlashcardsPage);
