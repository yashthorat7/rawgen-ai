"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Fixed Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-transparent to-primary-100/50 pointer-events-none" />
      
      {/* Content */}
      <Header />
      <main className="flex-1 relative dotted-background flex items-center justify-center p-4">
        <div className="p-4 mx-auto w-full lg:w-[90%] flex items-center justify-center h-[60vh] mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-8xl sm:text-9xl font-bold mb-4 bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              404
            </h1>
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-6">
              Page Not Found
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Oops! The page you're looking for doesn't exist or has been moved.
            </p>
            <Link 
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-primary-600 via-purple-600 to-purple-600 hover:from-primary-700 hover:via-purple-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Go Home
            </Link>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 