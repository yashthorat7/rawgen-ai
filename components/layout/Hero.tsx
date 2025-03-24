"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Star, Code2, Trophy, Brain, Target, Users, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { FaqAccordion } from "@/components/ui/Faq";

export function Hero() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { user, isLoaded } = useUser();

  useEffect(() => {
    const controlHeader = () => {
      if (typeof window !== 'undefined') {
        if (window.scrollY > lastScrollY) { // scroll down
          setIsVisible(false);
        } else { // scroll up
          setIsVisible(true);
        }
        setLastScrollY(window.scrollY);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlHeader);

      return () => {
        window.removeEventListener('scroll', controlHeader);
      };
    }
  }, [lastScrollY]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-white via-primary-50 to-white">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-40 left-10 w-72 h-72 bg-gradient-to-r from-primary-400/20 to-purple-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-40 right-10 w-72 h-72 bg-gradient-to-r from-primary-600/20 to-pink-400/20 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-lg border-b border-gray-200/50 shadow-sm transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="flex items-center justify-between px-6 py-3 mx-auto w-full lg:w-[90%]">
          <Link href="/" className="flex items-center gap-2 hover:scale-105 transition-transform">
            <div className="relative w-8 h-8">
              <Image src="/logo.svg" alt="Logo" fill className="" />
            </div>
            <span className="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 font-Raleway font-[900]" style={{ fontFamily: 'Raleway' }}>
              CODEX
            </span>
          </Link>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            {!isLoaded ? (
              // Loading state
              <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
            ) : user ? (
              // Logged in - show user button
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8"
                  }
                }}
              />
            ) : (
              // Not logged in - show sign in button
              <div className="flex items-center gap-2">
                <Link href="/sign-in">
                  <Button className="rounded-md bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700">
                    Sign In
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 pt-18 sm:pt-30 lg:pt-40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-4 py-1.5 mb-6 rounded-full bg-white/50 border border-primary-100 shadow-sm hover:shadow-md transition-all hover:scale-105 animate-bounce-slow">
              <Star className="w-4 h-4 text-yellow-500 mr-2 animate-spin-slow" fill="currentColor" />
              <span className="text-sm font-medium bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                Empowering Tech Talent
              </span>
            </div>
            
            <h1
              className="text-5xl sm:text-6xl md:text-7xl text-gray-900 mt-8 sm:mt-0 mb-4 sm:mb-6 leading-tight font-Raleway font-extrabold"
              style={{ fontFamily: 'Raleway' }}
            >
              Your{" "}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Competitive Programming
                </span>
                <span className="absolute bottom-1 sm:bottom-2 left-0 w-full h-2 sm:h-3 bg-gradient-to-r from-primary-200/30 to-purple-200/30 -z-10 rounded" />
              </span>{" "}
              Portfolio
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 mb-8 sm:mb-12 leading-relaxed max-w-3xl mx-auto">
              Showcase your coding journey across multiple platforms with beautiful analytics 
              and AI-powered insights.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-16 sm:mb-20">
              <div className="hover:scale-105 transition-transform group">
                <Link href="/sign-up">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-[320px] text-base sm:text-lg bg-gradient-to-r from-purple-600 via-primary-600 to-pink-600 hover:from-purple-700 hover:via-primary-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Student Sign up
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
              <Link href="/recruiter">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full sm:w-[320px] text-base sm:text-lg border-2 border-primary-200 text-primary-700 bg-white/50 backdrop-blur-sm hover:bg-white/80 group"
                >
                  Recruiter Portal
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20 max-w-4xl mx-auto">
              {[
                { number: "15K+", label: "Active Users", icon: Users, color: "from-blue-400 to-primary-600" },
                { number: "5+", label: "Platforms", icon: Code2, color: "from-purple-400 to-pink-600" },
                { number: "100K+", label: "Profiles Generated", icon: Trophy, color: "from-orange-400 to-red-600" },
                { number: "24/7", label: "AI Support", icon: Brain, color: "from-green-400 to-teal-600" },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-white/50  border border-primary-100 shadow-sm hover:shadow-md transition-all hover:scale-105 hover:bg-white/70"
                >
                  <div className={`w-12 h-12 mx-auto mb-2 rounded-lg bg-gradient-to-br ${stat.color} p-2.5 animate-pulse`}>
                    <stat.icon className="w-full h-full text-white" />
                  </div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Testimonials */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                {
                  name: "Arjun Sharma",
                  role: "Final year student",
                  text: "Codex revolutionized how I present my competitive programming achievements to recruiters.",
                },
                {
                  name: "Priya Patel",
                  role: "Tech Lead @ Microsoft",
                  text: "The AI-powered insights significantly improved my problem-solving strategies and approach.",
                },
                {
                  name: "Vikram Mehta",
                  role: "SDE @ Amazon",
                  text: "The most comprehensive platform for showcasing CP skills. Got multiple interview calls!",
                },
              ].map((testimonial, index) => (
                <div 
                  key={index} 
                  className="p-6 rounded-xl bg-white/60  border border-primary-100 shadow-sm hover:shadow-md transition-all hover:scale-105 hover:bg-white/80"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold ring-2 ring-primary-200 ring-offset-2">
                      {testimonial.name[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                    </div>
                  </div>
                  <div className="relative">
                    <span className="absolute -top-2 -left-2 text-4xl text-primary-200">"</span>
                    <p className="text-gray-600 mt-4 pl-4">{testimonial.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <section className="relative z-10 bg-gradient-to-b from-white/0 to-white/80 pb-20">
        <div className="container mx-auto">
          <FaqAccordion />
        </div>
      </section>
    </div>
  );
} 