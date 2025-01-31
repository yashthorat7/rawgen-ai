"use client";

import { useState, useMemo } from "react";
import { SearchBar } from "./SearchBar";
import { SearchResults, FilterState } from "./SearchResults";
import { SearchTabs, TabType } from "./SearchTabs";
import { ChevronLeft, ChevronRight, MoreHorizontal, Bookmark } from "lucide-react";
import { BookmarkList } from "../BookmarkList";
import { Button } from "@/components/ui/button";

interface SearchContainerProps {
  recruiterEmail: string;
}

const ITEMS_PER_PAGE = 6;

export default function SearchContainer({ recruiterEmail }: SearchContainerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("users");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    verified: false,
    sortBy: "recent"
  });

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calculate which page numbers to show
  const pageNumbers = useMemo(() => {
    const pages: (number | 'ellipsis')[] = [];
    
    if (totalPages <= 7) {
      // Show all pages if total pages are 7 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage <= 3) {
        // If current page is near the start
        pages.push(2, 3, 4, 'ellipsis', totalPages - 1, totalPages);
      } else if (currentPage >= totalPages - 2) {
        // If current page is near the end
        pages.push('ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        // If current page is in the middle
        pages.push(
          'ellipsis',
          currentPage - 1,
          currentPage,
          currentPage + 1,
          'ellipsis',
          totalPages
        );
      }
    }
    
    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <SearchBar 
            searchQuery={searchQuery} 
            onSearchChange={(query: string) => {
              setSearchQuery(query);
              setCurrentPage(1);
            }}
            placeholder={`Search ${activeTab}...`}
          />
        </div>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => setShowBookmarks(true)}
        >
          <Bookmark className="w-4 h-4" />
          Bookmarks
        </Button>
      </div>

      <SearchTabs 
        activeTab={activeTab} 
        onTabChange={(tab) => {
          setActiveTab(tab);
          setCurrentPage(1);
        }}
      />
      <SearchResults 
        tab={activeTab}
        searchQuery={searchQuery}
        filters={filters}
        onFilterChange={(newFilters) => {
          setFilters(newFilters);
          setCurrentPage(1);
        }}
        recruiterEmail={recruiterEmail}
        page={currentPage}
        itemsPerPage={ITEMS_PER_PAGE}
        onTotalItemsChange={setTotalItems}
      />

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6 pb-8">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg transition-all duration-200 ${
              currentPage === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            aria-label="Previous page"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1">
            {pageNumbers.map((pageNumber, idx) => {
              if (pageNumber === 'ellipsis') {
                return (
                  <div 
                    key={`ellipsis-${idx}`} 
                    className="w-8 h-8 flex items-center justify-center text-gray-400"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </div>
                );
              }

              return (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`w-8 h-8 rounded-lg transition-all duration-200 ${
                    currentPage === pageNumber
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg transition-all duration-200 ${
              currentPage === totalPages
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            aria-label="Next page"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Bookmark List Modal */}
      {showBookmarks && (
        <BookmarkList
          recruiterEmail={recruiterEmail}
          onClose={() => setShowBookmarks(false)}
        />
      )}
    </div>
  );
} 