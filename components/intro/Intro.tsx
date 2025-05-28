"use client";

import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { PlatformCounter } from "./ProfileCounter";
import { UserSettingsDialog } from "./UserSettingsDialog";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Image from "next/image";
import { CheckCircle, User } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { SocialMedia } from "./SocialMedia";
import { SocialLinks } from "@/lib/types";

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

interface IntroProps {
  username?: string;
  isPublicView?: boolean;
}

export function Intro({ username, isPublicView = false }: IntroProps) {
  const { user } = useUser();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const publicUserData = useQuery(
    api.users.getUserByUsername,
    username ? { username } : "skip"
  );

  const privateUserData = useQuery(
    api.users.getUser,
    !isPublicView && user?.primaryEmailAddress?.emailAddress
      ? { email: user.primaryEmailAddress.emailAddress }
      : "skip"
  );

  const userInfo = isPublicView ? publicUserData : privateUserData;

  const profileImageUrl = useQuery(
    api.users.getProfileImageUrl,
    userInfo?.profileImage ? { storageId: userInfo.profileImage } : "skip"
  );

  const counters = useQuery(
    api.counters.get,
    userInfo?._id ? { userId: userInfo._id } : "skip"
  );

  const socialLinks: SocialLinks | null = counters?.socialLinks 
    ? JSON.parse(counters.socialLinks)
    : null;

  const defaultName = isPublicView
    ? { firstName: "", lastName: "" }
    : { firstName: user?.firstName || "", lastName: user?.lastName || "" };

  const displayName = userInfo === undefined
    ? null
    : userInfo
      ? `${userInfo.firstName || defaultName.firstName} ${userInfo.lastName || defaultName.lastName}`.trim()
      : `${defaultName.firstName} ${defaultName.lastName}`.trim();

  return (
    <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-2 sm:gap-4 mb-2 sm:mb-4 -mt-4 sm:mt-1 px-8 select-none">
      <div className="text-center sm:text-left -mt-8 sm:mt-0">
        <h1 className="text-2xl sm:text-4xl font-bold -mb-4 sm:-mb-1">
          {displayName === null ? (
            <span className="text-2xl sm:text-4xl text-gray-900">Hi, there 👋</span>
          ) : (
            <>
              {displayName && <span className="text-xl sm:text-3xl text-gray-400">I'm </span>}
              <span>{displayName}</span>
            </>
          )}
        </h1>
        <PlatformCounter username={username} isPublicView={isPublicView} />
        {(socialLinks || (!isPublicView && user?.primaryEmailAddress?.emailAddress)) && (
          <SocialMedia
            github={socialLinks?.github}
            linkedin={socialLinks?.linkedin}
            twitter={socialLinks?.twitter}
            website={socialLinks?.website}
            email={!isPublicView ? user?.primaryEmailAddress?.emailAddress : undefined}
            className="justify-center sm:justify-start mt-2"
            iconSize={18}
            isLoading={counters === undefined}
          />
        )}
      </div>

      <div
        className={`scale-75 sm:scale-100 relative ${!isPublicView ? 'cursor-pointer group' : ''}`}
        onClick={() => !isPublicView && setIsSettingsOpen(true)}
      >
        <div className="w-40 h-40 sm:w-46 sm:h-46 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 transition-all duration-200 group-hover:border-blue-500">
          {userInfo?.profileImage && profileImageUrl ? (
            <div className="relative w-full h-full">
              <Image
                src={profileImageUrl}
                alt="Profile"
                fill
                className="object-cover rounded-full"
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 group-hover:text-blue-500">
              <User className="w-24 h-24" strokeWidth={1.5} />
            </div>
          )}

          {!isPublicView && (
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-full transition-all
            duration-200 flex items-center justify-center">
              <span className="text-white opacity-0 text-2xl group-hover:opacity-100 text-m text-center flex flex-row">
                Edit
                <br />
                Profile
              </span>
            </div>
          )}
        </div>

        {/* Verification Badge */}
        {userInfo?.isverified && (
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

      {!isPublicView && (
        <UserSettingsDialog
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          defaultFirstName={defaultName.firstName}
          defaultLastName={defaultName.lastName}
        />
      )}
    </div>
  );
} 