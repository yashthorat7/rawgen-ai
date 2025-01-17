"use client";

import CountUp from 'react-countup';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export function PlatformCounter() {
  // TODO: Replace with actual data from your backend
  const visits = 128;  // Example value
  const stars = 45;    // Example value
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    setShouldAnimate(true);
  }, []);

  const countUpProps = {
    duration: 2.5,
    separator: ",",
  };

  return (
    <div className="flex flex-wrap gap-3 mt-4 sm:mt-2">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="px-1 pl-2 py-1 bg-primary-500 rounded-md text-[15px] font-medium text-white flex items-center gap-2"
      >
        Profile Visits
        <span className="bg-white text-primary-700 px-2 py-0.2 rounded-sm font-semibold min-w-[2.5rem] text-center">
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
        className="px-1 pl-2 py-1 bg-pink-500 rounded-md text-[15px] font-medium text-white flex items-center gap-2"
      >
        Stars ⭐
        <span className="bg-white text-pink-700 px-2 py-0.2 rounded-sm font-semibold min-w-[2.5rem] text-center">
          {shouldAnimate ? (
            <CountUp start={0} end={stars} {...countUpProps} />
          ) : (
            stars
          )}
        </span>
      </motion.div>
    </div>
  );
} 