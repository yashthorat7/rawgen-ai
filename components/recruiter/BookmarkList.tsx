"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
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
        lastName: user.lastName || "",
        skills: user.skills || [],
        projects: user.projects || [],
        platforms: user.platforms || [],
        certificates: user.certificates || []
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
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
          <div className="animate-pulse text-gray-500">Loading bookmarks...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Bookmarked Profiles</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-4">
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

        {/* List */}
        <div className="space-y-2">
          {bookmarkedUsers.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No bookmarked profiles yet
            </div>
          ) : (
            bookmarkedUsers.map((user) => (
              <div
                key={user.email}
                className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Checkbox
                  checked={selectedUsers.includes(user.email)}
                  onCheckedChange={() => handleSelectUser(user.email)}
                />
                <Link
                  href={`/${user.username}`}
                  className="flex-1 flex items-center gap-4 group"
                >
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium group-hover:text-primary-600 transition-colors">
                      {user.username}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {user.firstName} {user.lastName}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {user.skills?.length || 0} skills • {user.projects?.length || 0} projects
                  </div>
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 