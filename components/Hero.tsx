import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      {/* Header/Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/60 backdrop-blur-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-2 mx-auto w-full lg:w-[90%]">
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8">
              <Image 
                src="/logo.svg" 
                alt="Logo" 
                fill
              />
            </div>
            <span className="text-2xl font-extrabold text-gray-900">
              CodeX
            </span>
          </div>
        </div>
      </header>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 lg:pt-32 pb-12 sm:pb-16 lg:pb-24">
        {/* Hero Content */}
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 sm:mb-8 leading-tight">
            Your{" "}
            <span className="text-primary-600">
              Competitive Programming
            </span>{" "}
            Portfolio Generator
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-600 mb-8 sm:mb-12 leading-relaxed max-w-3xl mx-auto px-4">
            Showcase your coding journey across multiple platforms. Generate beautiful portfolios 
            that highlight your achievements from LeetCode, CodeChef, GeeksforGeeks, and Codeforces.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-16 sm:mb-20 px-4">
            <Link href="/sign-in" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className="w-full sm:w-[320px] text-base sm:text-lg bg-primary-600 hover:bg-primary-700"
              >
                Student Login
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full sm:w-[320px] text-base sm:text-lg border-2 border-primary-200 text-primary-700"
              disabled
            >
              Recruiter Login
              <span className="ml-2 text-xs text-primary-500">(Coming Soon)</span>
            </Button>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 px-4">
            <div className="group p-6 sm:p-8 bg-white border border-primary-100 rounded-xl hover:border-primary-200 transition-all">
              <div className="mb-4">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 mx-auto" viewBox="0 0 24 24">
                  <path 
                    d="M13 10V3L4 14h7v7l9-11h-7z" 
                    className="fill-primary-600"
                  />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 group-hover:text-primary-600">
                Multi-Platform Integration
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Connect and showcase your profiles from all major competitive programming platforms in one place.
              </p>
            </div>
            
            <div className="group p-6 sm:p-8 bg-white border border-primary-100 rounded-xl hover:border-primary-200 transition-all">
              <div className="mb-4">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 mx-auto" viewBox="0 0 24 24">
                  <path 
                    d="M3 12h4v9H3v-9zm7-3h4v12h-4V9zm7-6h4v18h-4V3z" 
                    className="fill-primary-600"
                  />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 group-hover:text-primary-600">
                Beautiful Analytics
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Get insightful visualizations of your progress and achievements across all platforms.
              </p>
            </div>
            
            <div className="group p-6 sm:p-8 bg-white border border-primary-100 rounded-xl hover:border-primary-200 transition-all sm:col-span-2 lg:col-span-1 sm:max-w-md mx-auto lg:max-w-none">
              <div className="mb-4">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 mx-auto" viewBox="0 0 24 24">
                  <path 
                    d="M12 2a9.96 9.96 0 0 1 7.071 2.929c3.905 3.905 3.905 10.237 0 14.142A9.96 9.96 0 0 1 12 22a9.96 9.96 0 0 1-7.071-2.929c-3.905-3.905-3.905-10.237 0-14.142A9.96 9.96 0 0 1 12 2zm0 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM9 12a1 1 0 0 0 1 1h1v4h-1a1 1 0 0 0 0 2h4a1 1 0 0 0 0-2h-1v-5a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1z" 
                    className="fill-primary-600"
                  />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 group-hover:text-primary-600">
                AI-Powered Insights
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Receive personalized suggestions and insights to improve your competitive programming journey.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 