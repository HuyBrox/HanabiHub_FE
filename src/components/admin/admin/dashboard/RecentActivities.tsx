"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, BookOpen, LogIn, Clock, UserCog } from "lucide-react";

interface RecentActivity {
  type: string;
  message: string;
  user: {
    id: string;
    fullname: string;
    username: string;
    avatar: string;
  };
  timestamp: string;
}

interface RecentActivitiesProps {
  activities: RecentActivity[];
  className?: string;
}

export const RecentActivities = ({ activities, className = "" }: RecentActivitiesProps) => {
  // 🔹 Cải tiến hàm nhận diện loại hoạt động
  const detectActivityType = (type: string, message: string) => {
    const lowerType = type?.toLowerCase() || "";
    const lowerMsg = message?.toLowerCase() || "";

    if (lowerType.includes("profile") || lowerMsg.includes("cập nhật")) return "profile_updated";
    if (
      lowerType.includes("registration") ||
      lowerType.includes("signup") ||
      lowerType.includes("user_created") ||
      lowerType.includes("new_user") ||
      lowerMsg.includes("đăng ký") ||
      lowerMsg.includes("tài khoản")
    )
      return "registration";
    if (lowerType.includes("course") || lowerMsg.includes("hoàn thành")) return "course_completion";
    if (lowerType.includes("login") || lowerMsg.includes("đăng nhập")) return "login";
    return "default";
  };

  // 🔹 Icon tương ứng
  const getActivityIcon = (type: string, message: string) => {
    const detectedType = detectActivityType(type, message);
    switch (detectedType) {
      case "profile_updated":
        return <UserCog className="h-4 w-4 text-blue-600" />;
      case "course_completion":
        return <BookOpen className="h-4 w-4 text-green-600" />;
      case "login":
        return <LogIn className="h-4 w-4 text-purple-600" />;
      case "registration":
        return <UserPlus className="h-4 w-4 text-green-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  // 🔹 Màu badge tương ứng
  const getActivityColor = (type: string, message: string) => {
    const detectedType = detectActivityType(type, message);
    switch (detectedType) {
      case "profile_updated":
        return "bg-blue-100 text-blue-800";
      case "course_completion":
        return "bg-green-100 text-green-800";
      case "login":
        return "bg-purple-100 text-purple-800";
      case "registration":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // 🔹 Nhãn badge tương ứng
  const getActivityLabel = (type: string, message: string) => {
    const detectedType = detectActivityType(type, message);
    switch (detectedType) {
      case "profile_updated":
        return "Cập nhật hồ sơ";
      case "course_completion":
        return "Hoàn thành khóa học";
      case "login":
        return "Đăng nhập";
      case "registration":
        return "Đăng ký tài khoản";
      default:
        return "Hoạt động";
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "Vừa xong";
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
  };

  const getInitials = (fullname?: string) => {
    if (!fullname) return "?";
    return fullname
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase();
  };

  return (
    <Card className={className}>
      {/* ✅ CardHeader phải bao toàn bộ CardTitle */}
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Hoạt động gần đây</span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {Array.isArray(activities) &&
            activities.map((activity, index) => (
              <div
                key={`${activity.user.id}-${index}`}
                className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                    {getActivityIcon(activity.type, activity.message)}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={activity.user.avatar} />
                      <AvatarFallback className="text-xs">
                        {getInitials(activity.user.fullname)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-gray-900">
                      {activity.user.fullname}
                    </span>
                    <span className="text-sm text-gray-500">
                      (@{activity.user.username})
                    </span>
                    <Badge className={`text-xs ${getActivityColor(activity.type, activity.message)}`}>
                      {getActivityLabel(activity.type, activity.message)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{activity.message}</p>
                  <p className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
                </div>
              </div>
            ))}
        </div>

        {(!activities || activities.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Chưa có hoạt động nào</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivities;
