"use client";

<<<<<<< HEAD
import { useEffect, useMemo, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { withAuth } from "@/components/auth";
=======
import { useState, useMemo, use } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
>>>>>>> origin/main
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Play,
  Clock,
  Users,
  Star,
  BookOpen,
  CheckCircle,
  Circle,
  Award,
  Globe,
  Download,
  Heart,
  Share2,
  ArrowLeft,
  GraduationCap,
  Target,
  Lightbulb,
  RotateCcw,
  ShoppingCart,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useGetCourseByIdQuery,
  useGetUserCourseProgressQuery,
  useResetCourseProgressMutation,
  useRateCourseMutation,
} from "@/store/services/courseApi";
import { LoadingSpinner } from "@/components/loading";
import { createVnpayPayment } from "@/lib/payment";

// -------------------- API base --------------------
const RAW = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
).replace(/\/+$/, "");
const API_V1 = RAW.includes("/api/") ? RAW : `${RAW}/api/v1`;

// ✅ NEW pending key: map theo courseId -> { txnRef?, ts }
const LS_PENDING_MAP = "pending_purchase_map_v1";
// ✅ OLD pending key (bị kẹt): sẽ auto clear
const LS_PENDING_OLD = "pending_purchase_course_ids_v1";

// TTL pending: 20 phút (>= expire VNPay 15 phút)
const PENDING_TTL_MS = 20 * 60 * 1000;

// ---------- helpers ----------
const formatPrice = (price: number) => {
  if (price === 0) return "Miễn phí";
  return `${Number(price).toLocaleString("vi-VN")} VNĐ`;
};

const formatDuration = (duration: number) => {
  if (duration < 60) return `${duration} phút`;
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

<<<<<<< HEAD
// ✅ parse tiền an toàn (tránh "200,000" => NaN)
const toMoneyNumber = (v: any): number => {
  if (v == null) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const s = String(v).trim();
  if (!s) return 0;
  // giữ chữ số, bỏ , . khoảng trắng ký tự
  const digits = s.replace(/[^\d]/g, "");
  if (!digits) return 0;
  const n = Number(digits);
  return Number.isFinite(n) ? n : 0;
};

const oidStr = (v: any): string => {
  if (!v) return "";
  if (typeof v === "string") return v.trim();
  if (typeof v === "number") return String(v).trim();
  if (typeof v === "object" && v.$oid) return String(v.$oid).trim();
  if (typeof v === "object" && v._id) return oidStr(v._id);
  if (typeof v === "object" && v.id) return String(v.id).trim();
  try {
    return String(v).trim();
  } catch {
    return "";
  }
};

const getAccessToken = (): string | null => {
  try {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("access_token");
  } catch {
    return null;
  }
};

// ---------------- Pending map helpers ----------------
type PendingEntry = { txnRef?: string; ts: number };
type PendingMap = Record<string, PendingEntry>;

const migrateAndClearOldPendingKey = () => {
  try {
    if (typeof window === "undefined") return;
    // key cũ gây kẹt "Đang xác nhận..." => clear luôn
    localStorage.removeItem(LS_PENDING_OLD);
  } catch {}
};

const readPendingMap = (): PendingMap => {
  try {
    if (typeof window === "undefined") return {};
    migrateAndClearOldPendingKey();

    const raw = localStorage.getItem(LS_PENDING_MAP);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as PendingMap;
  } catch {
    return {};
  }
};

const writePendingMap = (m: PendingMap) => {
  try {
    if (typeof window === "undefined") return;
    const clean: PendingMap = {};
    for (const [k, v] of Object.entries(m || {})) {
      const cid = String(k || "").trim();
      if (!cid) continue;
      const ts = Number(v?.ts);
      if (!Number.isFinite(ts)) continue;
      const txnRef = v?.txnRef ? String(v.txnRef).trim() : undefined;
      clean[cid] = { ts, txnRef };
    }
    if (Object.keys(clean).length === 0) {
      localStorage.removeItem(LS_PENDING_MAP);
      return;
    }
    localStorage.setItem(LS_PENDING_MAP, JSON.stringify(clean));
  } catch {}
};

const cleanupExpiredPending = () => {
  const m = readPendingMap();
  let changed = false;
  const now = Date.now();
  for (const [cid, e] of Object.entries(m)) {
    if (!e?.ts || now - e.ts > PENDING_TTL_MS) {
      delete m[cid];
      changed = true;
    }
  }
  if (changed) writePendingMap(m);
};

const getPending = (courseId: string): PendingEntry | null => {
  const cid = String(courseId || "").trim();
  if (!cid) return null;
  cleanupExpiredPending();
  const m = readPendingMap();
  const e = m[cid];
  return e ? e : null;
};

const setPending = (courseId: string, txnRef?: string) => {
  const cid = String(courseId || "").trim();
  if (!cid) return;
  const m = readPendingMap();
  m[cid] = {
    ts: Date.now(),
    txnRef: txnRef ? String(txnRef).trim() : undefined,
  };
  writePendingMap(m);
};

const clearPending = (courseId: string) => {
  const cid = String(courseId || "").trim();
  if (!cid) return;
  const m = readPendingMap();
  if (m[cid]) {
    delete m[cid];
    writePendingMap(m);
  }
};

// ✅ gọi BE lấy enrollment của user
async function fetchMyPurchasedCourseIds(
  signal?: AbortSignal
): Promise<string[]> {
  const url = `${API_V1}/enrollments/my`;

  const headers: Record<string, string> = { Accept: "application/json" };
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
    signal,
    headers,
  });

  if (!res.ok) return [];

  const json = await res.json().catch(() => ({} as any));
  const data =
    (Array.isArray(json?.data) && json.data) ||
    (Array.isArray(json) && json) ||
    (Array.isArray(json?.data?.items) && json.data.items) ||
    (Array.isArray(json?.items) && json.items) ||
    [];

  if (!Array.isArray(data)) return [];

  return data
    .map((x: any) => {
      return (
        oidStr(x?.courseId) ||
        oidStr(x?.course_id) ||
        oidStr(x?.course) ||
        oidStr(x?.course?._id) ||
        oidStr(x?.course?.id)
      );
    })
    .filter(Boolean);
}

// ✅ gọi BE check payment status theo txnRef (để clear pending khi FAILED/SUCCESS)
async function fetchPaymentStatus(txnRef: string, signal?: AbortSignal) {
  const t = String(txnRef || "").trim();
  if (!t) return null;

  const url = `${API_V1}/payments/vnpay/status?txnRef=${encodeURIComponent(t)}`;

  const headers: Record<string, string> = { Accept: "application/json" };
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
    signal,
    headers,
  });

  if (!res.ok) return null;
  const json = await res.json().catch(() => null);
  return json as null | { status?: "PENDING" | "SUCCESS" | "FAILED" };
}

function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [buying, setBuying] = useState(false);
=======
// Helper function để tính rating trung bình
const calculateAverageRating = (
  ratings?: Array<{ user: string | any; rating: number }>
) => {
  if (!ratings || ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
  return sum / ratings.length;
};

function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const router = useRouter();
  const currentUser = useSelector((state: RootState) => state.auth.user);
>>>>>>> origin/main

  // access check
  const [purchasedByEnrollment, setPurchasedByEnrollment] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [isPending, setIsPending] = useState(false);

  const router = useRouter();
  const { id } = use(params);

  const courseId = useMemo(() => String(id || "").trim(), [id]);

  const {
    data: courseData,
    isLoading,
    isError,
    refetch,
  } = useGetCourseByIdQuery(courseId);

  const course = courseData?.data;

  // ✅ price safe
  const priceNum = useMemo(() => toMoneyNumber(course?.price), [course?.price]);
  const isFree = priceNum === 0;
  const isPaidCourse = priceNum > 0;

  /**
   * ✅ QUY TẮC:
   * - KHÔNG dùng course.hasAccess/isPurchased và KHÔNG dùng progress để kết luận đã mua
   *   vì rất dễ làm paid course chưa mua vẫn hiện "Học".
   * - Source of truth: enrollments/my
   */
  const hasAccess = isFree || purchasedByEnrollment;
  const isLocked = isPaidCourse && !hasAccess;

  // ✅ chỉ fetch progress khi đã có access
  const { data: progressData } = useGetUserCourseProgressQuery(courseId, {
    skip: !hasAccess,
  });
  const userProgress = hasAccess ? progressData?.data : null;

  const [resetProgress, { isLoading: isResetting }] =
    useResetCourseProgressMutation();

<<<<<<< HEAD
=======
  const [rateCourse, { isLoading: isRating }] = useRateCourseMutation();

  // Transform lessons data
>>>>>>> origin/main
  const lessons = useMemo(() => {
    if (!courseData?.data?.lessons) return [];
    return [...courseData.data.lessons].sort(
      (a: any, b: any) => a.order - b.order
    );
  }, [courseData]);

  // ---------- sync pending + check enrollment ----------
  useEffect(() => {
    if (!courseId) return;

    let stopped = false;
    const ac = new AbortController();

    const sync = async (silent?: boolean) => {
      try {
        if (!silent) setCheckingAccess(true);

        // 1) pending
        const pending = getPending(courseId);
        const pendingNow = !!pending;

        if (!stopped) setIsPending(pendingNow);

        // 2) nếu có txnRef thì check status để clear pending nhanh khi FAILED/SUCCESS
        if (pendingNow && pending?.txnRef) {
          const st = await fetchPaymentStatus(pending.txnRef, ac.signal);
          const status = st?.status;
          if (status === "FAILED" || status === "SUCCESS") {
            clearPending(courseId);
            if (!stopped) setIsPending(false);
          }
        }

        // 3) check enrollment (source of truth)
        const ids = await fetchMyPurchasedCourseIds(ac.signal);
        const bought = ids.includes(courseId);

        if (!stopped) setPurchasedByEnrollment(bought);

        // nếu đã mua thì clear pending
        if (bought) {
          clearPending(courseId);
          if (!stopped) setIsPending(false);
        }
      } catch {
        // ignore
      } finally {
        if (!silent && !stopped) setCheckingAccess(false);
      }
    };

    sync(false);

    // poll nếu đang pending
    const timer = window.setInterval(() => {
      const pending = !!getPending(courseId);
      if (!pending) return;
      sync(true);
    }, 2000);

    const onFocus = () => sync(true);
    const onVisibility = () => {
      if (document.visibilityState === "visible") onFocus();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stopped = true;
      ac.abort();
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [courseId]);

  const totalDuration = lessons.reduce(
    (sum: number, lesson: any) => sum + (lesson.duration || 0),
    0
  );

  const isLessonCompleted = (lessonId: string): boolean => {
    if (!userProgress?.completedLessons) return false;
    return userProgress.completedLessons.some(
      (completed: any) => completed.lessonId === lessonId
    );
  };

  const completedLessons = lessons.filter((lesson: any) =>
    isLessonCompleted(lesson._id)
  ).length;

  const progressPercentage = userProgress?.progressPercentage || 0;

  const nextLesson = useMemo(() => {
    if (userProgress?.currentLessonId) {
      return lessons.find((l: any) => l._id === userProgress.currentLessonId);
    }
    return lessons.find((l: any) => !isLessonCompleted(l._id));
  }, [lessons, userProgress]);

  const handleStartLearning = () => {
<<<<<<< HEAD
    if (isLocked) return;
    if (nextLesson) {
      router.push(`/courses/${courseId}/learn/${nextLesson._id}`);
    } else if (lessons.length > 0) {
      router.push(`/courses/${courseId}/learn/${lessons[0]._id}`);
    }
=======
    router.push(`/courses/${id}`);
>>>>>>> origin/main
  };

  const handleResetProgress = async () => {
    if (isLocked) return;
    if (confirm("Bạn có chắc muốn reset tiến độ khóa học này?")) {
      try {
        await resetProgress(courseId).unwrap();
        refetch();
      } catch (error) {
        console.error("Failed to reset progress:", error);
      }
    }
  };

<<<<<<< HEAD
  const handleBuyCourse = async () => {
    try {
      setBuying(true);

      const returnUrl = `${window.location.origin}/payment-result`;

      // ✅ nên trả {paymentUrl, txnRef}
      const resp: any = await createVnpayPayment(courseId, returnUrl);

      const paymentUrl =
        resp?.paymentUrl || resp?.data?.paymentUrl || resp?.url || "";
      const txnRef =
        resp?.txnRef || resp?.data?.txnRef || resp?.data?.txn_ref || "";

      // set pending (có txnRef thì status check được; không có thì vẫn TTL)
      setPending(courseId, txnRef || undefined);
      setIsPending(true);

      if (!paymentUrl) throw new Error("Không nhận được paymentUrl");
      window.location.href = paymentUrl;
    } catch (e: any) {
      clearPending(courseId);
      setIsPending(false);
      alert(e?.message || "Không thể tạo thanh toán");
    } finally {
      setBuying(false);
    }
  };

=======
  const handleRateCourse = async () => {
    if (!selectedRating) return;
    try {
      await rateCourse({ courseId: id, rating: selectedRating }).unwrap();
      refetch();
      setSelectedRating(null);
    } catch (error) {
      console.error("Failed to rate course:", error);
    }
  };

  // Loading state
>>>>>>> origin/main
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Có lỗi xảy ra</h3>
          <p className="text-muted-foreground mb-4">
            Không thể tải thông tin khóa học. Vui lòng thử lại.
          </p>
          <Button onClick={() => refetch()}>Thử lại</Button>
        </div>
      </div>
    );
  }

<<<<<<< HEAD
  // ✅ pending chỉ có ý nghĩa khi: khóa trả phí + chưa mua
  const showPending = isPaidCourse && !purchasedByEnrollment && isPending;

  // ✅ LABEL đúng yêu cầu:
  // - Free => Học
  // - Paid chưa mua => Mua khóa học
  // - Paid pending => Đang xác nhận...
  // - Paid đã mua => Học
  const primaryLabel = isFree
    ? "Học"
    : purchasedByEnrollment
    ? "Học"
    : showPending
    ? "Đang xác nhận..."
    : "Mua khóa học";

  const primaryLoading = buying || checkingAccess || showPending;

  const handlePrimaryClick = () => {
    if (isFree || purchasedByEnrollment) return handleStartLearning();
    return handleBuyCourse();
  };
=======
  // Tính toán ratings
  const ratings = course?.ratings || [];
  const avgRating = calculateAverageRating(ratings);
  const userRating = currentUser
    ? ratings.find((r: any) =>
        typeof r.user === "string"
          ? r.user === currentUser._id
          : r.user?._id === currentUser._id
      )
    : null;
>>>>>>> origin/main

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b">
        <div className="container mx-auto px-3 md:px-4 py-3 md:py-4">
          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/courses">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 md:h-9 text-xs md:text-sm"
              >
                <ArrowLeft className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Quay lại</span>
              </Button>
            </Link>

            <div className="flex-1 min-w-0">
              <h1 className="text-lg md:text-xl lg:text-2xl font-bold line-clamp-2">
                {course.title}
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground line-clamp-1 mt-0.5">
                {course.description}
              </p>
            </div>

            <div className="flex items-center gap-1 md:gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsLiked(!isLiked)}
                className="h-8 w-8 md:h-9 md:w-9 p-0"
              >
                <Heart
                  className={`h-4 w-4 ${
                    isLiked ? "fill-red-500 text-red-500" : ""
                  }`}
                />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 md:h-9 md:w-9 p-0"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 md:px-4 py-4 md:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6 lg:space-y-8">
            <Card>
              <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-t-lg relative overflow-hidden">
                {course.thumbnail ? (
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <BookOpen className="h-12 w-12 md:h-16 md:w-16 lg:h-20 lg:w-20 mx-auto mb-2 md:mb-4 opacity-50" />
                      <h3 className="text-base md:text-lg lg:text-xl font-semibold px-2">
                        {course.title}
                      </h3>
                    </div>
                  </div>
                )}
              </div>

              <CardContent className="p-4 md:p-5 lg:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 md:mb-4">
                  <div className="flex flex-wrap items-center gap-2 md:gap-3 lg:gap-4 text-xs md:text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      <span>{formatDuration(totalDuration)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      <span>{lessons.length} bài học</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      <span>
                        {(
                          course.studentCount ||
                          course.students?.length ||
                          0
                        ).toLocaleString()}{" "}
                        học viên
                      </span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs w-fit">
                    {course.level}
                  </Badge>
                </div>
<<<<<<< HEAD

=======
>>>>>>> origin/main
                <h2 className="text-lg md:text-xl lg:text-2xl font-bold mb-2 md:mb-3 lg:mb-4">
                  {course.title}
                </h2>
                <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-5 lg:mb-6">
                  {course.description}
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3 lg:gap-4">
                  <Button
                    size="lg"
                    onClick={handlePrimaryClick}
                    disabled={primaryLoading}
                    className="bg-orange-500 hover:bg-orange-600 text-sm md:text-base h-10 md:h-11"
                  >
                    {primaryLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : primaryLabel === "Mua khóa học" ? (
                      <ShoppingCart className="h-4 w-4 mr-2" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    {primaryLabel}
                  </Button>

                  {hasAccess && userProgress?.status === "in_progress" && (
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleResetProgress}
                      disabled={isResetting}
                      className="text-sm md:text-base h-10 md:h-11"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Reset tiến độ</span>
                      <span className="sm:hidden">Reset</span>
                    </Button>
                  )}
<<<<<<< HEAD

                  {hasAccess && (
                    <Button
                      variant="outline"
                      size="lg"
                      className="text-sm md:text-base h-10 md:h-11"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Tải tài liệu</span>
                      <span className="sm:hidden">Tải về</span>
                    </Button>
                  )}
=======
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-sm md:text-base h-10 md:h-11"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Tải tài liệu</span>
                    <span className="sm:hidden">Tải về</span>
                  </Button>
>>>>>>> origin/main
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Card>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
                  <TabsTrigger
                    value="overview"
                    className="text-xs md:text-sm py-2 px-2 md:px-4"
                  >
                    Tổng quan
                  </TabsTrigger>
                  <TabsTrigger
                    value="curriculum"
                    className="text-xs md:text-sm py-2 px-2 md:px-4"
                  >
                    Chương trình
                  </TabsTrigger>
                  <TabsTrigger
                    value="instructor"
                    className="text-xs md:text-sm py-2 px-2 md:px-4"
                  >
                    Giảng viên
                  </TabsTrigger>
                  <TabsTrigger
                    value="reviews"
                    className="text-xs md:text-sm py-2 px-2 md:px-4"
                  >
                    Đánh giá
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="p-4 md:p-5 lg:p-6">
                  {/* giữ UI như bạn */}
                  <div className="space-y-4 md:space-y-5 lg:space-y-6">
                    <div>
                      <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">
                        Giới thiệu khóa học
                      </h3>
                      <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                        {course.description}
                      </p>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-semibold mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
                        <Target className="h-4 w-4 md:h-5 md:w-5" />
                        Mục tiêu khóa học
                      </h4>
                      <ul className="space-y-1.5 md:space-y-2 text-sm md:text-base text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-3.5 w-3.5 md:h-4 md:w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Nắm vững kiến thức cơ bản về tiếng Nhật</span>
                        </li>
                      </ul>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-semibold mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
                        <Lightbulb className="h-4 w-4 md:h-5 md:w-5" />
                        Bạn sẽ học được gì
                      </h4>
                      <ul className="space-y-1.5 md:space-y-2 text-sm md:text-base text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span>Đọc và viết các ký tự cơ bản</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="curriculum" className="p-4 md:p-5 lg:p-6">
                  {isLocked ? (
                    <div className="text-center py-8">
                      <ShoppingCart className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <h3 className="text-base md:text-lg font-semibold mb-2">
                        Vui lòng mua khóa học để xem nội dung
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Sau khi thanh toán thành công, bạn sẽ truy cập được toàn
                        bộ bài học.
                      </p>
                      <Button
                        onClick={handleBuyCourse}
                        disabled={primaryLoading}
                        className="bg-orange-500 hover:bg-orange-600"
                      >
                        {primaryLoading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <ShoppingCart className="h-4 w-4 mr-2" />
                        )}
                        {showPending ? "Đang xác nhận..." : "Mua khóa học"}
                      </Button>
                    </div>
<<<<<<< HEAD
                  ) : (
                    <div className="space-y-3 md:space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 md:mb-4">
                        <h3 className="text-lg md:text-xl font-semibold">
                          Nội dung khóa học
                        </h3>
                        <div className="text-xs md:text-sm text-muted-foreground">
                          {completedLessons}/{lessons.length} bài đã hoàn thành
                        </div>
=======

                    {lessons.length > 0 && (
                      <div className="mb-3 md:mb-4">
                        <Progress
                          value={progressPercentage}
                          className="h-1.5 md:h-2"
                        />
>>>>>>> origin/main
                      </div>

                      {lessons.length > 0 && (
                        <div className="mb-3 md:mb-4">
                          <Progress
                            value={progressPercentage}
                            className="h-2"
                          />
                        </div>
                      )}

                      <div className="space-y-2 md:space-y-3">
                        {lessons.map((lesson: any, index: number) => {
                          const completed = isLessonCompleted(lesson._id);
                          const isCurrent =
                            lesson._id === userProgress?.currentLessonId;

                          return (
                            <div
                              key={lesson._id}
                              className={cn(
                                "flex items-start gap-2 md:gap-3 p-3 md:p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer",
                                isCurrent && "border-primary bg-primary/5"
                              )}
<<<<<<< HEAD
                              onClick={() =>
                                router.push(
                                  `/courses/${courseId}/learn/${lesson._id}`
                                )
                              }
                            >
                              <div className="flex-shrink-0 mt-0.5">
                                {completed ? (
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : isCurrent ? (
                                  <Circle className="h-5 w-5 text-primary fill-primary/20" />
                                ) : (
                                  <Circle className="h-5 w-5 text-muted-foreground" />
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <Badge variant="outline" className="text-xs">
                                    Bài {index + 1}
                                  </Badge>
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {lesson.type === "video"
                                      ? "Video"
                                      : "Bài tập"}
                                  </Badge>
                                </div>
                                <h4 className="font-medium text-sm md:text-base mb-1">
                                  {lesson.title}
                                </h4>
                                <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                                  {lesson.content}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground flex-shrink-0">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {formatDuration(lesson.duration || 0)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
=======
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mb-1">
                                <Badge
                                  variant="outline"
                                  className="text-[10px] md:text-xs"
                                >
                                  Bài {index + 1}
                                </Badge>
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] md:text-xs"
                                >
                                  {lesson.type === "video"
                                    ? "Video"
                                    : "Bài tập"}
                                </Badge>
                                {isCurrent && (
                                  <Badge
                                    variant="default"
                                    className="text-[10px] md:text-xs bg-primary"
                                  >
                                    Đang học
                                  </Badge>
                                )}
                                {completed && (
                                  <Badge
                                    variant="default"
                                    className="text-[10px] md:text-xs bg-green-600"
                                  >
                                    Hoàn thành ✓
                                  </Badge>
                                )}
                              </div>
                              <h4 className="font-medium text-sm md:text-base mb-1">
                                {lesson.title}
                              </h4>
                              <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                                {lesson.content}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-muted-foreground flex-shrink-0">
                              <Clock className="h-3.5 w-3.5 md:h-4 md:w-4" />
                              <span>
                                {formatDuration(lesson.duration || 0)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
>>>>>>> origin/main
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="instructor" className="p-4 md:p-5 lg:p-6">
                  <div className="flex flex-col sm:flex-row items-start gap-4 md:gap-6">
                    <Avatar className="w-16 h-16 md:w-20 md:h-20">
                      <AvatarImage src={course.instructor?.avatar} />
                      <AvatarFallback className="text-2xl">
                        {course.instructor?.fullname?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-lg md:text-xl font-semibold mb-2">
                        {course.instructor?.fullname || "Chưa xác định"}
                      </h3>
                      <p className="text-sm md:text-base text-muted-foreground mb-4">
                        {course.instructor?.email || "Chưa xác định"}
                      </p>
                      <p className="text-sm md:text-base text-muted-foreground">
                        Giảng viên có nhiều năm kinh nghiệm giảng dạy.
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="p-4 md:p-5 lg:p-6">
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Chưa có đánh giá
                    </h3>
                    <p className="text-muted-foreground">
                      Hãy là người đầu tiên đánh giá khóa học này
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 md:space-y-5 lg:space-y-6">
            <Card>
              <CardContent className="p-4 md:p-5 lg:p-6">
                <div className="text-center mb-4 md:mb-5 lg:mb-6">
                  <div className="text-2xl md:text-3xl font-bold text-orange-500 mb-1 md:mb-2">
                    {formatPrice(priceNum)}
                  </div>
                  {priceNum > 0 && (
                    <div className="text-xs md:text-sm text-muted-foreground line-through">
                      {formatPrice(priceNum * 1.5)}
                    </div>
                  )}
                </div>

                <Button
                  className="w-full bg-orange-500 hover:bg-orange-600 mb-3 md:mb-4 text-sm md:text-base h-10 md:h-11"
                  onClick={handlePrimaryClick}
                  disabled={primaryLoading}
                >
                  {primaryLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : primaryLabel === "Mua khóa học" ? (
                    <ShoppingCart className="h-4 w-4 mr-2" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  {primaryLabel}
                </Button>

                <div className="text-center text-xs md:text-sm text-muted-foreground">
                  Đảm bảo hoàn tiền trong 30 ngày
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 md:p-5 lg:p-6 pb-3 md:pb-4">
                <CardTitle className="text-base md:text-lg">
                  Thống kê khóa học
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-5 lg:p-6 pt-0 space-y-3 md:space-y-4">
                <div className="flex items-center justify-between text-sm md:text-base">
                  <span className="text-muted-foreground">Thời lượng</span>
                  <span className="font-medium">
                    {formatDuration(totalDuration)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm md:text-base">
                  <span className="text-muted-foreground">Số bài học</span>
                  <span className="font-medium">{lessons.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm md:text-base">
                  <span className="text-muted-foreground">Học viên</span>
                  <span className="font-medium">
                    {(
                      course.studentCount ||
                      course.students?.length ||
                      0
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm md:text-base">
                  <span className="text-muted-foreground">Cấp độ</span>
                  <Badge variant="secondary" className="text-xs">
                    {course.level}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm md:text-base">
                  <span className="text-muted-foreground">Ngôn ngữ</span>
                  <div className="flex items-center gap-1">
                    <Globe className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    <span className="text-sm">Tiếng Việt</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm md:text-base">
                  <span className="text-muted-foreground">Chứng chỉ</span>
                  <div className="flex items-center gap-1">
                    <Award className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                    <span className="text-sm">Có</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm md:text-base">
                  <span className="text-muted-foreground">Ngày tạo</span>
                  <span className="font-medium text-xs md:text-sm">
                    {formatDate(course.createdAt)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {hasAccess && lessons.length > 0 && (
              <Card>
                <CardHeader className="p-4 md:p-5 lg:p-6 pb-3 md:pb-4">
                  <CardTitle className="text-base md:text-lg">
                    Tiến độ học tập
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-5 lg:p-6 pt-0 space-y-3 md:space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs md:text-sm mb-2">
                      <span>Hoàn thành</span>
                      <span className="font-medium">
                        {Math.round(progressPercentage)}%
                      </span>
                    </div>
                    <Progress
                      value={progressPercentage}
                      className="h-2 md:h-3"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">
                        Đã hoàn thành
                      </p>
                      <p className="font-semibold text-primary text-base md:text-lg">
                        {completedLessons}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Còn lại</p>
                      <p className="font-semibold text-base md:text-lg">
                        {lessons.length - completedLessons}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(CourseDetailPage);
