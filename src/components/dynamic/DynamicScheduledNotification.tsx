"use client";

import dynamic from 'next/dynamic';

const ScheduledNotification = dynamic(() => import('@/components/notification/ScheduledNotification'), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
  )
});

export default ScheduledNotification;

