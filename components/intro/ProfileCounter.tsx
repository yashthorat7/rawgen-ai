"use client";

import CountUp from 'react-countup';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";

interface PlatformCounterProps {
  username?: string;
  isPublicView?: boolean;
}

export function PlatformCounter({ username, isPublicView = false }: PlatformCounterProps) {
  const { user } = useUser();
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [hasStarred, setHasStarred] = useState(false);

  const formatIndianNumber = (num: number): string => {
    if (num < 1000) return num.toString();
    
    if (num >= 10000000) { // 1 Crore
      return (num / 10000000).toFixed(1) + 'C';
    }
    if (num >= 100000) { // 1 Lakh
      return (num / 100000).toFixed(1) + 'L';
    }
    if (num >= 1000) { // 1 Thousand
      return (num / 1000).toFixed(1) + 'K';
    }
    
    return num.toString();
  };

  // Get user data - either from username (public) or email (private)
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

  const counters = useQuery(
    api.counters.get,
    userInfo?._id ? { userId: userInfo._id } : "skip"
  );

  // Get the logged-in user's Convex ID if they're authenticated
  const loggedInUserData = useQuery(
    api.users.getUser,
    user?.primaryEmailAddress?.emailAddress
      ? { email: user.primaryEmailAddress.emailAddress }
      : "skip"
  );

  const toggleStar = useMutation(api.counters.toggleStar);
  const incrementViews = useMutation(api.counters.incrementViews);

  useEffect(() => {
    if (counters !== undefined) {
      setShouldAnimate(true);
    }
  }, [counters]);

  // Add view increment effect
  useEffect(() => {
    const handleViewIncrement = async () => {
      if (!userInfo?._id) return;

      // Don't increment if:
      // 1. It's dashboard view (not public view) OR
      // 2. Viewer is viewing their own profile (logged in user viewing their profile in any mode)
      const isSelfView = user?.username === userInfo.username;
      const shouldIncrement = isPublicView && !isSelfView;

      if (shouldIncrement) {
        try {
          await incrementViews({
            userId: userInfo._id
          });
        } catch (error) {
          console.error('Error incrementing views:', error);
        }
      }
    };

    // Call view increment when component mounts
    handleViewIncrement();
  }, [userInfo?._id, isPublicView, user?.username, userInfo?.username]);

  useEffect(() => {
    if (userInfo?.madeStars && user?.username) {
      setHasStarred(userInfo.madeStars.includes(user.username));
    }
  }, [userInfo?.madeStars, user?.username]);

  const handleStarClick = async () => {
    // Only proceed if we have the required user info and the viewer is logged in
    if (!userInfo?._id || !loggedInUserData?._id) return;


    try {
      const result = await toggleStar({
        targetUsername: userInfo.username,
        starrerUserId: loggedInUserData._id
      });

      if (result.success) {
        setHasStarred(result.action === "starred");
      }
    } catch (error) {
      console.error('Error toggling star:', error);
    }
  };

  const countUpProps = {
    duration: 2,
    separator: ",",
  };

  if (!userInfo || counters === undefined) return null;

  // Determine if star button should be clickable
  const canStar = Boolean(user?.id && userInfo.username !== user.username);

  return (
    <div className="flex flex-wrap gap-2 sm:gap-3 mt-3 sm:mt-2">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="px-0.5 sm:px-1 pl-1.5 sm:pl-2 py-0.5 sm:py-1 bg-primary-500 rounded text-[13px] sm:text-[15px] font-medium text-white flex items-center gap-1.5 sm:gap-2"
      >
        Views
        <span className="bg-white text-primary-700 px-1.5 sm:px-2 py-0.2 rounded-sm font-semibold min-w-[2rem] sm:min-w-[2.5rem] text-center">
          {shouldAnimate ? (
            <CountUp 
              start={0} 
              end={counters?.profileViews || 0} 
              {...countUpProps}
              formattingFn={(value) => formatIndianNumber(value)}
            />
          ) : (
            formatIndianNumber(counters?.profileViews || 0)
          )}
        </span>
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`px-0.5 sm:px-1 pl-1.5 sm:pl-2 py-0.5 sm:py-1 bg-pink-600 rounded text-[13px] sm:text-[15px] font-medium text-white flex items-center gap-1.5 sm:gap-2 ${canStar ? 'cursor-pointer hover:bg-pink-700 transition-colors' : ''}`}
        onClick={canStar ? handleStarClick : undefined}
        title={!user?.id ? "Login to star this profile" : userInfo.username === user?.username ? "You cannot star your own profile" : hasStarred ? "Click to unstar" : "Click to star"}
      >
        Stars {hasStarred ? "⭐" : "★"}
        <span className="bg-white text-pink-700 px-1.5 sm:px-2 py-0.2 rounded-sm font-semibold min-w-[2rem] sm:min-w-[2.5rem] text-center">
          {shouldAnimate ? (
            <CountUp 
              start={0} 
              end={counters?.gotStars?.length || 0} 
              {...countUpProps}
              formattingFn={(value) => formatIndianNumber(value)}
            />
          ) : (
            formatIndianNumber(counters?.gotStars?.length || 0)
          )}
        </span>
      </motion.div>
      {userInfo?.cgpa && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="px-0.5 sm:px-1 pl-1.5 sm:pl-2 py-0.5 sm:py-1 bg-orange-600 rounded text-[13px] sm:text-[15px] font-medium text-white flex items-center gap-1.5 sm:gap-2"
        >
          CGPA
          <span className="bg-white text-orange-700 px-1.5 sm:px-2 py-0.2 rounded-sm font-semibold min-w-[2rem] sm:min-w-[2.5rem] text-center">
            {shouldAnimate ? (
              <CountUp 
                start={0} 
                end={userInfo.cgpa} 
                decimals={1}
                duration={2}
              />
            ) : (
              userInfo.cgpa.toFixed(1)
            )}
          </span>
        </motion.div>
      )}
    </div>
  );
}