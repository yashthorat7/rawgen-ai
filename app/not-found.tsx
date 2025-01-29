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
      <main className="flex-1 relative dotted-background items-center justify-center">
        <div className="p-4 mx-auto w-full lg:w-[90%] flex flex-col items-center justify-center min-h-[60vh]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-6xl sm:text-8xl font-bold text-primary-600 mb-4">404</h1>
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-6">Page Not Found</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Oops! The page you're looking for doesn't exist or has been moved.
            </p>
            <Link 
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200"
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