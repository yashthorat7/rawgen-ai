"use client";

import { SignOutButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useState, useEffect } from "react";
import { UserSettingsDialog } from "../UserSettingsDialog";
import { LogOut } from "lucide-react";

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
          <span className="text-2xl font-Raleway font-black text-gray-900">
            CodeX
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center cursor-pointer relative z-[101]"
            >
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-[102]">
                <div className="px-4 py-2 text-sm text-gray-600 border-b border-gray-100">
                  {user?.primaryEmailAddress?.emailAddress}
                </div>
                <SignOutButton>
                  <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
                    Sign Out
                  </button>
                </SignOutButton>
              </div>
            )}
          </div>
        </div>
      </div>

      <UserSettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </header>
  );
} 