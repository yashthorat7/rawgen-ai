"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Mail, Star, Eye, BadgeCheck, GraduationCap, FolderKanban, Award, Bookmark,
         Github, Linkedin, Twitter, Globe, Instagram, Facebook } from "lucide-react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";

interface UserCardProps {
  username: string;
  recruiterEmail?: string;
}

interface Profile {
  _id: Id<"profiles">;
  userId: Id<"users">;
  platformName: string;
  platformUsername: string;
  platformCacheData?: string;
  order: number;
}

// Add social platform configurations
const socialPlatformConfigs: { [key: string]: { 
  icon: any, 
  baseUrl: string,
  color: string 
}} = {
  github: {
    icon: Github,
    baseUrl: 'https://github.com/',
    color: 'hover:text-gray-900'
  },
  linkedin: {
    icon: Linkedin,
    baseUrl: 'https://linkedin.com/in/',
    color: 'hover:text-blue-700'
  },
  twitter: {
    icon: Twitter,
    baseUrl: 'https://twitter.com/',
    color: 'hover:text-blue-500'
  },
  instagram: {
    icon: Instagram,
    baseUrl: 'https://instagram.com/',
    color: 'hover:text-pink-600'
  },
  facebook: {
    icon: Facebook,
    baseUrl: 'https://facebook.com/',
    color: 'hover:text-blue-600'
  },
  website: {
    icon: Globe,
    baseUrl: '',
    color: 'hover:text-indigo-600'
  }
};

export default function UserCard({ username, recruiterEmail }: UserCardProps) {
  const router = useRouter();
  const { user } = useUser();
  const [hasStarred, setHasStarred] = useState(false);
  const [isMarked, setIsMarked] = useState(false);
  
  // Get user data first
  const userData = useQuery(api.users.getUserByUsername, { 
    username: username 
  });

  // Get marksheet URL
  const marksheetUrl = useQuery(api.recruiters.getMarksheetImageUrl, { 
    username: username 
  });

  // Get recruiter data if recruiterEmail is provided
  const recruiterData = useQuery(
    api.recruiters.getByEmail,
    recruiterEmail ? { email: recruiterEmail } : "skip"
  );

  // Then get all dependent data
  const profileImageUrl = useQuery(
    api.users.getProfileImageUrl,
    userData?.profileImage ? { storageId: userData.profileImage } : "skip"
  );
  
  const counters = useQuery(
    api.counters.get,
    userData?._id ? { userId: userData._id } : "skip"
  );
  
  const skills = useQuery(api.skills.getUserSkills, { 
    username: username 
  });
  
  const profiles = useQuery(
    api.users.getProfiles,
    userData?.email ? { email: userData.email } : "skip"
  );

  const projects = useQuery(api.projects.get, { 
    username: username 
  });
  
  const certificates = useQuery(api.certificates.get, { 
    username: username 
  });

  // Get the logged-in user's data
  const loggedInUserData = useQuery(
    api.users.getUser,
    user?.primaryEmailAddress?.emailAddress
      ? { email: user.primaryEmailAddress.emailAddress }
      : "skip"
  );

  const toggleMarkstar = useMutation(api.recruiters.toggleMarkstar);

  // Check if profile is marked by recruiter
  useEffect(() => {
    if (recruiterData?.markstar && userData?.email) {
      setIsMarked(recruiterData.markstar.includes(userData.email));
    }
  }, [recruiterData?.markstar, userData?.email]);

  // Add debug log for recruiter email
  useEffect(() => {
    console.log("UserCard received recruiterEmail:", recruiterEmail);
  }, [recruiterEmail]);

  const handleMarkClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!recruiterEmail || !userData?.email) return;

    try {
      const result = await toggleMarkstar({
        recruiterEmail,
        userEmail: userData.email
      });

      if (result.success) {
        setIsMarked(result.action === "marked");
      }
    } catch (error) {
      console.error('Error toggling mark:', error);
    }
  };

  // Return loading skeleton if no user data
  if (!userData) {
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

  // Group platforms by type and count
  const platformGroups = profiles?.reduce((acc, profile) => {
    const name = profile.platformName.toLowerCase();
    if (!acc[name]) {
      acc[name] = { count: 1, platform: profile };
    } else {
      acc[name].count++;
    }
    return acc;
  }, {} as { [key: string]: { count: number, platform: Profile } }) || {};

  // Format number helper
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Get the first platform for display
  const primaryPlatform = profiles?.[0];
  const totalPlatforms = profiles?.length || 0;

  // Parse social links from counters
  const socialLinks = counters?.socialLinks ? JSON.parse(counters.socialLinks) : {};

  return (
    <div className="w-full h-full">
      <div 
        onClick={handleCardClick}
        className={`flex flex-col sm:flex-row relative bg-white/90 
                    backdrop-blur-sm w-full overflow-hidden
                    shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out 
                    cursor-pointer p-4 sm:p-5 rounded-lg border border-gray-200/50 group
                    min-h-[200px] sm:min-h-[180px] h-full`}
      >
        {/* High Priority Action Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            console.log("Button clicked!");
            console.log("User email:", userData?.email);
            console.log("Recruiter email:", recruiterEmail);
            if (!recruiterEmail || !userData?.email) {
              console.log("Missing email - Recruiter:", !recruiterEmail, "User:", !userData?.email);
              return;
            }
            try {
              console.log("Attempting to toggle markstar...");
              toggleMarkstar({
                recruiterEmail,
                userEmail: userData.email
              }).then(result => {
                console.log("Toggle result:", result);
                if (result.success) {
                  console.log(`Successfully ${result.action} the profile`);
                  setIsMarked(result.action === "marked");
                }
              });
            } catch (error) {
              console.error('Error toggling mark:', error);
            }
          }}
          style={{ zIndex: 2147483647 }}
          className="fixed top-2 right-2 w-10 h-10 rounded-full bg-white/95 
                   shadow-lg hover:shadow-2xl transition-all duration-300 
                   hover:scale-110 hover:bg-indigo-50 border border-gray-200
                   flex items-center justify-center group"
        >
          <Bookmark 
            className={`w-5 h-5 ${isMarked ? 'text-green-600 fill-green-600' : 'text-indigo-600'} 
                     transition-all duration-300 group-hover:scale-110`}
          />
        </button>

        {/* Left Section - User Image & Name */}
        <div className="flex-shrink-0 w-full sm:w-[140px] flex flex-col items-center justify-center 
                      bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-xl 
                      transition-all duration-300 group-hover:from-blue-100/50 group-hover:to-purple-100/50
                      p-4 relative mb-4 sm:mb-0">
          <div className="relative flex items-center justify-center">
            {profileImageUrl ? (
              <div className="relative w-20 h-20 sm:w-24 sm:h-24">
                <Image
                  src={profileImageUrl}
                  alt={userData.username}
                  fill
                  className="rounded-full object-cover ring-2 ring-white shadow-md"
                />
              </div>
            ) : (
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 
                           flex items-center justify-center text-xl sm:text-2xl font-semibold text-gray-600
                           ring-2 ring-white shadow-md">
                {userData.username.slice(0, 2).toUpperCase()}
                {userData.isverified && (
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                    <BadgeCheck className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Section - User Info */}
        <div className="flex-1 flex flex-col min-w-0 sm:pl-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-2xl sm:text-2xl font-bold text-gray-900 truncate">
                {userData.firstName && userData.lastName 
                  ? `${userData.firstName} ${userData.lastName}`
                  : userData.username}
              </h3>
              {userData.isverified && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (marksheetUrl) {
                        window.open(marksheetUrl, '_blank');
                      }
                    }}
                    className="inline-flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors duration-200"
                    title="View Marksheet"
                  >
                    <BadgeCheck className="w-5 h-5" />
                    <span className="text-xs font-medium">Verified</span>
                  </button>
                  {userData.email && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`mailto:${userData.email}`, '_blank');
                      }}
                      className="inline-flex items-center gap-1 bg-red-400 text-white px-3 py-1 rounded-lg hover:bg-red-500 transition-colors duration-200"
                      title="Send Email"
                    >
                      <Mail className="w-5 h-5" />
                    </button>
                  )}
                </>
              )}
            </div>
            <div className="flex flex-wrap justify-between items-center mt-2">
              {/* Stats Section */}
              <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 rounded-md"
                  data-tip={`${formatNumber(counters?.profileViews || 0)} Profile Views`}
                >
                  <Eye className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">
                    {formatNumber(counters?.profileViews || 0)}
                  </span>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-1.5 px-2 py-1 bg-pink-50 rounded-md"
                  data-tip={`${formatNumber(counters?.gotStars?.length || 0)} Stars`}
                >
                  <Star className="w-4 h-4 text-pink-600" />
                  <span className="text-sm font-medium text-pink-700">
                    {formatNumber(counters?.gotStars?.length || 0)}
                  </span>
                </motion.div>

                {userData.cgpa && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1.5 px-2 py-1 bg-orange-50 rounded-md"
                    data-tip={`CGPA: ${userData.cgpa.toFixed(1)}`}
                  >
                    <GraduationCap className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-700">
                      {userData.cgpa.toFixed(1)}
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-2 flex-wrap">
                {Object.entries(socialLinks).map(([platform, username]) => {
                  const config = socialPlatformConfigs[platform.toLowerCase()];
                  if (!config || !username || typeof username !== 'string') return null;

                  const Icon = config.icon;
                  const url = platform === 'website' ? username : `${config.baseUrl}${username}`;

                  return (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className={`p-1.5 rounded-lg hover:bg-gray-100/80 transition-colors ${config.color}
                                group/icon flex items-center gap-1.5`}
                      data-tip={`${platform}: ${username}`}
                    >
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Skills Strip with Animation */}
          <div className="mt-4 relative">
            <div className="flex gap-1.5 sm:gap-2 overflow-x-hidden">
              <div className="animate-scrolling-skills flex gap-1.5 sm:gap-2">
                {skills?.map((skillCategory) => (
                  skillCategory.skills.map((skillName, index) => (
                    <span
                      key={`${skillCategory._id}-${index}`}
                      className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium 
                               bg-blue-50/80 text-blue-700 backdrop-blur-sm border border-blue-100/50
                               transition-all duration-200 hover:bg-blue-100/80 whitespace-nowrap flex-shrink-0"
                    >
                      {skillName}
                    </span>
                  ))
                ))}
                {/* Duplicate skills for seamless loop */}
                {skills?.map((skillCategory) => (
                  skillCategory.skills.map((skillName, index) => (
                    <span
                      key={`${skillCategory._id}-${index}-duplicate`}
                      className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium 
                               bg-blue-50/80 text-blue-700 backdrop-blur-sm border border-blue-100/50
                               transition-all duration-200 hover:bg-blue-100/80 whitespace-nowrap flex-shrink-0"
                    >
                      {skillName}
                    </span>
                  ))
                ))}
              </div>
            </div>
          </div>

          {/* Project and Certificate Counts */}
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2"
            >
              <span className="font-medium">Projects:</span>
              <span className="text-indigo-600 font-semibold">{projects?.length || 0}</span>
            </motion.div>
            <span className="text-gray-300">•</span>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2"
            >
              <span className="font-medium">Certificates:</span>
              <span className="text-emerald-600 font-semibold">{certificates?.length || 0}</span>
            </motion.div>
          </div>

          {/* Platform Icons */}
          <div className="mt-auto pt-4">
            <div className="flex gap-2 sm:gap-3 items-center flex-wrap">
              {Object.entries(platformGroups).map(([platform, { count, platform: profileData }]) => (
                <div key={platform} className="flex items-center gap-1.5">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white shadow-md 
                               ring-1 ring-white overflow-hidden
                               transition-transform duration-200 hover:scale-110 relative">
                    <Image
                      src={platformIcons[platform] || '/globe.png'}
                      alt={profileData.platformName}
                      width={42}
                      height={42}
                      className="w-full h-full p-1.5 object-contain"
                    />
                  </div>
                  {count > 1 && (
                    <span className="text-xs font-medium text-gray-600">
                      ×{count}
                    </span>
                  )}
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
    <div className="w-full">
      <div className={`flex flex-col sm:flex-row relative bg-white/90 
                    backdrop-blur-sm w-full overflow-hidden
                    shadow-lg p-4 sm:p-5 rounded-lg border border-gray-200/50
                    min-h-[200px] sm:min-h-[180px]`}>
        {/* Left Section - User Image & Name */}
        <div className="flex-shrink-0 w-full sm:w-[140px] flex flex-col items-center 
                      bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-xl 
                      p-4 relative mb-4 sm:mb-0">
          <div className="relative flex items-center justify-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-200 animate-pulse ring-2 ring-white shadow-md" />
          </div>
        </div>

        {/* Right Section - User Info */}
        <div className="flex-1 flex flex-col min-w-0 sm:pl-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-48 h-6 sm:h-7 bg-gray-200 rounded animate-pulse" />
              <div className="w-16 h-5 bg-gray-200 rounded-full animate-pulse" />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
              <div className="w-36 h-5 bg-gray-200 rounded animate-pulse" />
            </div>
            
            {/* Stats Section */}
            <div className="mt-3 flex items-center gap-3 flex-wrap">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-16 h-7 bg-gray-200 rounded-md animate-pulse" />
              ))}
            </div>
          </div>

          {/* Skills Strip */}
          <div className="mt-4 flex flex-wrap gap-1.5 sm:gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-16 sm:w-20 h-6 bg-gray-200 rounded-full animate-pulse" />
            ))}
          </div>

          {/* Project and Certificate Counts Skeleton */}
          <div className="mt-4 flex items-center gap-4">
            <div className="w-24 h-5 bg-gray-200 rounded animate-pulse" />
            <div className="w-1 h-1 bg-gray-200 rounded-full animate-pulse" />
            <div className="w-28 h-5 bg-gray-200 rounded animate-pulse" />
          </div>

          {/* Platform Icons */}
          <div className="mt-auto pt-4">
            <div className="flex gap-2 sm:gap-3 items-center">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 animate-pulse ring-2 ring-white" />
                  <div className="w-3 h-4 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
