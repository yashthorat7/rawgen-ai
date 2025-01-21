"use client";

import CountUp from 'react-countup';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";

export function PlatformCounter() {
  const { user } = useUser();
  const [shouldAnimate, setShouldAnimate] = useState(false);

  const userInfo = useQuery(
    api.users.getUser,
    user?.primaryEmailAddress?.emailAddress
      ? { email: user.primaryEmailAddress.emailAddress }
      : "skip"
  );

  const counters = useQuery(
    api.counters.get,
    userInfo?._id ? { userId: userInfo._id } : "skip"
  );

  useEffect(() => {
    if (counters !== undefined) {
      setShouldAnimate(true);
    }
  }, [counters]);

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
        className="px-0.5 sm:px-1 pl-1.5 sm:pl-2 py-0.5 sm:py-1 bg-pink-600 rounded text-[13px] sm:text-[15px] font-medium text-white flex items-center gap-1.5 sm:gap-2"
      >
        Stars ⭐
        <span className="bg-white text-pink-700 px-1.5 sm:px-2 py-0.2 rounded-sm font-semibold min-w-[2rem] sm:min-w-[2.5rem] text-center">
          {shouldAnimate ? (
            <CountUp start={0} end={counters?.stars || 0} {...countUpProps} />
          ) : (
            counters?.stars || 0
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