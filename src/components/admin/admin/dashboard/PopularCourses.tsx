"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Users } from "lucide-react";

interface PopularCourse {
  courseId: string;
  courseTitle: string;
  count: number;
}

interface PopularCoursesProps {
  courses: PopularCourse[];
  className?: string;
}

export const PopularCourses = ({ courses, className = "" }: PopularCoursesProps) => {
  // Tính tổng số lượng để tính phần trăm
  const totalCount = courses.reduce((sum, course) => sum + course.count, 0);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5" />
          <span>Khóa học phổ biến</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {courses.map((course, index) => {
            const percentage = totalCount > 0 ? Math.round((course.count / totalCount) * 100) : 0;
            return (
              <div key={course.courseId} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{course.courseTitle}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Users className="h-3 w-3" />
                        <span>{course.count} lượt đăng ký</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {percentage}%
                    </div>
                    <div className="text-xs text-gray-500">Tỷ lệ</div>
                  </div>
                  <div className="w-16">
                    <Progress value={percentage} className="h-2" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {courses.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Chưa có dữ liệu khóa học</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PopularCourses;
