"use client";

import UserCard, { LoadingSkeleton } from "./UserCard";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Title } from "../ui/Title";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Doc, Id } from "@/convex/_generated/dataModel";

interface SearchGridProps {
  searchQuery: string;
  filters: {
    skills?: string[];
    location?: string;
    experience?: number;
    availability?: boolean;
    certifications?: string[];
  };
  sort?: "skills" | "name" | "recent";
  sortDirection?: "asc" | "desc";
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  recruiterEmail: string;
}

interface User extends Doc<"users"> {
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  skills?: string[];
  yearsOfExperience?: number;
  isAvailable?: boolean;
  location?: string;
  certifications?: string[];
}

export function SearchGrid({ 
  searchQuery, 
  filters, 
  sort = "recent", 
  sortDirection = "desc",
  page,
  pageSize,
  onPageChange,
  recruiterEmail
}: SearchGridProps) {
  // Get users based on search query and filters
  const results = useQuery(api.recruiters.searchUsers, { 
    query: searchQuery,
    filters,
    sort,
    sortDirection,
    page,
    pageSize
  });

  // Show loading state while data is loading
  if (results === undefined) {
    return (
      <div className="w-full mx-auto">
        <Title title="Search Results" />
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(3)].map((_, i) => (
            <LoadingSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Show message if no users found
  if (!results.users || results.users.length === 0) {
    return (
      <div className="w-full mx-auto">
        <Title title="Search Results" />
        <div className="w-full">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl 
                        border border-gray-200 p-6 sm:p-8 text-center text-gray-500
                        shadow-lg">
            No users found matching your criteria
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto">
      <Title title={`Search Results (${results.pagination.total})`} />
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-6">
          {results.users.map((user: User) => (
            <UserCard
              key={user._id}
              username={user.username}
              recruiterEmail={recruiterEmail}
            />
          ))}
        </div>

        {/* Pagination */}
        {results.pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-4">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className={`p-2 rounded-lg border ${
                page === 1 
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'border-gray-200 hover:border-blue-500 text-gray-600'
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <div className="text-sm text-gray-600">
              Page {page} of {results.pagination.totalPages}
            </div>

            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === results.pagination.totalPages}
              className={`p-2 rounded-lg border ${
                page === results.pagination.totalPages
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-gray-200 hover:border-blue-500 text-gray-600'
              }`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
