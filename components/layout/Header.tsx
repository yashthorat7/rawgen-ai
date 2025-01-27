"use client";

import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { UserSettingsDialog } from "../intro/UserSettingsDialog";
import { Menu } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { HeaderMenu } from "./HeaderMenu";
import Link from "next/link";

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
  const { user, isSignedIn } = useUser();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const scrollDirection = useScrollDirection();

  const userInfo = useQuery(
    api.users.getUser,
    user?.primaryEmailAddress?.emailAddress
      ? { email: user.primaryEmailAddress.emailAddress }
      : "skip"
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className={`sticky transition-transform duration-300 ${
      scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"
    } top-0 z-20 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 select-none`}>
      <div className="flex items-center justify-between px-6 py-2 mx-auto w-full lg:w-[90%] relative">
        <Link href="/" className="flex items-center gap-2">
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
        </Link>
        <div className="flex items-center gap-4" ref={dropdownRef}>
          {isSignedIn ? (
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 hover:bg-gray-50 px-3 py-2 rounded-md transition-colors sm:border sm:border-gray-200 sm:hover:border-gray-300"
            >
              <span className="hidden sm:block text-sm font-medium">
                {userInfo?.username || (
                  <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
                )}
              </span>
              <Menu className="w-5 h-5 sm:hidden" />
            </button>
          ) : (
            <Link 
              href="/sign-in"
              className="flex items-center gap-2 hover:bg-gray-50 px-3 py-2 rounded-md transition-colors text-sm font-medium border border-gray-200 hover:border-gray-300"
            >
              Sign In
            </Link>
          )}
          
          {showDropdown && (
            <div className="absolute right-4 top-full mt-2 z-[100]">
              <HeaderMenu />
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