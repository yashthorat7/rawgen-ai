"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Mail, Star, Eye, Github, Linkedin, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { SocialMedia } from "../intro/SocialMedia";

interface UserCardProps {
  username: string;
}

interface Profile {
  _id: Id<"profiles">;
  userId: Id<"users">;
  platformName: string;
  platformUsername: string;
  platformCacheData?: string;
  order: number;
}

export default function UserCard({ username }: UserCardProps) {
  const router = useRouter();
  
  // Get user data
  const user = useQuery(api.users.getUserByUsername, { 
    username: username 
  });
  
  // Get profile image URL if user has one
  const profileImageUrl = useQuery(
    api.users.getProfileImageUrl,
    user?.profileImage ? { storageId: user.profileImage } : "skip"
  );
  
  // Only fetch additional data if we have a user
  const counters = useQuery(api.counters.get, 
    user?._id ? { userId: user._id } : "skip"
  );
  
  const skills = useQuery(api.skills.getUserSkills, 
    user?.username ? { username: user.username } : "skip"
  );
  
  const profiles = useQuery(api.users.getProfiles, 
    user?.email ? { email: user.email } : "skip"
  );

  if (!user) {
    return <LoadingSkeleton />;
  }

  const platformIcons: { [key: string]: string } = {
    leetcode: "/leetcode.png",
    codechef: "/codechef.png",
    geeksforgeeks: "/geeksforgeeks.png",
    codeforces: "/codeforces.png"
  };

  const handleCardClick = () => {
    router.push(`/${username}?recruiter=true`);
  };

  return (
    <div className="w-full h-full">
      <div 
        onClick={handleCardClick}
        className={`grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-4 relative bg-white/90 
                    backdrop-blur-sm w-full h-full min-h-[225px] overflow-hidden
                    shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out 
                    cursor-pointer p-5 rounded-lg border border-gray-200/50 group`}
      >
        
        {/* Left Section - User Image & Name */}
        <div className="w-full bg-gradient-to-br from-blue-50/50 to-purple-50/50 h-full flex flex-col items-center 
                      rounded-xl transition-all duration-300 group-hover:from-blue-100/50 group-hover:to-purple-100/50
                      sm:min-h-[200px]">
          <div className="flex-1 flex items-center justify-center">
            {profileImageUrl ? (
              <div className="relative w-24 h-24 sm:w-28 sm:h-28">
                <Image
                  src={profileImageUrl}
                  alt={user.username}
                  fill
                  className="rounded-full object-cover ring-2 ring-white shadow-md"
                />
              </div>
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 
                           flex items-center justify-center text-2xl font-semibold text-gray-600
                           ring-2 ring-white shadow-md">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </div>
            )}
          </div>
          <div className="text-sm text-gray-800 font-medium mt-4">
            {user.isverified && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium 
                           bg-green-100/80 text-green-800 backdrop-blur-sm">
                Verified
              </span>
            )}
          </div>
        </div>

        {/* Right Section - User Info */}
        <div className="relative flex flex-col h-full sm:min-h-[200px]">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
              {user.firstName} {user.lastName}
            </h3>
            <div className="flex items-center text-sm text-gray-500 mt-2">
              <Mail className="w-4 h-4 mr-2" />
              {user.email}
            </div>
          </div>

          {/* Skills Strip */}
          <div className="mt-4 flex flex-wrap gap-2">
            {skills?.map((skillCategory) => {
              const skillsArray = skillCategory.skills;
              return skillsArray.slice(0, 4).map((skillName, index) => (
                <span
                  key={`${skillCategory._id}-${index}`}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium 
                           bg-blue-50/80 text-blue-700 backdrop-blur-sm border border-blue-100/50
                           transition-all duration-200 hover:bg-blue-100/80"
                >
                  {skillName}
                </span>
              ));
            })}
            {skills && skills.reduce((total, skill) => total + skill.skills.length, 0) > 4 && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium 
                           bg-gray-50/80 text-gray-700 backdrop-blur-sm border border-gray-100/50">
                +{skills.reduce((total, skill) => total + skill.skills.length, 0) - 4} more
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="mt-auto pt-4 flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center text-sm font-medium text-gray-600"
              >
                <Eye className="w-4 h-4 mr-1.5" />
                {counters?.profileViews || 0}
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center text-sm font-medium text-gray-600"
              >
                <Star className="w-4 h-4 mr-1.5" />
                {counters?.gotStars?.length || 0}
              </motion.div>
            </div>

            {/* Platform Icons */}
            <div className="flex -space-x-2">
              {profiles?.map((profile: Profile) => (
                <div
                  key={profile._id}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white shadow-md 
                           ring-2 ring-white overflow-hidden relative
                           transition-transform duration-200 hover:scale-110 hover:z-10"
                >
                  <Image
                    src={platformIcons[profile.platformName.toLowerCase()] || '/globe.png'}
                    alt={profile.platformName}
                    fill
                    className="p-1.5 object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LoadingSkeleton() {
  return (
    <div className="w-full h-full">
      <div className={`grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-4 relative bg-white/90 
                    backdrop-blur-sm w-full h-full min-h-[225px] overflow-hidden
                    shadow-lg p-6 rounded-2xl border border-gray-200/50`}>
        {/* Left Section - User Image & Name */}
        <div className="w-full bg-gradient-to-br from-blue-50/50 to-purple-50/50 h-full flex flex-col items-center rounded-xl">
          <div className="flex-1 flex items-center justify-center">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gray-200 animate-pulse ring-2 ring-white shadow-md" />
          </div>
          <div className="w-20 h-6 bg-gray-200 rounded-full animate-pulse mt-4" />
        </div>

        {/* Right Section - User Info */}
        <div className="relative flex flex-col h-full sm:min-h-[200px]">
          <div>
            <div className="w-48 h-8 bg-gray-200 rounded animate-pulse mb-3" />
            <div className="w-36 h-5 bg-gray-200 rounded animate-pulse" />
          </div>

          {/* Skills Strip */}
          <div className="mt-4 flex flex-wrap gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-20 h-6 bg-gray-200 rounded-full animate-pulse" />
            ))}
          </div>

          {/* Stats */}
          <div className="mt-auto pt-4 flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-5 bg-gray-200 rounded animate-pulse" />
              <div className="w-16 h-5 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="flex -space-x-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 animate-pulse ring-2 ring-white" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
