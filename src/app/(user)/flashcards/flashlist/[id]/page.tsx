"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import {
  useGetFlashListByIdQuery,
  useUpdateFlashListMutation,
  useRateFlashListMutation,
} from "@/store/services/flashcardApi";
import { LoadingSpinner } from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Star,
  ChevronLeft,
  ChevronRight,
  Edit,
  Save,
  X,
  Camera,
  Search,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import styles from "./page.module.css";
import "./animations.css";

interface FlashcardFanDetailProps {}

const FlashcardFanDetail: React.FC<FlashcardFanDetailProps> = () => {
  const params = useParams();
  const flashlistId = params.id as string;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedThumbnail, setEditedThumbnail] = useState("");
  const [editedLevel, setEditedLevel] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect dark mode
  React.useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };
    checkDarkMode();

    // Watch for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const currentUser = useSelector((state: RootState) => state.auth.user);

  const {
    data: flashlistData,
    isLoading,
    error,
  } = useGetFlashListByIdQuery(flashlistId);
  const [updateFlashList, { isLoading: isUpdating }] =
    useUpdateFlashListMutation();
  const [rateFlashList, { isLoading: isRating }] = useRateFlashListMutation();

  // Set user's existing rating from ratings array
  React.useEffect(() => {
    if (currentUser && flashlistData?.data?.ratings) {
      const existingRating = flashlistData.data.ratings.find(
        (r) => r.user === currentUser._id
      );
      if (existingRating) {
        setUserRating(existingRating.rating);
      } else {
        setUserRating(0);
      }
    }
  }, [flashlistData?.data?.ratings, currentUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !flashlistData?.success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Không tìm thấy Flashlist
          </h2>
          <p className="text-muted-foreground">
            Vui lòng kiểm tra lại đường dẫn
          </p>
        </div>
      </div>
    );
  }

  const flashlist = flashlistData.data;
  const flashcards = flashlist.flashcards || [];
  const validFlashcards = flashcards.filter(
    (flashcard) => typeof flashcard === "object" && flashcard !== null
  );

  // Check if user has already rated
  const hasUserRated =
    currentUser && flashlist.ratings?.some((r) => r.user === currentUser._id);

  const isOwner =
    currentUser &&
    typeof flashlist.user === "object" &&
    currentUser._id === flashlist.user._id;

  const handleEditClick = () => {
    if (!isEditing) {
      setEditedTitle(flashlist.title);
      setEditedDescription(flashlist.description || "");
      setEditedThumbnail(flashlist.thumbnail || "");
      setEditedLevel(flashlist.level);
    }
    setIsEditing(!isEditing);
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const previewUrl = URL.createObjectURL(file);
      setEditedThumbnail(previewUrl);
    }
  };

  const handleSave = async () => {
    try {
      const updateData: any = {
        title: editedTitle,
        level: editedLevel,
      };

      if (thumbnailFile) {
        updateData.thumbnail = editedThumbnail;
      }

      await updateFlashList({
        id: flashlistId,
        data: updateData,
      }).unwrap();
      setIsEditing(false);
      setThumbnailFile(null);
    } catch (error) {
      console.error("Failed to update flashlist:", error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedTitle(flashlist.title);
    setEditedDescription(flashlist.description || "");
    setEditedThumbnail(flashlist.thumbnail || "");
    setEditedLevel(flashlist.level);
    setThumbnailFile(null);

    if (thumbnailFile && editedThumbnail.startsWith("blob:")) {
      URL.revokeObjectURL(editedThumbnail);
    }
  };

  const getLevelColor = (level: string) => {
    const levelColors = {
      N5: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
      N4: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800",
      N3: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
      N2: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
      N1: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
    };
    return (
      levelColors[level as keyof typeof levelColors] ||
      "bg-muted text-muted-foreground border-border"
    );
  };

  const handleRatingClick = (rating: number) => {
    // Chỉ set state để preview, chưa submit
    setUserRating(rating);
  };

  const handleSubmitRating = async () => {
    if (!currentUser || userRating === 0) return;

    try {
      await rateFlashList({ id: flashlistId, rating: userRating }).unwrap();
    } catch (error: any) {
      // Revert on error
      const existingRating = flashlist.ratings?.find(
        (r) => r.user === currentUser._id
      );
      setUserRating(existingRating?.rating || 0);
    }
  };

  const itemsPerPage = 5;
  const totalPages = Math.ceil(validFlashcards.length / itemsPerPage);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
  };

  const visibleCards = validFlashcards.slice(
    currentSlide * itemsPerPage,
    (currentSlide + 1) * itemsPerPage
  );

  return (
    <div className="min-h-screen lg:h-screen bg-gradient-to-br from-background via-background/95 to-muted/20 overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-4">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-card via-card/95 to-card/90 border border-border/50 rounded-2xl p-6 lg:p-8 shadow-xl backdrop-blur-sm">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              {/* Left Section */}
              <div className="flex-1 space-y-4 lg:space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full overflow-hidden flex-shrink-0 border-4 border-primary/20 ring-4 ring-primary/10 shadow-lg">
                    <img
                      src={
                        (typeof flashlist.user === "object"
                          ? flashlist.user.avatar
                          : null) || "/images/placeholders/placeholder-user.jpg"
                      }
                      alt={
                        typeof flashlist.user === "object"
                          ? flashlist.user.fullname
                          : "User"
                      }
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg lg:text-xl font-bold text-foreground">
                      {typeof flashlist.user === "object"
                        ? flashlist.user.fullname
                        : "Unknown User"}
                    </h2>
                    <p className="text-sm lg:text-base text-muted-foreground">
                      @
                      {typeof flashlist.user === "object"
                        ? flashlist.user.username
                        : "unknown"}
                    </p>
                  </div>

                  {isOwner && (
                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={handleSave}
                            disabled={isUpdating}
                            className="shadow-lg hover:shadow-xl transition-all"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Lưu
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancel}
                            disabled={isUpdating}
                            className="shadow-lg hover:shadow-xl transition-all"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Hủy
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={handleEditClick}
                          className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Sửa
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  {isEditing ? (
                    <div className="space-y-3">
                      <Input
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        className="text-2xl lg:text-3xl font-bold h-auto py-3 border-2 focus:border-primary shadow-lg"
                        placeholder="Tiêu đề flashlist"
                      />
                      <Select
                        value={editedLevel}
                        onValueChange={setEditedLevel}
                      >
                        <SelectTrigger className="w-32 shadow-lg">
                          <SelectValue placeholder="Chọn level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="N5">N5</SelectItem>
                          <SelectItem value="N4">N4</SelectItem>
                          <SelectItem value="N3">N3</SelectItem>
                          <SelectItem value="N2">N2</SelectItem>
                          <SelectItem value="N1">N1</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-foreground mb-3 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                        {flashlist.title}
                      </h1>
                      <Badge
                        className={`${getLevelColor(
                          flashlist.level
                        )} text-sm px-3 py-1 shadow-lg`}
                      >
                        {flashlist.level}
                      </Badge>
                    </>
                  )}
                </div>

                <div className="bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl p-4 lg:p-5 border border-border/50 shadow-inner">
                  {isEditing ? (
                    <Textarea
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      className="min-h-[80px] text-base border-2 focus:border-primary shadow-lg"
                      placeholder="Mô tả flashlist"
                    />
                  ) : (
                    <p className="text-base text-muted-foreground leading-relaxed">
                      {flashlist.description || "Chưa có mô tả"}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRatingClick(star)}
                        onMouseEnter={() => setHoveredStar(star)}
                        onMouseLeave={() => setHoveredStar(0)}
                        className="transition-all hover:scale-125 active:scale-110"
                      >
                        <Star
                          className={`w-6 h-6 lg:w-7 lg:h-7 transition-all ${
                            star <=
                            (hoveredStar ||
                              userRating ||
                              flashlist.averageRating ||
                              0)
                              ? "text-yellow-400 fill-yellow-400 drop-shadow-lg"
                              : "text-gray-300 dark:text-gray-600"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <Button
                    variant="default"
                    size="default"
                    onClick={handleSubmitRating}
                    disabled={isRating || !currentUser || userRating === 0}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRating
                      ? "Đang xử lý..."
                      : hasUserRated
                      ? "Đánh giá lại"
                      : "Đánh giá"}
                  </Button>
                </div>

                <div className="flex items-center gap-6 text-base text-muted-foreground bg-gradient-to-r from-muted/30 to-muted/20 rounded-xl p-4 border border-border/30 shadow-inner">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xl text-foreground">
                      {(flashlist.averageRating || 0).toFixed(1)}
                    </span>
                    <span>({flashlist.ratings?.length || 0} đánh giá)</span>
                  </div>
                  <div className="w-px h-6 bg-border"></div>
                  <div>
                    <span className="font-bold text-xl text-foreground">
                      {validFlashcards.length}
                    </span>{" "}
                    flashcards
                  </div>
                </div>
              </div>

              {/* Right Section - Thumbnail với fixed height */}
              <div className="lg:w-80 xl:w-96">
                <div className="space-y-4">
                  {/* Thumbnail với overlay luôn render */}
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border-2 border-border shadow-2xl bg-gradient-to-br from-muted/20 to-muted/40 group/thumb">
                    <img
                      src={
                        isEditing && editedThumbnail
                          ? editedThumbnail
                          : flashlist.thumbnail ||
                            "/images/placeholders/placeholder.jpg"
                      }
                      alt={flashlist.title}
                      className="w-full h-full object-cover"
                    />

                    {/* Overlay - luôn có trong DOM */}
                    <div
                      className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity duration-300 ${
                        isEditing
                          ? "opacity-0 group-hover/thumb:opacity-100"
                          : "opacity-0 pointer-events-none"
                      }`}
                    >
                      <label
                        htmlFor="thumbnail-upload"
                        className="cursor-pointer"
                      >
                        <div className="bg-primary text-primary-foreground p-4 rounded-full shadow-2xl hover:scale-110 transition-transform">
                          <Camera className="w-6 h-6" />
                        </div>
                        <input
                          id="thumbnail-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleThumbnailChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Search Section - luôn có trong DOM với fixed space */}
                  <div
                    className={`transition-all duration-300 ${
                      isEditing
                        ? "opacity-100 h-auto"
                        : "opacity-0 h-0 overflow-hidden pointer-events-none"
                    }`}
                  >
                    <div className="bg-card border border-border rounded-xl p-4 shadow-lg">
                      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Search className="w-4 h-4" />
                        Thêm Flashcard
                      </h3>
                      <div className="space-y-3">
                        <div className="relative">
                          <Input
                            placeholder="Tìm kiếm flashcard để thêm..."
                            className="pr-10"
                          />
                          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        </div>
                        <Button size="sm" variant="outline" className="w-full">
                          <Plus className="w-4 h-4 mr-2" />
                          Thêm vào list
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Flashcards Section */}
          <div className="bg-gradient-to-r from-card via-card/95 to-card/90 border border-border/50 rounded-2xl p-6 lg:p-8 shadow-xl backdrop-blur-sm">
            <h2 className="text-xl lg:text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-primary to-primary/60 rounded-full"></div>
              Danh sách Flashcards
            </h2>

            {validFlashcards.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground bg-gradient-to-r from-muted/20 to-muted/10 rounded-xl border border-dashed border-border">
                <p className="text-xl font-medium">Chưa có flashcard nào</p>
                <p className="text-sm mt-2">Thêm flashcard để bắt đầu học!</p>
              </div>
            ) : (
              <div className="relative">
                {/* Navigation Buttons */}
                {totalPages > 1 && (
                  <>
                    <button
                      onClick={handlePrev}
                      className="absolute -left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-xl"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={handleNext}
                      className="absolute -right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-xl"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}

                {/* Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                  {visibleCards.map((flashcard, index) => (
                    <Link
                      key={flashcard._id || index}
                      href={`/flashcards/practice/${flashcard._id}`}
                      className="block group/card"
                    >
                      <div className="relative h-full transition-transform duration-300 hover:-translate-y-2 hover:z-50">
                        <Card
                          className={`${styles.cardAnimation} h-full rounded-2xl cursor-pointer shadow-lg hover:shadow-2xl transition-all`}
                          style={
                            {
                              "--card-content-bg": isDarkMode
                                ? "linear-gradient(135deg, rgb(31 41 55) 0%, rgb(55 65 81) 50%, rgb(31 41 55) 100%)"
                                : "linear-gradient(135deg, rgb(243 244 246) 0%, rgb(249 250 251) 50%, rgb(243 244 246) 100%)",
                            } as React.CSSProperties
                          }
                        >
                          <CardContent className="p-0 h-full flex flex-col">
                            <div className="aspect-[4/3] relative overflow-hidden">
                              <img
                                src={
                                  flashcard.thumbnail ||
                                  "/images/placeholders/placeholder.jpg"
                                }
                                alt={flashcard.name}
                                className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
                              <div className="absolute top-3 right-3">
                                <Badge
                                  className={`text-xs ${getLevelColor(
                                    flashcard.level
                                  )} shadow-lg`}
                                >
                                  {flashcard.level}
                                </Badge>
                              </div>
                            </div>
                            <div className="p-4 flex-1 flex flex-col justify-between">
                              <div>
                                <h3 className="font-bold text-base text-foreground line-clamp-2 mb-2 group-hover/card:text-primary transition-colors">
                                  {flashcard.name}
                                </h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                  {flashcard.description || "Chưa có mô tả"}
                                </p>
                              </div>
                              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                <p className="text-sm font-semibold">
                                  {flashcard.cards?.length || 0} cards
                                </p>
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover/card:bg-primary transition-colors">
                                  <ChevronRight className="w-4 h-4 text-primary group-hover/card:text-primary-foreground" />
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    {Array.from({ length: totalPages }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`h-2 rounded-full transition-all ${
                          index === currentSlide
                            ? "bg-primary w-8"
                            : "bg-muted-foreground/30 w-2 hover:bg-muted-foreground/60"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardFanDetail;
