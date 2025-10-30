"use client";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

// 🧭 Lấy dữ liệu tổng quan dashboard
export const getStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/admin/dashboard`, {
      withCredentials: true,
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return null;
  }
};

// 📘 Lấy danh sách khóa học phổ biến
export const getPopularCourses = async () => {
  try {
    const response = await axios.get(`${API_URL}/admin/popular-courses`, {
      withCredentials: true,
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching popular courses:", error);
    return null;
  }
};

export const getRecentActivities = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/recent-activities`, {
        withCredentials: true,
      });
      return response.data.data;
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      return null;
    }
};

// 👤 Tạo admin mới
export const createAdmin = async (adminData: {
  fullname: string;
  email: string;
  username: string;
  password: string;
}) => {
  try {
    const token = localStorage.getItem("token") || "";
    const response = await axios.post(`${API_URL}/admin/create-admin`, adminData, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json", },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating admin:", error);
    throw error;
  }
};

