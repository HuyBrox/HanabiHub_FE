"use client";

import { useState, useEffect } from 'react';
import { Bell, Newspaper, Flag, History, FileText, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MobileNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

export default function MobileNavigation({ activeTab, onTabChange, className = '' }: MobileNavigationProps) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3">
        <div className="animate-pulse flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded w-48"></div>
          <div className="w-8 h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'notifications', label: 'Thông Báo', icon: Bell, count: 6 },
    { id: 'news', label: 'Tin Tức', icon: Newspaper, count: 5 },
    { id: 'reports', label: 'Tố Cáo', icon: Flag, count: 5 },
    { id: 'history', label: 'Lịch Sử', icon: History, count: 6 },
    { id: 'templates', label: 'Template', icon: FileText, count: 6 }
  ];

  const handleTabChange = (tabId: string) => {
    onTabChange(tabId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className={`md:hidden bg-white border-b border-gray-200 px-4 py-3 ${className}`}>
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">Content & Notifications</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="p-2"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsOpen(false)} />
          <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-xl">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="p-2"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                        isActive 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{tab.label}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {tab.count}
                      </Badge>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Tab Bar */}
      <div className="md:hidden bg-white border-b border-gray-200">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex-shrink-0 flex flex-col items-center p-3 min-w-0 ${
                  isActive 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium truncate max-w-16">
                  {tab.label}
                </span>
                {tab.count > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-1 -right-1 text-xs h-5 w-5 flex items-center justify-center p-0"
                  >
                    {tab.count}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
