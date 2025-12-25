"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useGetCourseByIdQuery } from "@/store/services/courseApi";

export function useBlockPaidCourse(courseId: string) {
  const router = useRouter();
  const { data, isLoading, isError } = useGetCourseByIdQuery(courseId);

  const isPaid = useMemo(() => Number(data?.data?.price ?? 0) > 0, [data]);

  useEffect(() => {
    if (!isLoading && !isError && isPaid) {
      router.replace("/courses"); // ✅ remove về trang khóa học
    }
  }, [isLoading, isError, isPaid, router]);

  return { isLoading, isError, isPaid };
}
