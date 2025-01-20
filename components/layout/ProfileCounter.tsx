"use client";

import CountUp from 'react-countup';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";

export function PlatformCounter() {
  const { user } = useUser();
  const visits = 128;  // Example value
  const stars = 45;    // Example value
  const [shouldAnimate, setShouldAnimate] = useState(false);

  // Get CGPA from database
  const userSettings = useQuery(
    api.users.getUser,
    user?.primaryEmailAddress?.emailAddress
      ? { email: user.primaryEmailAddress.emailAddress }
      : "skip"
  );

  useEffect(() => {
    setShouldAnimate(true);
  }, []);

  const countUpProps = {
    duration: 3,
    separator: ",",
  };

  return (
    <div className="flex flex-wrap gap-2 sm:gap-3 mt-3 sm:mt-2">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="px-0.5 sm:px-1 pl-1.5 sm:pl-2 py-0.5 sm:py-1 bg-primary-500 rounded text-[13px] sm:text-[15px] font-medium text-white flex items-center gap-1.5 sm:gap-2"
      >
        Profile Visits
        <span className="bg-white text-primary-700 px-1.5 sm:px-2 py-0.2 rounded-sm font-semibold min-w-[2rem] sm:min-w-[2.5rem] text-center">
          {shouldAnimate ? (
            <CountUp start={0} end={visits} {...countUpProps} />
          ) : (
            visits
          )}
        </span>
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="px-0.5 sm:px-1 pl-1.5 sm:pl-2 py-0.5 sm:py-1 bg-pink-500 rounded text-[13px] sm:text-[15px] font-medium text-white flex items-center gap-1.5 sm:gap-2"
      >
        Stars ⭐
        <span className="bg-white text-pink-700 px-1.5 sm:px-2 py-0.2 rounded-sm font-semibold min-w-[2rem] sm:min-w-[2.5rem] text-center">
          {shouldAnimate ? (
            <CountUp start={0} end={stars} {...countUpProps} />
          ) : (
            stars
          )}
        </span>
      </motion.div>
      {userSettings?.cgpa && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="px-0.5 sm:px-1 pl-1.5 sm:pl-2 py-0.5 sm:py-1 bg-orange-600 rounded text-[13px] sm:text-[15px] font-medium text-white flex items-center gap-1.5 sm:gap-2"
        >
          CGPA
          <span className="bg-white text-orange-700 px-1.5 sm:px-2 py-0.2 rounded-sm font-semibold min-w-[2rem] sm:min-w-[2.5rem] text-center">
            {shouldAnimate ? (
              <CountUp 
                start={0} 
                end={userSettings.cgpa} 
                decimals={2}
                duration={2}
              />
            ) : (
              userSettings.cgpa.toFixed(2)
            )}
          </span>
        </motion.div>
      )}
    </div>
  );
} 