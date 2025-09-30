"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { withAuth } from "@/components/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  useGetAllFlashListsQuery,
  useSearchFlashListQuery,
  useGetAllFlashCardsQuery,
  useSearchFlashCardQuery
} from "@/store/services/flashcardApi";
import { IFlashList, IFlashCard, IUser } from "@/types/flashcard";
import { LoadingSpinner } from "@/components/loading";
import { useDebounce } from "@/hooks/useDebounce";
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

// Helper function để format thời gian
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return "Hôm nay";
  if (diffInDays === 1) return "Hôm qua";
  if (diffInDays < 7) return `${diffInDays} ngày trước`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} tuần trước`;
  return date.toLocaleDateString("vi-VN");
};

// Helper function để tính thời gian học dự kiến
const estimateStudyTime = (cardCount: number) => {
  const minutes = Math.ceil(cardCount * 0.3); // Giả sử mỗi card mất ~18 giây
  if (minutes < 60) return `${minutes} phút`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

const categoryConfig = {
  others: {
    label: "Cộng đồng",
    icon: Users,
    color: "bg-green-100 text-green-800 border-green-200",
  },
  mine: {
    label: "Của tôi",
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
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20;

  // Ref để scroll to top
  const contentTopRef = useRef<HTMLDivElement>(null);

  // Debounce search query - chỉ gọi API sau 500ms người dùng dừng gõ
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Kiểm tra xem có đang search không - ổn định với useMemo
  const isSearching = useMemo(() => {
    return debouncedSearchQuery.trim().length > 0;
  }, [debouncedSearchQuery]);

  // Map selectedCategory sang format BE (select) - ổn định với useMemo
  const selectParam = useMemo(() => {
    return selectedCategory === "mine" ? "me" : selectedCategory === "others" ? "other" : "all";
  }, [selectedCategory]);

  // Fetch FlashList data
  const { data: allListData, isLoading: isLoadingAllList, isError: isErrorAllList, refetch: refetchAllList } = useGetAllFlashListsQuery(
    {
      page: currentPage,
      limit,
    },
    {
      skip: isSearching || selectedType === "flashcard", // Skip nếu đang search hoặc đang xem flashcard
    }
  );

  const { data: searchListData, isLoading: isLoadingSearchList, isError: isErrorSearchList, refetch: refetchSearchList } = useSearchFlashListQuery(
    {
      q: debouncedSearchQuery,
      level: selectedLevel as any,
      select: selectParam as any,
      page: currentPage,
      limit,
    },
    {
      skip: !isSearching || selectedType === "flashcard", // Chỉ gọi nếu có search query và đang xem flashlist
    }
  );

  // Fetch FlashCard data
  const { data: allCardData, isLoading: isLoadingAllCard, isError: isErrorAllCard, refetch: refetchAllCard } = useGetAllFlashCardsQuery(
    {
      page: currentPage,
      limit,
    },
    {
      skip: isSearching || selectedType === "flashlist", // Skip nếu đang search hoặc đang xem flashlist
    }
  );

  const { data: searchCardData, isLoading: isLoadingSearchCard, isError: isErrorSearchCard, refetch: refetchSearchCard } = useSearchFlashCardQuery(
    {
      q: debouncedSearchQuery,
      level: selectedLevel as any,
      select: selectParam as any,
      page: currentPage,
      limit,
    },
    {
      skip: !isSearching || selectedType === "flashlist", // Chỉ gọi nếu có search query và đang xem flashcard
    }
  );

  // Chọn data từ API nào đang active - ổn định với useMemo
  const { data, isLoading, isError, refetch } = useMemo(() => {
    if (selectedType === "flashlist") {
      if (isSearching) {
        return {
          data: searchListData,
          isLoading: isLoadingSearchList,
          isError: isErrorSearchList,
          refetch: refetchSearchList,
        };
      }
      return {
        data: allListData,
        isLoading: isLoadingAllList,
        isError: isErrorAllList,
        refetch: refetchAllList,
      };
    } else {
      // selectedType === "flashcard"
      if (isSearching) {
        return {
          data: searchCardData,
          isLoading: isLoadingSearchCard,
          isError: isErrorSearchCard,
          refetch: refetchSearchCard,
        };
      }
      return {
        data: allCardData,
        isLoading: isLoadingAllCard,
        isError: isErrorAllCard,
        refetch: refetchAllCard,
      };
    }
  }, [
    selectedType,
    isSearching,
    searchListData, isLoadingSearchList, isErrorSearchList, refetchSearchList,
    allListData, isLoadingAllList, isErrorAllList, refetchAllList,
    searchCardData, isLoadingSearchCard, isErrorSearchCard, refetchSearchCard,
    allCardData, isLoadingAllCard, isErrorAllCard, refetchAllCard,
  ]);

  // Scroll to top khi đổi trang hoặc khi bắt đầu search
  useEffect(() => {
    if (contentTopRef.current) {
      contentTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [currentPage]);

  // Reset trang về 1 khi thay đổi bộ lọc hoặc search - chỉ khi thực sự cần
  useEffect(() => {
    // Chỉ reset khi search query thay đổi (không phải khi đang typing)
    if (debouncedSearchQuery !== searchQuery) return; // Đang debounce, chưa reset

    setCurrentPage(1);
  }, [debouncedSearchQuery, selectedCategory, selectedLevel]);

  // Reset category khi chuyển đổi giữa FlashList và FlashCard
  useEffect(() => {
    if (selectedType === "flashcard" && selectedCategory === "others") {
      setSelectedCategory("all"); // FlashCard không có "others"
    }
  }, [selectedType, selectedCategory]);

  // Thêm state để track việc đang typing
  const isTyping = searchQuery !== debouncedSearchQuery;

  // Transform API data sang format UI - hỗ trợ cả FlashList và FlashCard
  const allItems = useMemo(() => {
    if (!data?.data) return [];

    // Nếu đang search, data.results là mảng kết quả
    if (isSearching && 'results' in data.data) {
      const results = data.data.results as (IFlashList | IFlashCard)[];
      return results.map((item) => {
        const isOwner = selectedCategory === "mine";

        if (selectedType === "flashlist") {
          const list = item as IFlashList;
          return {
            ...list,
            category: isOwner ? ("mine" as const) : ("others" as const),
            type: "flashlist" as const,
            cardCount: Array.isArray(list.flashcards) ? list.flashcards.length : 0,
            author: typeof list.user === "object" ? list.user.fullname : "Unknown",
          };
        } else {
          // FlashCard
          const card = item as IFlashCard;
          return {
            ...card,
            category: "mine" as const, // FlashCard chỉ có của user
            type: "flashcard" as const,
            cardCount: Array.isArray(card.cards) ? card.cards.length : 0,
            author: "Bạn",
          };
        }
      });
    }

    // Nếu không search
    if (selectedType === "flashlist") {
      // FlashList data có publicLists và myLists
      if ('publicLists' in data.data && 'myLists' in data.data) {
        const { publicLists, myLists } = data.data;

        // Map public lists
        const transformedPublicLists = publicLists.map((list) => ({
          ...list,
          category: "others" as const,
          type: "flashlist" as const,
          cardCount: Array.isArray(list.flashcards) ? list.flashcards.length : 0,
          author: typeof list.user === "object" ? list.user.fullname : "Unknown",
        }));

        // Map my lists
        const transformedMyLists = myLists.map((list) => ({
          ...list,
          category: "mine" as const,
          type: "flashlist" as const,
          cardCount: Array.isArray(list.flashcards) ? list.flashcards.length : 0,
          author: "Bạn",
        }));

        return [...transformedMyLists, ...transformedPublicLists];
      }
    } else {
      // FlashCard data có flashCards
      if ('flashCards' in data.data) {
        const { flashCards } = data.data;
        return flashCards.map((card) => ({
          ...card,
          category: "mine" as const, // FlashCard chỉ có của user
          type: "flashcard" as const,
          cardCount: Array.isArray(card.cards) ? card.cards.length : 0,
          author: "Bạn",
        }));
      }
    }

    return [];
  }, [data, isSearching, selectedCategory, selectedType]);

  // Nếu đang search, không cần filter client-side vì BE đã filter
  // Nếu không search, vẫn filter theo category và level
  const filteredSets = useMemo(() => {
    if (isSearching) {
      // BE đã filter, chỉ cần filter theo type
      return allItems.filter((item) => item.type === selectedType);
    }

    // Client-side filter khi không search
    return allItems.filter((item) => {
    const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;
    const matchesLevel =
        selectedLevel === "all" || item.level === selectedLevel;
      const matchesType = item.type === selectedType;

      return matchesCategory && matchesLevel && matchesType;
    });
  }, [allItems, isSearching, selectedCategory, selectedLevel, selectedType]);

  // Pagination calculations
  const totalPages = useMemo(() => {
    if (!data?.data?.pagination) return 0;

    const pagination = data.data.pagination;

    // Nếu đang search, lấy từ search response
    if (isSearching) {
      return 'totalPages' in pagination ? pagination.totalPages : 0;
    }

    // Nếu không search, lấy max của publicPages và myPages
    if ('totalPublicPages' in pagination && 'totalMyPages' in pagination) {
      return Math.max(pagination.totalPublicPages || 0, pagination.totalMyPages || 0);
    }

    return 0;
  }, [data, isSearching]);

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Hiển thị tất cả pages nếu ít hơn maxVisiblePages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Luôn hiển thị trang đầu
      pages.push(1);

      if (currentPage > 3) {
        pages.push("ellipsis");
      }

      // Hiển thị các trang xung quanh trang hiện tại
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("ellipsis");
      }

      // Luôn hiển thị trang cuối
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Có lỗi xảy ra</h3>
          <p className="text-muted-foreground mb-4">
            Không thể tải dữ liệu. Vui lòng thử lại.
          </p>
          <Button onClick={() => refetch()}>Thử lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Scroll anchor */}
      <div ref={contentTopRef} className="absolute top-0" />
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
                placeholder="Tìm kiếm flashcard..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {/* Loading indicator khi đang debounce */}
              {isTyping && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                </div>
              )}
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
                {selectedType === "flashlist" && (
                <SelectItem value="others">Cộng đồng</SelectItem>
                )}
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
          <div>
          <h2 className="text-xl font-semibold">
            {selectedType === "flashcard" ? "Flashcards" : "Flash Sets"}
          </h2>
            {isSearching && !isTyping && (
              <p className="text-xs text-muted-foreground mt-1">
                Kết quả tìm kiếm cho &quot;{debouncedSearchQuery}&quot;
              </p>
            )}
          </div>
          <span className="text-sm text-muted-foreground">
            {filteredSets.length}{" "}
            {selectedType === "flashcard" ? "cards" : "sets"} tìm thấy
          </span>
        </div>
        <div className="max-w-6xl mx-auto">
          {filteredSets.length === 0 && !isTyping ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {isSearching ? "Không tìm thấy kết quả" : "Chưa có flashcard nào"}
              </h3>
              <p className="text-muted-foreground">
                {isSearching
                  ? "Thử thay đổi từ khoá hoặc bộ lọc"
                  : "Hãy tạo flashcard đầu tiên của bạn"
                }
              </p>
            </div>
          ) : filteredSets.length === 0 && isTyping ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">
                Đang tìm kiếm...
              </h3>
              <p className="text-muted-foreground">
                Vui lòng chờ trong giây lát
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
              {filteredSets.map((set) => (
                <Card
                  key={set._id}
                  className="group hover:shadow-xl hover:shadow-primary/10 dark:hover:shadow-primary/20 hover:-translate-y-1 transition-all duration-300 ease-out cursor-pointer border-border/50 hover:border-primary/30"
                >
                  <CardHeader className="pb-2 p-2 sm:p-3 md:p-4 md:pb-2">
                    <div className="flex items-start justify-between mb-1">
                      <Badge
                        variant="outline"
                        className={`text-[9px] sm:text-[10px] md:text-xs ${getCategoryStyle(
                          set.category
                        )} flex items-center gap-0.5 px-1 sm:px-1.5 py-0.5 group-hover:scale-105 transition-transform duration-300`}
                      >
                        <span className="hidden sm:inline">
                        {getCategoryIcon(set.category)}
                        </span>
                        {
                          categoryConfig[
                            set.category as keyof typeof categoryConfig
                          ]?.label
                        }
                      </Badge>
                      <Badge variant="secondary" className="text-[9px] sm:text-[10px] md:text-xs px-1 sm:px-1.5 py-0.5 group-hover:scale-105 transition-transform duration-300">
                        {set.level}
                      </Badge>
                    </div>
                    <div className="aspect-video bg-muted rounded-lg mb-2 overflow-hidden">
                      <img
                        src={set.thumbnail || "/placeholder.svg"}
                        alt={set.type === "flashlist" ? set.title : set.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                      />
                    </div>
                    <CardTitle className="text-xs sm:text-sm md:text-base line-clamp-2 group-hover:text-primary transition-colors duration-300">
                      {set.type === "flashlist" ? set.title : set.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 p-2 sm:p-3 md:p-4 md:pt-0">
                    <p className="text-[10px] sm:text-xs text-muted-foreground mb-2 line-clamp-2">
                      {set.description || "Chưa có mô tả"}
                    </p>

                    <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-muted-foreground mb-2">
                      <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                        <span className="flex items-center gap-0.5 sm:gap-1">
                          <BookOpen className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
                          <span className="hidden sm:inline">{set.cardCount} cards</span>
                          <span className="sm:hidden">{set.cardCount}</span>
                        </span>
                        <span className="flex items-center gap-0.5 sm:gap-1">
                          <Clock className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
                          {estimateStudyTime(set.cardCount)}
                        </span>
                        {set.type === "flashlist" && set.rating > 0 && (
                          <span className="flex items-center gap-0.5 sm:gap-1">
                            <Star className="h-2 w-2 sm:h-2.5 sm:w-2.5 fill-yellow-400 text-yellow-400" />
                            {set.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-[9px] sm:text-[10px] text-muted-foreground">
                        <p className="truncate max-w-[70px] sm:max-w-none">bởi {set.author}</p>
                        <p className="hidden md:block">{formatDate(set.updatedAt)}</p>
                      </div>
                      <Link href={`/flashcards/practice/${set._id}`}>
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90 h-6 sm:h-7 md:h-8 text-[10px] sm:text-xs px-1.5 sm:px-2 group-hover:scale-105 group-hover:shadow-md transition-all duration-300 ease-out"
                        >
                          <Play className="h-2 w-2 sm:h-2.5 sm:w-2.5 mr-0.5" />
                          <span className="hidden sm:inline">Học</span>
                          <span className="sm:hidden">Học</span>
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
      {totalPages > 1 && (
      <div className="pb-10">
        <div className="max-w-6xl mx-auto">
          <Pagination>
            <PaginationContent>
                {/* Previous Button */}
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={`cursor-pointer ${
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "hover:bg-accent"
                    }`}
                  >
                    <span>Trước</span>
              </PaginationPrevious>
                </PaginationItem>

                {/* Page Numbers */}
                {generatePageNumbers().map((page, index) =>
                  page === "ellipsis" ? (
                    <PaginationItem key={`ellipsis-${index}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => handlePageChange(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                </PaginationLink>
              </PaginationItem>
                  )
                )}

                {/* Next Button */}
              <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={`cursor-pointer ${
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "hover:bg-accent"
                    }`}
                  >
                    <span>Sau</span>
                  </PaginationNext>
              </PaginationItem>
            </PaginationContent>
          </Pagination>

            {/* Pagination Info */}
            <div className="text-center mt-4 text-sm text-muted-foreground">
              Trang {currentPage} / {totalPages}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(FlashcardsPage);
