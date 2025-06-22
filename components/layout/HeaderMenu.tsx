"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Copy,
  LogOut,
  Check,
  Search,
  Star,
  ChevronRight,
  X,
  ExternalLink,
} from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function HeaderMenu() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [isCopied, setIsCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState<
    "idle" | "valid" | "invalid"
  >("idle");
  const [usernameMap, setUsernameMap] = useState<Record<string, string>>({});

  const userInfo = useQuery(
    api.users.getUser,
    user?.primaryEmailAddress?.emailAddress
      ? { email: user.primaryEmailAddress.emailAddress }
      : "skip",
  );

  const usernames = useQuery(
    api.users.getUsernamesFromEmails,
    userInfo?.madeStars?.length ? { emails: userInfo.madeStars } : "skip",
  );

  useEffect(() => {
    if (usernames) {
      setUsernameMap(usernames as Record<string, string>);
    }
  }, [usernames]);

  const usernameExists = useQuery(
    api.users.checkUsernameExists,
    searchQuery.trim().length > 0 ? { username: searchQuery.trim() } : "skip",
  );

  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchStatus("idle");
    } else if (usernameExists === undefined) {
      setSearchStatus("idle");
    } else {
      setSearchStatus(usernameExists ? "valid" : "invalid");
    }
  }, [usernameExists, searchQuery]);

  const toggleStar = useMutation(api.counters.toggleStar);

  const handleCopyUsername = () => {
    if (userInfo?.username) {
      const profileUrl = `${process.env.NEXT_PUBLIC_URL}/${userInfo.username}`;
      navigator.clipboard.writeText(profileUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && searchStatus === "valid") {
      router.push(`/${searchQuery.trim()}`);
      setSearchQuery("");
      setSearchStatus("idle");
    }
  };

  const handleRemoveStar = async (email: string) => {
    if (!userInfo?._id) return;

    try {
      const username = usernameMap[email];
      if (!username) return;

      await toggleStar({
        targetUsername: username,
        starrerUserId: userInfo._id,
      });
    } catch (error) {
      console.error("Error removing star:", error);
    }
  };

  return (
    <div className="flex flex-col w-72 max-h-[80vh] bg-white rounded-md shadow-lg divide-y divide-gray-100">
      {/* Search Section */}
      <div className="px-4 py-2">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="Search username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full px-4 py-2 pr-10 text-sm border rounded-md focus:outline-none transition-all duration-200
              ${
                searchStatus === "valid"
                  ? "border-green-500 ring-2 ring-green-200"
                  : searchStatus === "invalid"
                    ? "border-red-500 ring-2 ring-red-200"
                    : "focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              }`}
          />
          <button
            type="submit"
            disabled={searchStatus !== "valid"}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-full transition-colors
              ${
                searchStatus === "valid"
                  ? "text-green-500 cursor-pointer"
                  : searchStatus === "invalid"
                    ? "text-red-500 cursor-not-allowed"
                    : "text-gray-500 cursor-not-allowed"
              }`}
          >
            <Search className="w-4 h-4" />
          </button>
        </form>
        {searchQuery.trim().length > 0 && searchStatus !== "idle" && (
          <div className="mt-1 text-xs">
            {searchStatus === "valid" ? (
              <span className="text-green-600">
                Username found! Press Enter to visit.
              </span>
            ) : (
              <span className="text-red-600">Username not found</span>
            )}
          </div>
        )}
      </div>

      {/* Starred Profiles Section */}
      <div className="px-4 py-2 overflow-y-auto max-h-[40vh]">
        <div className="flex items-center justify-between mb-3">
          <div className="text-base font-medium text-gray-900">
            Starred Profiles
          </div>
          {userInfo?.madeStars && userInfo.madeStars.length > 6 && (
            <button
              onClick={() => setIsSearching(!isSearching)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronRight
                className={`w-4 h-4 text-gray-500 transition-transform ${isSearching ? "rotate-90" : ""}`}
              />
            </button>
          )}
        </div>
        <div className="space-y-2">
          {userInfo?.madeStars
            ?.slice(0, isSearching ? undefined : 6)
            .map((email) => (
              <div
                key={email}
                className="flex items-center justify-between group"
              >
                <Link
                  href={`/${usernameMap[email] || "..."}`}
                  className="flex items-center gap-2 text-base text-gray-800 hover:text-primary-600 transition-colors"
                >
                  ⭐ {usernameMap[email] || "Loading..."}
                </Link>
                <button
                  onClick={() => handleRemoveStar(email)}
                  className="p-1 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                  title="Remove star"
                >
                  <X className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ))}
          {!userInfo?.madeStars?.length && (
            <div className="text-sm text-gray-500 text-center py-1">
              No starred profiles yet
            </div>
          )}
        </div>
      </div>

      {/* Profile Section */}
      <div className="px-4 py-2 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-medium text-base text-gray-900 block sm:hidden">
            {userInfo?.username || "Loading..."}
          </span>
          <span className="text-sm text-gray-500 hidden sm:block">
            {user?.primaryEmailAddress?.emailAddress}
          </span>
          <button
            onClick={handleCopyUsername}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
            title="Copy profile URL"
          >
            {isCopied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4 text-gray-500" />
            )}
          </button>
        </div>
      </div>

      {/* Sign Out Button */}
      <div className="px-4 py-2">
        <button
          onClick={() => signOut()}
          className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}
