"use client";

import dynamic from 'next/dynamic';

const AnalyticsCharts = dynamic(() => import('@/components/analytics/AnalyticsCharts'), {
  ssr: false,
  loading: () => (
    <div className="space-y-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
      ))}
    </div>
  )
});

export default AnalyticsCharts;

