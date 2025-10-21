"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useState } from "react";

interface LevelDistribution {
  level: string;
  count: number;
  percentage: number;
}

interface LevelDistributionProps {
  data: LevelDistribution[];
  className?: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const LevelDistribution = ({ data, className = "" }: LevelDistributionProps) => {
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');

  const getLevelColor = (level: string) => {
    const colors: { [key: string]: string } = {
      'N5': '#10b981',
      'N4': '#3b82f6',
      'N3': '#f59e0b',
      'N2': '#ef4444',
      'N1': '#8b5cf6',
    };
    return colors[level] || '#6b7280';
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium">{`Cấp độ ${label}`}</p>
          <p className="text-sm text-blue-600">
            Số lượng: <span className="font-bold">{payload[0].value}</span>
          </p>
          <p className="text-sm text-gray-600">
            Tỷ lệ: <span className="font-bold">{payload[0].payload.percentage}%</span>
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
          <CardTitle className="flex items-center space-x-2">
            <span>Phân bố cấp độ</span>
          </CardTitle>
          <div className="flex space-x-2">
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 text-xs rounded ${
                chartType === 'bar' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Cột
            </button>
            <button
              onClick={() => setChartType('pie')}
              className={`px-3 py-1 text-xs rounded ${
                chartType === 'pie' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tròn
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="level" 
                  stroke="#666"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#666"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            ) : (
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ level, percentage }) => `${level}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getLevelColor(entry.level)} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {data.map((item, index) => (
            <div key={item.level} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: getLevelColor(item.level) }}
              />
              <span className="text-sm text-gray-600">{item.level}</span>
              <span className="text-sm font-medium">{item.count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LevelDistribution;
