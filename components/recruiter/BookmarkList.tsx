"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Download, X, BadgeCheck } from "lucide-react";
import Link from "next/link";

interface BookmarkListProps {
  recruiterEmail: string;
  onClose: () => void;
}

export function BookmarkList({ recruiterEmail, onClose }: BookmarkListProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Get recruiter's bookmarked users
  const recruiter = useQuery(api.recruiters.getByEmail, { email: recruiterEmail });
  const markedEmails = recruiter?.markstar || [];

  // Get user details for each bookmarked email
  const bookmarkedUsers = useQuery(api.users.getMultipleByEmail, { emails: markedEmails });

  const handleSelectUser = (email: string) => {
    setSelectedUsers(prev => {
      if (prev.includes(email)) {
        return prev.filter(e => e !== email);
      } else {
        return [...prev, email];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === markedEmails.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers([...markedEmails]);
    }
  };

  const exportSelectedData = () => {
    if (!bookmarkedUsers || selectedUsers.length === 0) return;

    // Filter and format user data for export
    const exportData = bookmarkedUsers
      .filter(user => selectedUsers.includes(user.email))
      .map(user => ({
        username: user.username,
        email: user.email,
        firstName: user.firstName || "",
        lastName: user.lastName || ""
      }));

    // Create and download CSV
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Username,Email,First Name,Last Name\n" +
      exportData.map(user => 
        `${user.username},${user.email},${user.firstName},${user.lastName}`
      ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "bookmarked_profiles.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!bookmarkedUsers) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white w-full h-screen overflow-y-auto">
          <div className="animate-pulse text-gray-500 p-6">Loading bookmarks...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white w-full h-screen overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">Bookmarked Profiles</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedUsers.length === markedEmails.length}
                  onCheckedChange={handleSelectAll}
                  id="select-all"
                />
                <label htmlFor="select-all" className="text-sm text-gray-600">
                  Select All ({selectedUsers.length}/{markedEmails.length})
                </label>
              </div>
              <Button
                onClick={exportSelectedData}
                disabled={selectedUsers.length === 0}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Selected
              </Button>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="space-y-4">
            {bookmarkedUsers.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No bookmarked profiles yet
              </div>
            ) : (
              bookmarkedUsers.map((user) => (
                <div
                  key={user.email}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors border"
                >
                  <Checkbox
                    checked={selectedUsers.includes(user.email)}
                    onCheckedChange={() => handleSelectUser(user.email)}
                  />
                  <Link
                    href={`/${user.username}`}
                    className="flex-1 flex items-center justify-between group"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600">
                          {user.firstName && user.lastName 
                            ? `${user.firstName} ${user.lastName}`
                            : user.username}
                        </h3>
                        {user.isverified && (
                          <BadgeCheck className="w-5 h-5 text-green-600 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-sm text-gray-500">@{user.username}</p>
                        <span className="text-sm text-gray-400">•</span>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 