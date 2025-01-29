"use client";

import { SearchUsers } from "@/components/recruiter/SearchUsers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function RecruiterDashboard() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Fixed Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-transparent to-primary-100/50 pointer-events-none" />
      
      {/* Dotted Background */}
      <div className="fixed inset-0 dotted-background pointer-events-none" />
      
      {/* Content */}
      <Header />
      <main className="flex-1 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 max-w-[1920px]">
          <div className="flex flex-col items-center justify-center w-full">
            {/* Welcome Section */}
            <div className="w-full max-w-4xl mb-12 text-center">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Find Top Tech Talent
              </h1>
              <p className="text-lg text-gray-600">
                Search through our pool of verified developers and discover your next team member
              </p>
            </div>

            {/* Search Section */}
            <div className="w-full">
              <SearchUsers />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 