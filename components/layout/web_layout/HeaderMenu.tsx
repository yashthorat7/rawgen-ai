"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Copy, LogOut, Check } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { useState } from "react";

export function HeaderMenu() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isCopied, setIsCopied] = useState(false);

  const userInfo = useQuery(
    api.users.getUser,
    user?.primaryEmailAddress?.emailAddress
      ? { email: user.primaryEmailAddress.emailAddress }
      : "skip"
  );

  const handleCopyUsername = () => {
    if (userInfo?.username) {
      const profileUrl = `${process.env.NEXT_PUBLIC_URL}/${userInfo.username}`;
      navigator.clipboard.writeText(profileUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    }
  };

  return (
    <div className="flex flex-col w-56 py-2 bg-white rounded-md shadow-md">
      <div className="px-4 py-2 flex items-center justify-between">
        <span className="text-sm font-medium">
          {userInfo?.username || "Loading..."}
        </span>
        <button
          onClick={handleCopyUsername}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          title="Copy profile URL"
        >
          {isCopied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4 text-gray-500" />
          )}
        </button>
      </div>
      
      <div className="px-4 py-2 text-sm text-gray-500">
        {user?.primaryEmailAddress?.emailAddress}
      </div>
      
      <div className="h-px bg-gray-200 my-1" />
      
      <button
        onClick={() => signOut()}
        className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Sign out
      </button>
    </div>
  );
} 