"use client";

import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { PlatformCounter } from "./PlatformCounter";
import { UserSettingsDialog } from "./UserSettingsDialog";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Image from "next/image";
import { CheckCircle } from "lucide-react";
import { motion, Variants } from "framer-motion";

const shineAnimation: Variants = {
  initial: { x: "-100%" },
  animate: { 
    x: "200%",
    transition: {
      repeat: Infinity,
      repeatType: "loop" as const,
      duration: 1.5,
      ease: "easeInOut",
      repeatDelay: 2
    }
  }
};

export function Intro() {
  const { user } = useUser();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const profileImage = useQuery(
    api.users.getUserProfileImage,
    user?.primaryEmailAddress?.emailAddress
      ? { email: user.primaryEmailAddress.emailAddress }
      : "skip"
  );

  const userSettings = useQuery(
    api.users.getUser,
    user?.primaryEmailAddress?.emailAddress
      ? { email: user.primaryEmailAddress.emailAddress }
      : "skip"
  );

  // Get default name from Clerk user data
  const defaultName = {
    firstName: user?.firstName || "",
    lastName: user?.lastName || ""
  };

  // Only show name after database is fetched
  const displayName = userSettings === undefined
    ? "" // Loading state
    : userSettings
      ? `${userSettings.firstName || defaultName.firstName} ${userSettings.lastName || defaultName.lastName}`.trim()
      : `${defaultName.firstName} ${defaultName.lastName}`.trim();

  return (
    <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-2 sm:gap-4 mb-2 sm:mb-4 -mt-4 sm:mt-1 px-8">
      <div className="text-center sm:text-left -mt-8 sm:mt-0">
        <h1 className="text-2xl sm:text-4xl font-bold -mb-4 sm:-mb-1">
          {displayName && <span className="text-xl sm:text-3xl text-gray-400">I'm </span>}
          <span>{displayName}</span>
        </h1>
        <PlatformCounter />
      </div>

      <div
        className="scale-75 sm:scale-100 cursor-pointer group relative"
        onClick={() => setIsSettingsOpen(true)}
      >
        <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 transition-all duration-200 group-hover:border-blue-500">
          {profileImage ? (
            <div className="relative w-full h-full">
              <Image
                src={profileImage}
                alt="Profile"
                fill
                className="object-cover rounded-full"
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 group-hover:text-blue-500">
              <svg
                className="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
          )}

          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-full transition-all duration-200 flex items-center justify-center">
            <span className="text-white opacity-0 group-hover:opacity-100 text-m flex flex-row">
              Edit Profile
            </span>
          </div>
        </div>

        {/* Verification Badge */}
        {userSettings?.isverified && (
          <div className="absolute -bottom-1 border-[#f8fafc] border-4 -right-1 bg-green-600 rounded-full p-2 overflow-hidden">
            <motion.div
              className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
              initial="initial"
              animate="animate"
              variants={shineAnimation}
            />
            <CheckCircle className="w-7 h-7 text-white stroke-[2.5] relative z-10" />
          </div>
        )}
      </div>

      <UserSettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        defaultFirstName={defaultName.firstName}
        defaultLastName={defaultName.lastName}
      />
    </div>
  );
} 