"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { withAuth } from "@/components/auth";
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

function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");

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

    return coursesData.data.filter((course: any) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLevel =
        selectedLevel === "All" || course.level === selectedLevel;

      // category filter bạn chưa map thật sự -> giữ nguyên
      return matchesSearch && matchesLevel;
    });
  }, [coursesData, searchTerm, selectedLevel]);

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
          <h3 className="text-lg font-semibold mb-2">Có lỗi xảy ra</h3>
          <p className="text-muted-foreground mb-4">
            Không thể tải danh sách khóa học. Vui lòng thử lại.
          </p>
          <Button onClick={() => refetch()}>Thử lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-8 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold mb-3 md:mb-6">
              Khám phá khóa học tiếng Nhật
            </h1>
            <p className="text-sm md:text-xl lg:text-2xl mb-4 md:mb-8 opacity-90 px-2">
              Từ cơ bản đến nâng cao, tìm khóa học hoàn hảo cho hành trình học
              tiếng Nhật của bạn
            </p>

            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 md:h-5 md:w-5" />
              <Input
                type="text"
                placeholder="Tìm kiếm khóa học..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 md:pl-12 pr-4 py-2.5 md:py-4 text-sm md:text-lg rounded-full border-0 shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 md:px-4 lg:px-6 py-6 md:py-12">
        {/* Filters */}
        <div className="flex flex-col md:flex-row md:flex-wrap gap-3 md:gap-4 mb-4 md:mb-8">
          <div className="flex items-center gap-2 mb-1 md:mb-0">
            <Filter className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
            <span className="text-sm md:text-base font-medium text-gray-700 dark:text-gray-300">
              Bộ lọc:
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={`text-xs md:text-sm ${
                  selectedCategory === category
                    ? "bg-orange-500 hover:bg-orange-600"
                    : ""
                }`}
              >
                {category}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {levels.map((level) => (
              <Button
                key={level}
                variant={selectedLevel === level ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedLevel(level)}
                className={`text-xs md:text-sm ${
                  selectedLevel === level
                    ? "bg-orange-500 hover:bg-orange-600"
                    : ""
                }`}
              >
                {level}
              </Button>
            ))}
          </div>
        </div>

        <div className="mb-4 md:mb-6">
          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
            Hiển thị {filteredCourses.length} trong{" "}
            {coursesData?.data?.length || 0} khóa học
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
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-8 md:py-12">
            <div className="text-gray-400 mb-3 md:mb-4">
              <BookOpen className="h-12 w-12 md:h-16 md:w-16 mx-auto" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              Không tìm thấy khóa học
            </h3>
            <p className="text-sm md:text-base text-gray-500">
              Thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(CoursesPage);
