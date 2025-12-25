"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { withAuth } from "@/components/auth";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";
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
import {
  Search,
  Clock,
  Users,
  BookOpen,
  Filter,
  Play,
  ShoppingCart,
  Loader2,
} from "lucide-react";
import { useGetAllCoursesQuery } from "@/store/services/courseApi";
import { LoadingSpinner } from "@/components/loading";

<<<<<<< HEAD
const API_BASE_RAW =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
const API_BASE = API_BASE_RAW.replace(/\/+$/, "");

// localStorage key để theo dõi các course đang “chờ” được ghi nhận đã mua
const LS_PENDING_PURCHASE = "pending_purchase_course_ids_v1";

// ---------- helpers ----------
const formatPrice = (price: number) => {
  if (price === 0) return "Miễn phí";
  return `${price.toLocaleString("vi-VN")} VNĐ`;
};

const estimateDuration = (lessonCount: number) => {
  const weeks = Math.ceil(lessonCount / 3);
  return `${weeks} tuần`;
};

// normalize ObjectId from various shapes
const oidStr = (v: any): string => {
  if (!v) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  if (typeof v === "object" && v.$oid) return String(v.$oid);
  if (typeof v === "object" && v._id) return oidStr(v._id);
  if (typeof v === "object" && v.id) return String(v.id);
  try {
    return String(v);
  } catch {
    return "";
  }
};

const readPendingIds = (): string[] => {
  try {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(LS_PENDING_PURCHASE);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(String).filter(Boolean);
  } catch {
    return [];
  }
};

const writePendingIds = (ids: string[]) => {
  try {
    if (typeof window === "undefined") return;
    const uniq = Array.from(new Set(ids.map(String).filter(Boolean)));
    if (uniq.length === 0) {
      localStorage.removeItem(LS_PENDING_PURCHASE);
      return;
    }
    localStorage.setItem(LS_PENDING_PURCHASE, JSON.stringify(uniq));
  } catch {
    // ignore
  }
};

const addPendingId = (courseId: string) => {
  if (!courseId) return;
  const cur = readPendingIds();
  if (!cur.includes(courseId)) {
    cur.push(courseId);
    writePendingIds(cur);
  }
};

const removePendingId = (courseId: string) => {
  if (!courseId) return;
  const cur = readPendingIds().filter((x) => x !== courseId);
  writePendingIds(cur);
};

// ✅ gọi BE để lấy danh sách courseId user đã mua (Enrollment)
// Bạn cần BE có endpoint, ví dụ: GET /api/v1/enrollments/my
async function fetchMyPurchasedCourseIds(
  signal?: AbortSignal
): Promise<string[]> {
  const url = `${API_BASE}/enrollments/my`;

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
    signal,
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    // 401/403: chưa login hoặc cookie không hợp lệ -> trả về rỗng
    return [];
  }

  const json = await res.json().catch(() => ({} as any));
  const data = (json?.data ?? json) as any;

  if (!Array.isArray(data)) return [];

  // map ra courseId (hỗ trợ thêm vài format phổ biến)
  return data
    .map((x: any) => {
      return (
        oidStr(x?.courseId) ||
        oidStr(x?.course_id) ||
        oidStr(x?.course?._id) ||
        oidStr(x?.course?.id) ||
        oidStr(x?._id) ||
        oidStr(x)
      );
    })
    .filter(Boolean);
}

// ✅ gọi BE để tạo link VNPay
async function createVnpayPayment(courseId: string) {
  let headers: any = { "Content-Type": "application/json" };

  try {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token) headers.Authorization = `Bearer ${token}`;
    }
  } catch {}

  const res = await fetch(`${API_BASE}/payments/vnpay/create`, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify({
      courseId,
      returnUrl: `${window.location.origin}/payment-result`,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || "Tạo thanh toán thất bại");
  return data as { paymentUrl: string; txnRef: string };
}

const categories = [
  "All",
  "Writing System",
  "Grammar",
  "Speaking",
  "Business",
  "Culture",
];
const levels = ["All", "Beginner", "Intermediate", "Advanced"];
=======
// Helper function để format giá - sẽ được định nghĩa trong component để có thể dùng t()
// Helper function để format thời gian học dự kiến - sẽ được định nghĩa trong component để có thể dùng t()

// Helper function để tính rating trung bình
const calculateAverageRating = (
  ratings?: Array<{ user: string; rating: number }>
) => {
  if (!ratings || ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
  return sum / ratings.length;
};

type PriceFilter = "all" | "free" | "paid";
type RatingFilter = "all" | "rated" | "high";
>>>>>>> origin/main

function CoursesPage() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("all");

  // Helper function để format giá
  const formatPrice = (price: number) => {
    if (price === 0) return t("courses.format.free");
    return `${price.toLocaleString("vi-VN")} ${t("courses.format.currency")}`;
  };

  // Helper function để format thời gian học dự kiến
  const estimateDuration = (lessonCount: number) => {
    const weeks = Math.ceil(lessonCount / 3); // Giả sử 3 bài/tuần
    return `${weeks} ${t("courses.format.weeks")}`;
  };

  const [buyingId, setBuyingId] = useState<string | null>(null);

  // ✅ purchased course ids
  const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());
  const [purchasedLoading, setPurchasedLoading] = useState<boolean>(true);

  // ✅ pending purchases (để poll sau khi thanh toán)
  const [pendingIds, setPendingIds] = useState<string[]>([]);

  const refreshPurchasedIds = useCallback(
    async (opts?: { signal?: AbortSignal; silent?: boolean }) => {
      try {
        if (!opts?.silent) setPurchasedLoading(true);
        const ids = await fetchMyPurchasedCourseIds(opts?.signal);
        setPurchasedIds(new Set(ids));
        return ids;
      } catch {
        setPurchasedIds(new Set());
        return [];
      } finally {
        if (!opts?.silent) setPurchasedLoading(false);
      }
    },
    []
  );

  // init: đọc pending từ localStorage + fetch purchased
  useEffect(() => {
    const ac = new AbortController();

    const initPending = readPendingIds();
    setPendingIds(initPending);

    refreshPurchasedIds({ signal: ac.signal, silent: false });

    // Khi user quay lại tab / focus lại (ví dụ vừa thanh toán xong quay lại)
    const onFocus = () => {
      // silent để tránh flicker loading
      refreshPurchasedIds({ silent: true });
      setPendingIds(readPendingIds());
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") onFocus();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      ac.abort();
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refreshPurchasedIds]);

  // Poll enrollment vài lần nếu còn pending (để chờ BE ghi nhận đã mua)
  useEffect(() => {
    if (!pendingIds || pendingIds.length === 0) return;

    let stopped = false;
    let tries = 0;
    const maxTries = 15; // ~ 15 * 2s = 30s
    const intervalMs = 2000;

    const tick = async () => {
      if (stopped) return;
      tries += 1;

      const ids = await refreshPurchasedIds({ silent: true });
      const purchasedSet = new Set(ids);

      const stillPending = readPendingIds().filter(
        (cid) => !purchasedSet.has(cid)
      );

      // Clear các course đã được ghi nhận
      const newlyPurchased = readPendingIds().filter((cid) =>
        purchasedSet.has(cid)
      );
      newlyPurchased.forEach(removePendingId);

      setPendingIds(stillPending);

      if (stillPending.length === 0 || tries >= maxTries) {
        stopped = true;
        if (tries >= maxTries) {
          // quá thời gian thì thôi (user vẫn có thể refresh / focus lại để kiểm tra)
          setPendingIds(readPendingIds());
        }
      }
    };

    // chạy ngay 1 lần rồi mới interval
    tick();
    const timer = window.setInterval(tick, intervalMs);

    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }, [pendingIds, refreshPurchasedIds]);

  const coursesQueryParams = useMemo(() => ({ limit: 50 }), []);
  const {
    data: coursesData,
    isLoading,
    isError,
    refetch,
  } = useGetAllCoursesQuery(coursesQueryParams);

  const filteredCourses = useMemo(() => {
    if (!coursesData?.data) return [];

<<<<<<< HEAD
    return coursesData.data.filter((course: any) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLevel =
        selectedLevel === "All" || course.level === selectedLevel;

      // category filter bạn chưa map thật sự -> giữ nguyên
      return matchesSearch && matchesLevel;
=======
    let courses = coursesData.data.filter((course) => {
      // Filter theo search term
      const matchesSearch =
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter theo price
      const matchesPrice =
        priceFilter === "all" ||
        (priceFilter === "free" && course.price === 0) ||
        (priceFilter === "paid" && course.price > 0);

      // Filter theo rating
      const ratings = course.ratings || [];
      const avgRating = calculateAverageRating(ratings);
      const matchesRating =
        ratingFilter === "all" ||
        (ratingFilter === "rated" && ratings.length > 0) ||
        (ratingFilter === "high" && avgRating >= 4.0);

      return matchesSearch && matchesPrice && matchesRating;
>>>>>>> origin/main
    });

    return courses;
  }, [coursesData, searchTerm, priceFilter, ratingFilter]);

  const onBuy = async (courseId: string) => {
    try {
      setBuyingId(courseId);

      // ✅ lưu pending trước khi redirect VNPay
      addPendingId(courseId);
      setPendingIds(readPendingIds());

      const { paymentUrl } = await createVnpayPayment(courseId);
      window.location.href = paymentUrl;
    } catch (e: any) {
      // nếu tạo payment fail thì bỏ pending
      removePendingId(courseId);
      setPendingIds(readPendingIds());
      alert(e?.message || "Không thể tạo thanh toán");
    } finally {
      setBuyingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">
            {t("courses.error.title")}
          </h3>
          <p className="text-muted-foreground mb-4">
            {t("courses.error.message")}
          </p>
          <Button onClick={() => refetch()}>{t("courses.error.retry")}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 text-white py-12 md:py-20 lg:py-24 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 tracking-tight">
              {t("courses.hero.title")}
            </h1>
            <p className="text-base md:text-xl lg:text-2xl mb-6 md:mb-10 opacity-95 px-2 leading-relaxed">
              {t("courses.hero.subtitle")}
            </p>

            <div className="relative max-w-2xl mx-auto">
              <div className="relative group">
                <Search className="absolute left-4 md:left-5 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5 md:h-6 md:w-6 transition-colors group-focus-within:text-orange-500" />
                <Input
                  type="text"
                  placeholder={t("courses.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 md:pl-14 pr-4 py-3 md:py-4 text-sm md:text-base rounded-full border-0 shadow-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-orange-500 transition-all duration-200"
                />
              </div>
              {searchTerm && (
                <div className="mt-3 text-sm text-white/90">
                  {t("courses.searchIndicator")}{" "}
                  <span className="font-semibold">"{searchTerm}"</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 md:px-4 lg:px-6 py-6 md:py-12">
        {/* Filters */}
        <div className="flex flex-col gap-4 md:gap-6 mb-4 md:mb-8">
          {/* Filter Row 1: Price & Rating */}
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
              <span className="text-sm md:text-base font-medium text-gray-700 dark:text-gray-300">
                {t("courses.filters")}
              </span>
            </div>

<<<<<<< HEAD
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
=======
            {/* Price Filter */}
            <div className="flex flex-wrap gap-2">
>>>>>>> origin/main
              <Button
                variant={priceFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setPriceFilter("all")}
                className={`text-xs md:text-sm ${
                  priceFilter === "all"
                    ? "bg-orange-500 hover:bg-orange-600"
                    : ""
                }`}
              >
                {t("courses.filter.all")}
              </Button>
<<<<<<< HEAD
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {levels.map((level) => (
=======
>>>>>>> origin/main
              <Button
                variant={priceFilter === "free" ? "default" : "outline"}
                size="sm"
                onClick={() => setPriceFilter("free")}
                className={`text-xs md:text-sm ${
                  priceFilter === "free"
                    ? "bg-orange-500 hover:bg-orange-600"
                    : ""
                }`}
              >
                {t("courses.filter.free")}
              </Button>
              <Button
                variant={priceFilter === "paid" ? "default" : "outline"}
                size="sm"
                onClick={() => setPriceFilter("paid")}
                className={`text-xs md:text-sm ${
                  priceFilter === "paid"
                    ? "bg-orange-500 hover:bg-orange-600"
                    : ""
                }`}
              >
                {t("courses.filter.paid")}
              </Button>
            </div>

            {/* Rating Filter */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={ratingFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setRatingFilter("all")}
                className={`text-xs md:text-sm ${
                  ratingFilter === "all"
                    ? "bg-orange-500 hover:bg-orange-600"
                    : ""
                }`}
              >
                {t("courses.filter.all")}
              </Button>
              <Button
                variant={ratingFilter === "rated" ? "default" : "outline"}
                size="sm"
                onClick={() => setRatingFilter("rated")}
                className={`text-xs md:text-sm flex items-center gap-1 ${
                  ratingFilter === "rated"
                    ? "bg-orange-500 hover:bg-orange-600"
                    : ""
                }`}
              >
                <Star className="h-3 w-3" />
                {t("courses.filter.rated")}
              </Button>
              <Button
                variant={ratingFilter === "high" ? "default" : "outline"}
                size="sm"
                onClick={() => setRatingFilter("high")}
                className={`text-xs md:text-sm flex items-center gap-1 ${
                  ratingFilter === "high"
                    ? "bg-orange-500 hover:bg-orange-600"
                    : ""
                }`}
              >
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {t("courses.filter.highRating")}
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-4 md:mb-6">
          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
            {t("courses.results.showing")} {filteredCourses.length}{" "}
            {t("courses.results.of")} {coursesData?.data?.length || 0}{" "}
            {t("courses.results.courses")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-5">
          {filteredCourses.map((course: any) => {
            const courseId = oidStr(course?._id) || oidStr(course?.id);
            const isFree = Number(course.price || 0) === 0;
            const isBuying = buyingId === courseId;

            // ✅ check đã mua từ Enrollment list
            const purchasedByEnrollment =
              !!courseId && purchasedIds.has(courseId);

            // ✅ fallback: nếu BE trả flag (nếu sau này bạn thêm)
            const purchasedByFlag =
              course.isPurchased === true ||
              course.hasAccess === true ||
              course.isEnrolled === true;

            const hasAccess =
              isFree || purchasedByEnrollment || purchasedByFlag;

            return (
              <Card
                key={courseId || course._id}
                className="group md:hover:shadow-lg transition-all duration-300 md:hover:-translate-y-1 overflow-hidden flex flex-col"
              >
                <div className="relative h-28 sm:h-32 md:h-36 lg:h-40">
                  <Image
                    src={course.thumbnail || "/placeholder.svg"}
                    alt={course.title}
                    fill
                    className="object-cover md:group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    unoptimized
                  />

                  {(course.studentCount || course.students?.length || 0) >
                    100 && (
                    <Badge className="absolute top-1.5 left-1.5 md:top-2 md:left-2 bg-orange-500 hover:bg-orange-600 text-[10px] md:text-xs px-1.5 py-0.5">
                      Phổ biến
                    </Badge>
                  )}

                  {/* ✅ badge đã mua (chỉ hiện với khóa trả phí) */}
                  {!isFree && hasAccess && (
                    <Badge className="absolute bottom-1.5 left-1.5 md:bottom-2 md:left-2 bg-emerald-600 hover:bg-emerald-700 text-[10px] md:text-xs px-1.5 py-0.5">
                      Đã mua
                    </Badge>
                  )}

                  <div className="absolute top-1.5 right-1.5 md:top-2 md:right-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-full px-1.5 md:px-2 py-0.5 text-[10px] md:text-xs font-medium">
                    {formatPrice(course.price)}
                  </div>
                </div>

                <CardHeader className="p-3 md:p-4 pb-2 flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm md:text-base lg:text-lg mb-1 md:group-hover:text-orange-500 transition-colors line-clamp-2 leading-tight">
                        {course.title}
                      </CardTitle>
                      <CardDescription className="text-[11px] md:text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-1 leading-snug">
                        {course.description}
                      </CardDescription>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-xs text-gray-500 mt-2 md:mt-3">
                    <div className="flex items-center gap-0.5 md:gap-1">
                      <Users className="h-2.5 w-2.5 md:h-3 md:w-3" />
                      <span>
                        {(
                          course.studentCount ||
                          course.students?.length ||
                          0
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5 md:gap-1">
                      <Clock className="h-2.5 w-2.5 md:h-3 md:w-3" />
                      <span>
                        {estimateDuration(course.lessons?.length || 0)}
                      </span>
                    </div>
                  </div>
                </CardHeader>

<<<<<<< HEAD
                <CardContent className="p-3 md:p-4 pt-0 pb-2">
                  <div className="flex items-center justify-between mb-2">
                    <Badge
                      variant="secondary"
                      className="text-[10px] md:text-xs px-1.5 py-0.5"
                    >
                      {course.level}
                    </Badge>
                    <div className="flex items-center gap-0.5 md:gap-1 text-[10px] md:text-xs text-gray-500">
                      <BookOpen className="h-2.5 w-2.5 md:h-3 md:w-3" />
                      <span>{course.lessons?.length || 0} bài</span>
                    </div>
                  </div>

                  <p className="text-[10px] md:text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                    {course.instructor?.fullname || "Chưa xác định"}
                  </p>
                </CardContent>

                <CardFooter className="p-3 md:p-4 pt-2">
                  <div className="flex gap-1.5 md:gap-2 w-full">
                    <Link
                      href={`/courses/${courseId}/detail`}
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        className="w-full text-[10px] md:text-xs h-7 md:h-8 px-2"
                      >
                        <BookOpen className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
                        Chi tiết
                      </Button>
                    </Link>

                    {/* ✅ Nếu free HOẶC đã mua => Học, còn lại => Mua */}
                    {hasAccess ? (
                      <Link href={`/courses/${courseId}`} className="flex-1">
                        <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white text-[10px] md:text-xs h-7 md:h-8 px-2">
                          <Play className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
                          Học
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        onClick={() => onBuy(courseId)}
                        disabled={isBuying || !courseId || purchasedLoading}
                        className="flex-1 w-full bg-orange-500 hover:bg-orange-600 text-white text-[10px] md:text-xs h-7 md:h-8 px-2"
                      >
                        {isBuying || purchasedLoading ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <ShoppingCart className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
                        )}
                        {purchasedLoading ? "Đợi..." : "Mua"}
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            );
          })}
=======
              <CardContent className="p-3 md:p-4 pt-0 pb-2">
                <div className="flex items-center justify-between mb-2">
                  {/* Rating Display */}
                  {(() => {
                    const ratings = course.ratings || [];
                    const avgRating = calculateAverageRating(ratings);
                    if (ratings.length > 0) {
                      return (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-[10px] md:text-xs font-medium">
                            {avgRating.toFixed(1)}
                          </span>
                          <span className="text-[10px] md:text-xs text-gray-500">
                            ({ratings.length})
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })()}
                  <div className="flex items-center gap-0.5 md:gap-1 text-[10px] md:text-xs text-gray-500">
                    <BookOpen className="h-2.5 w-2.5 md:h-3 md:w-3" />
                    <span>
                      {course.lessons?.length || 0}{" "}
                      {t("courses.format.lessons")}
                    </span>
                  </div>
                </div>

                <p className="text-[10px] md:text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                  {course.instructor?.fullname ||
                    t("courses.instructor.unknown")}
                </p>
              </CardContent>

              <CardFooter className="p-3 md:p-4 pt-2">
                <div className="flex gap-1.5 md:gap-2 w-full">
                  <Link
                    href={`/courses/${course._id}/detail`}
                    className="flex-1"
                  >
                    <Button
                      variant="outline"
                      className="w-full text-[10px] md:text-xs h-7 md:h-8 px-2"
                    >
                      <BookOpen className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
                      {t("courses.button.details")}
                    </Button>
                  </Link>
                  <Link href={`/courses/${course._id}`} className="flex-1">
                    <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white text-[10px] md:text-xs h-7 md:h-8 px-2">
                      <Play className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
                      {t("courses.button.learn")}
                    </Button>
                  </Link>
                </div>
              </CardFooter>
            </Card>
          ))}
>>>>>>> origin/main
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-8 md:py-12">
            <div className="text-gray-400 mb-3 md:mb-4">
              <BookOpen className="h-12 w-12 md:h-16 md:w-16 mx-auto" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              {t("courses.empty.title")}
            </h3>
            <p className="text-sm md:text-base text-gray-500">
              {t("courses.empty.subtitle")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(CoursesPage);
