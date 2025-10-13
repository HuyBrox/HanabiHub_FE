"use client";

import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('@/components/editor/RichTextEditor'), {
  ssr: false,
  loading: () => (
    <div className="border border-gray-300 rounded-md">
      <div className="h-16 bg-gray-100 rounded-t-md flex items-center px-4">
        <div className="flex space-x-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="w-6 h-6 bg-gray-300 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
      <div className="h-64 bg-gray-50 rounded-b-md flex items-center justify-center">
        <div className="text-gray-500">Loading editor...</div>
      </div>
    </div>
  )
});

export default RichTextEditor;

