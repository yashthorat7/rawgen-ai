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

  const addStar = useMutation(api.counters.addStar);

  useEffect(() => {
    if (counters !== undefined) {
      setShouldAnimate(true);
    }
  }, [counters]);

  useEffect(() => {
    if (userInfo?.stars && user?.primaryEmailAddress?.emailAddress) {
      setHasStarred(userInfo.stars.includes(user.primaryEmailAddress.emailAddress));
    }
  }, [userInfo?.stars, user?.primaryEmailAddress?.emailAddress]);

  const handleStarClick = async () => {
    if (!userInfo?._id || !user?.primaryEmailAddress?.emailAddress || hasStarred) return;

    try {
      const result = await addStar({
        userId: userInfo._id,
        starredBy: user.primaryEmailAddress.emailAddress
      });

      if (result.success) {
        console.log('Successfully starred the profile!');
        setHasStarred(true);
      } else {
        console.log('Could not star:', result.reason);
      }
    } catch (error) {
      console.error('Error starring profile:', error);
    }
  };

  const countUpProps = {
    duration: 2,
    separator: ",",
  };

  if (!userInfo || counters === undefined) return null;

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
            <CountUp start={0} end={counters?.profileViews || 0} {...countUpProps} />
          ) : (
            counters?.profileViews || 0
          )}
        </span>
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`px-0.5 sm:px-1 pl-1.5 sm:pl-2 py-0.5 sm:py-1 bg-pink-600 rounded text-[13px] sm:text-[15px] font-medium text-white flex items-center gap-1.5 sm:gap-2 ${!hasStarred && !isPublicView ? 'cursor-pointer' : ''}`}
        onClick={!hasStarred && !isPublicView ? handleStarClick : undefined}
      >
        Stars ⭐
        <span className="bg-white text-pink-700 px-1.5 sm:px-2 py-0.2 rounded-sm font-semibold min-w-[2rem] sm:min-w-[2.5rem] text-center">
          {shouldAnimate ? (
            <CountUp start={0} end={userInfo.stars?.length || 0} {...countUpProps} />
          ) : (
            userInfo.stars?.length || 0
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