"use client";

import UserCard, { LoadingSkeleton } from "./UserCard";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Title } from "../ui/Title";

interface SearchGridProps {
  searchQuery: string;
}

export function SearchGrid({ searchQuery }: SearchGridProps) {
  // Get users based on search query
  const users = useQuery(api.users.searchUsers, { 
    query: searchQuery,
    limit: 10
  });

  // Show loading state while data is loading
  if (users === undefined) {
    return (
      <>
        <Title title="Search Results" />
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(3)].map((_, i) => (
            <LoadingSkeleton key={i} />
          ))}
        </div>
      </>
    );
  }

  // Show message if no users found
  if (!users || users.length === 0) {
    return (
      <>
        <Title title="Search Results" />
        <div className="w-full">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl 
                        border border-gray-200 p-6 sm:p-8 text-center text-gray-500
                        shadow-lg">
            No users found matching your search
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Title title={`Search Results (${users.length})`} />
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-6">
        {users.map((user) => (
          <UserCard
            key={user._id}
            username={user.username}
          />
        ))}
      </div>
    </>
  );
}
