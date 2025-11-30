"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface UserGrowthData {
  date: string;
  users: number;
}

interface UserGrowthChartProps {
  data: UserGrowthData[];
  className?: string;
}

export const UserGrowthChart = ({ data, className = "" }: UserGrowthChartProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (selectedPeriod === 'week') {
      return date.toLocaleDateString('vi-VN', { weekday: 'short' });
    } else if (selectedPeriod === 'month') {
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    } else {
      return date.toLocaleDateString('vi-VN', { month: 'short', year: '2-digit' });
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium">{formatDate(label)}</p>
          <p className="text-sm text-blue-600">
            Người dùng: <span className="font-bold">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Tăng trưởng người dùng</CardTitle>
          <Select value={selectedPeriod} onValueChange={(value: 'week' | 'month' | 'year') => setSelectedPeriod(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">7 ngày</SelectItem>
              <SelectItem value="month">30 ngày</SelectItem>
              <SelectItem value="year">1 năm</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                stroke="#666"
                fontSize={12}
              />
              <YAxis 
                stroke="#666"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserGrowthChart;
