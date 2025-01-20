"use client";

import { SignOutButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { UserSettingsDialog } from "../UserSettingsDialog";
import { LogOut, Menu } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState("up");
  const [prevOffset, setPrevOffset] = useState(0);

  useEffect(() => {
    const toggleScrollDirection = () => {
      let scrollY = window.pageYOffset;
      if (scrollY === 0) {
        setScrollDirection("up");
      } else if (scrollY > prevOffset) {
        setScrollDirection("down");
      } else if (scrollY < prevOffset) {
        setScrollDirection("up");
      }
      setPrevOffset(scrollY);
    };

    window.addEventListener("scroll", toggleScrollDirection);
    return () => {
      window.removeEventListener("scroll", toggleScrollDirection);
    };
  }, [prevOffset]);

  return scrollDirection;
}

export function Header() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { user } = useUser();
  const scrollDirection = useScrollDirection();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get username from users table
  const userInfo = useQuery(
    api.users.getUser,
    user?.primaryEmailAddress?.emailAddress
      ? { email: user.primaryEmailAddress.emailAddress }
      : "skip"
  );

  // Close dropdown on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (showDropdown) {
        setShowDropdown(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showDropdown]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-[5] bg-white/60 backdrop-blur-sm border-b border-gray-200 isolate transition-transform duration-300 ${
      scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"
    }`}>
      <div className="flex items-center justify-between px-6 py-2 mx-auto w-full lg:w-[90%] relative">
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8">
            <Image
              src="/logo.svg"
              alt="Logo"
              fill
            />
          </div>
          <span className="text-2xl font-Raleway text-gray-900 font-[900]" style={{ fontFamily: 'Raleway' }}>
            CodeX
          </span>
        </div>
        <div className="flex items-center gap-4" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className={`flex items-center gap-2 hover:bg-gray-50 px-3 py-2 rounded-md transition-colors
              ${userInfo?.username ? 'sm:border sm:border-gray-200 sm:hover:border-gray-300' : ''}
            `}
          >
            <span className="hidden sm:block text-sm font-medium">
              {userInfo?.username || 'Loading...'}
            </span>
            <Menu className="w-5 h-5 sm:hidden" />
          </button>
          
          {showDropdown && (
            <div className="absolute right-4 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-[102]">
              <div className="px-4 py-2 text-sm text-gray-600 border-b border-gray-100">
                {user?.primaryEmailAddress?.emailAddress}
              </div>
              <SignOutButton>
                <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
                  Logout
                </button>
              </SignOutButton>
            </div>
          )}
        </div>
      </div>

      <UserSettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </header>
  );
} 