"use client";

import { useState, useEffect } from 'react';
import { Calendar, Clock, Send, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface ScheduledNotificationProps {
  onSchedule: (data: ScheduledNotificationData) => void;
}

interface ScheduledNotificationData {
  title: string;
  message: string;
  scheduledDate: Date;
  scheduledTime: Date;
  recipients: 'all' | 'specific';
  selectedUsers?: string[];
}

export default function ScheduledNotification({ onSchedule }: ScheduledNotificationProps) {
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>;
  }
  const [message, setMessage] = useState('');
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [scheduledTime, setScheduledTime] = useState<Date | null>(null);
  const [recipients, setRecipients] = useState<'all' | 'specific'>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const handleSchedule = () => {
    if (!title || !message || !scheduledDate || !scheduledTime) {
      return;
    }

    const scheduledDateTime = new Date(scheduledDate);
    scheduledDateTime.setHours(scheduledTime.getHours());
    scheduledDateTime.setMinutes(scheduledTime.getMinutes());

    onSchedule({
      title,
      message,
      scheduledDate,
      scheduledTime,
      recipients,
      selectedUsers: recipients === 'specific' ? selectedUsers : undefined
    });

    // Reset form
    setTitle('');
    setMessage('');
    setScheduledDate(null);
    setScheduledTime(null);
    setSelectedUsers([]);
  };

  const isScheduled = scheduledDate && scheduledTime;
  const scheduledDateTime = isScheduled ? new Date(scheduledDate) : null;
  if (scheduledDateTime && scheduledTime) {
    scheduledDateTime.setHours(scheduledTime.getHours());
    scheduledDateTime.setMinutes(scheduledTime.getMinutes());
  }

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 font-semibold">
          <Calendar className="w-5 h-5 text-purple-600" />
          Lên Lịch Thông Báo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Title */}
        <div>
          <Label htmlFor="scheduled-title" className="text-gray-900 font-medium">Tiêu đề</Label>
          <Input
            id="scheduled-title"
            placeholder="Tiêu đề thông báo"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1"
          />
        </div>

        {/* Message */}
        <div>
          <Label htmlFor="scheduled-message" className="text-gray-900 font-medium">Nội dung</Label>
          <Textarea
            id="scheduled-message"
            placeholder="Nội dung thông báo..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="mt-1"
          />
        </div>

        {/* Date & Time Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-gray-900 font-medium">Ngày gửi</Label>
            <DatePicker
              selected={scheduledDate}
              onChange={(date) => setScheduledDate(date)}
              dateFormat="dd/MM/yyyy"
              minDate={new Date()}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholderText="Chọn ngày gửi"
            />
          </div>
          <div>
            <Label className="text-gray-900 font-medium">Giờ gửi</Label>
            <DatePicker
              selected={scheduledTime}
              onChange={(time) => setScheduledTime(time)}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={15}
              timeCaption="Giờ"
              dateFormat="HH:mm"
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholderText="Chọn giờ gửi"
            />
          </div>
        </div>

        {/* Recipients */}
        <div>
          <Label className="text-gray-900 font-medium">Người nhận</Label>
          <div className="flex gap-4 mt-2">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="all"
                checked={recipients === 'all'}
                onChange={(e) => setRecipients(e.target.value as 'all')}
                className="text-blue-600"
              />
              <span className="text-sm text-gray-700">Tất cả người dùng</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="specific"
                checked={recipients === 'specific'}
                onChange={(e) => setRecipients(e.target.value as 'specific')}
                className="text-blue-600"
              />
              <span className="text-sm text-gray-700">Người dùng cụ thể</span>
            </label>
          </div>
        </div>

        {/* Scheduled Preview */}
        {isScheduled && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-900">Thông báo đã lên lịch</span>
            </div>
            <div className="space-y-1 text-sm text-blue-800">
              <p><strong>Tiêu đề:</strong> {title}</p>
              <p><strong>Thời gian:</strong> {scheduledDateTime?.toLocaleString('vi-VN')}</p>
              <p><strong>Người nhận:</strong> {recipients === 'all' ? 'Tất cả' : `${selectedUsers.length} người`}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleSchedule}
            disabled={!title || !message || !scheduledDate || !scheduledTime}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            Lên lịch
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setTitle('');
              setMessage('');
              setScheduledDate(null);
              setScheduledTime(null);
              setSelectedUsers([]);
            }}
          >
            <X className="w-4 h-4 mr-2" />
            Hủy
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
