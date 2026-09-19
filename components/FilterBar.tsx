"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { VOUCHER_TAGS } from "@/data/mockVouchers";

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTag: string;
  setSelectedTag: (tag: string) => void;
}

export function FilterBar({
  searchQuery,
  setSearchQuery,
  selectedTag,
  setSelectedTag,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
        <Input
          aria-label="Tìm kiếm mã giảm giá"
          placeholder="Tìm kiếm mã hoặc mô tả voucher..."
          className="pl-9 h-11 bg-white dark:bg-gray-900 shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Lọc voucher theo loại">
        {VOUCHER_TAGS.map((tag) => (
          <button
            type="button"
            key={tag}
            aria-pressed={selectedTag === tag}
            className={
              selectedTag === tag
                ? "inline-flex min-h-12 items-center rounded-lg border border-transparent bg-primary px-4 text-sm font-medium text-primary-foreground active:opacity-80"
                : "inline-flex min-h-12 items-center rounded-lg border border-transparent bg-secondary px-4 text-sm font-medium text-secondary-foreground active:bg-muted"
            }
            onClick={() => setSelectedTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
