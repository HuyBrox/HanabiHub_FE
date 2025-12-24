"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSearch } from "@/contexts/SearchContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Search as SearchIcon } from "lucide-react";
import { useSearchUsersQuery } from "@/store/services/userApi";
import { useDebounce } from "@/hooks/useDebounce";

export function SearchComponent() {
  const { closeSearch } = useSearch();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const debouncedQuery = useDebounce(searchQuery, 300);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading recent searches:", e);
      }
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return;
    const updated = [query, ...recentSearches.filter((s) => s !== query)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  const removeRecentSearch = (query: string) => {
    const updated = recentSearches.filter((s) => s !== query);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  // Fetch users when there's a search query
  const { data: usersData, isLoading } = useSearchUsersQuery(
    { q: debouncedQuery },
    {
      skip: !debouncedQuery || debouncedQuery.length < 2,
    }
  );

  const users = usersData?.data || [];

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleUserClick = (user: any) => {
    saveRecentSearch(user.username || user.fullname || user.email);
    closeSearch();
    router.push(`/profile/${user._id || user.id}`);
  };

  const handleRecentSearchClick = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Tìm kiếm</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeSearch}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Tìm kiếm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 h-10 rounded-lg bg-muted/50"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchQuery("")}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {searchQuery ? (
          <div className="p-4">
            {isLoading ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                Đang tìm kiếm...
              </div>
            ) : users.length > 0 ? (
              <div className="space-y-1">
                {users.map((user: any) => (
                  <div
                    key={user._id || user.id}
                    onClick={() => handleUserClick(user)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={user.avatar || "/images/placeholders/placeholder.svg"}
                        alt={user.fullname || user.username}
                      />
                      <AvatarFallback>
                        {(user.fullname || user.username || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {user.username || user.fullname || "Unknown"}
                      </p>
                      {user.fullname && user.username && (
                        <p className="text-xs text-muted-foreground truncate">
                          {user.fullname}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-muted-foreground">
                Không tìm thấy kết quả nào
              </div>
            )}
          </div>
        ) : (
          <div className="p-4">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm">Mới đây</h3>
                  <Button
                    variant="link"
                    onClick={clearRecentSearches}
                    className="text-primary h-auto p-0 text-xs"
                  >
                    Xóa tất cả
                  </Button>
                </div>
                <div className="space-y-1">
                  {recentSearches.map((query, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors group"
                      onClick={() => handleRecentSearchClick(query)}
                    >
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <SearchIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{query}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeRecentSearch(query);
                        }}
                        className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {recentSearches.length === 0 && (
              <div className="text-center py-12 text-sm text-muted-foreground">
                <SearchIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nhập từ khóa để tìm kiếm người dùng</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

