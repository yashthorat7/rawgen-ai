"use client";

import { SearchUsers } from "@/components/recruiter/SearchUsers";
import { Header } from "@/components/recruiter/Header";
import { Footer } from "@/components/layout/Footer";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RecruiterDashboard() {
  const { user } = useUser();
  const router = useRouter();
  const [recruiterEmail, setRecruiterEmail] = useState<string | null>(null);

  useEffect(() => {
    // Get recruiter email from localStorage
    const email = window.localStorage.getItem('recruiterEmail');
    if (!email) {
      router.push('/recruiter');
      return;
    }
    setRecruiterEmail(email);
  }, [router]);

  if (!recruiterEmail) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Fixed Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-transparent to-primary-100/50 pointer-events-none" />
      
      {/* Dotted Background */}
      <div className="fixed inset-0 dotted-background pointer-events-none" />
      
      {/* Content */}
      <Header />
      <main className="flex-1 relative">
        <div className="mx-auto px-4 w-full sm:w-[90%]">
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
              <SearchUsers recruiterEmail={recruiterEmail} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 