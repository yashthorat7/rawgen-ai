"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Share2, Star, Code2, Trophy, Brain, Target, Users, ArrowRight, 
  Zap, Sparkles, BarChart, Search, Briefcase, FileText, 
  CheckCircle, ChevronRight, MousePointerClick, 
  Terminal, Database, Cpu, LineChart, BarChart2, 
  MessageSquare, Award, Shield, ZapIcon
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import { FaqAccordion } from "@/components/ui/Faq";
import { Header } from "../layout/Header";

const MouseFollower = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);
  
  if (!isMounted) return null;

  return (
    <>
      <motion.div
        className="fixed w-60 h-60 rounded-full bg-gradient-to-r from-yellow-400/40 to-orange-400/40 blur-lg pointer-events-none z-0"
        animate={{
          x: mousePosition.x - 120,
          y: mousePosition.y - 120,
        }}
        transition={{ type: "spring", damping: 25, stiffness: 250 }}
      />
    </>
  );
};

const GradientBlob = ({ className, color1, color2, delay = 0 }: { className: string, color1: string, color2: string, delay?: number }) => {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl opacity-30 ${className}`}
      animate={{
        scale: [1, 1.2, 1],
        rotate: [0, 90, 0],
        x: [0, 10, -10, 0],
        y: [0, -10, 10, 0],
      }}
      transition={{
        duration: 15,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
        delay,
      }}
      style={{
        background: `radial-gradient(circle at center, ${color1}, ${color2})`
      }}
    />
  );
};

const InteractiveCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMounted) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPosition({ x, y });
  };

  return (
    <motion.div
      className={`relative overflow-hidden rounded-xl ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
    >
      {isMounted && (
        <motion.div
          className="absolute inset-0 opacity-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.1) 0%, transparent 50%)`,
            opacity: isHovered ? 1 : 0,
          }}
        />
      )}
      {children}
    </motion.div>
  );
};

const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  index,
  image 
}: { 
  icon: any, 
  title: string, 
  description: string, 
  index: number,
  image?: string 
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  const gradients = [
    "bg-gradient-to-br from-primary-400 to-purple-500",
    "bg-gradient-to-br from-purple-400 to-pink-500",
    "bg-gradient-to-br from-pink-400 to-red-500",
    "bg-gradient-to-br from-blue-400 to-primary-500",
    "bg-gradient-to-br from-cyan-400 to-blue-500",
    "bg-gradient-to-br from-orange-400 to-pink-500"
  ];
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary-400/20 to-purple-400/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />
      <InteractiveCard className="p-6 bg-white/80 backdrop-blur-sm border border-primary-100/50">
        <div className="relative h-48 mb-4 overflow-hidden rounded-lg">
          <div className={`w-full h-full ${gradients[index % gradients.length]} p-2.5 flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}>
            <div className="relative z-10">
              <Icon className="w-16 h-16 text-white mb-4" />
              <div className="text-white text-xl font-medium">{title}</div>
            </div>
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-20 h-20 bg-white/20 rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-1/4 translate-y-1/4" />
              <div className="absolute top-1/2 left-1/3 w-12 h-12 bg-white/20 rounded-full" />
            </div>
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </InteractiveCard>
    </motion.div>
  );
};

const PlatformCard = ({ 
  name, 
  logo, 
  description, 
  index 
}: { 
  name: string, 
  logo: string, 
  description: string, 
  index: number 
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="flex-1 min-w-[200px] p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-primary-100/50 hover:border-primary-400/50 transition-colors"
    >
      <div className="flex flex-col items-center text-center">
        <div className={`w-16 h-16 mb-4 rounded-xl white flex items-center justify-center text-white font-bold text-2xl shadow-lg`}>
          <img src={logo} alt={name} className="w-16 h-16 object-contain" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">{name}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </motion.div>
  );
};

const Step = ({ 
  number, 
  title, 
  description, 
  icon: Icon, 
  index 
}: { 
  number: number, 
  title: string, 
  description: string, 
  icon: any, 
  index: number 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.div
    ref={ref}
    initial={{ opacity: 0, scale: 0.8 }}
    animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
    transition={{ duration: 0.5, delay: index * 0.2 }}
    className="relative flex flex-col items-center"
    onMouseEnter={() => setIsHovered(true)}
    onMouseLeave={() => setIsHovered(false)}
    onClick={() => setIsHovered(prev => !prev)}
  >
    <motion.div
      className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-400 to-purple-400 flex items-center justify-center cursor-pointer"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 1.05 }}
    >
      <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center">
        <Icon className="w-12 h-12 text-primary-600" />
      </div>
      <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold">
        {number}
      </span>
    </motion.div>
    
    {/* Desktop Tooltip */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isHovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      className="absolute top-40 left-1/2 -translate-x-1/2 w-64 p-4 bg-white rounded-xl shadow-lg hidden sm:block"
    >
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </motion.div>
  
    {/* Mobile Static Card */}
    {isHovered && (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 w-64 p-4 bg-white rounded-xl shadow-lg block sm:hidden"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </motion.div>
    )}
  </motion.div>
  
  );
};

const Testimonial = ({ 
  name, 
  role, 
  text, 
  index 
}: { 
  name: string, 
  role: string, 
  text: string, 
  index: number 
}) => {
  return (
    <div className="p-6 rounded-xl bg-white/60 backdrop-blur-sm border border-primary-100/50 min-w-[300px]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-purple-400 flex items-center justify-center text-white font-bold">
          {name[0]}
        </div>
        <div>
          <div className="font-semibold text-gray-900">{name}</div>
          <div className="text-sm text-gray-600">{role}</div>
        </div>
      </div>
      <p className="text-gray-600">{text}</p>
    </div>
  );
};


export function Landing() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { user, isLoaded } = useUser();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const controlHeader = () => {
      if (window.scrollY > lastScrollY) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener('scroll', controlHeader);
    return () => window.removeEventListener('scroll', controlHeader);
  }, [lastScrollY]);

  return (
    <div className="relative overflow-hidden bg-white">
      {/* Background elements */}
      <GradientBlob className="top-20 left-20 w-96 h-96" color1="#6366f1" color2="#a855f7" />
      <GradientBlob className="bottom-20 right-20 w-96 h-96" color1="#3b82f6" color2="#06b6d4" delay={2} />
      <GradientBlob className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px]" color1="#f43f5e" color2="#f97316" delay={1} />
      <GradientBlob className="top-1/3 left-20 w-64 h-64" color1="#84cc16" color2="#06b6d4" delay={3} />
      <GradientBlob className="bottom-1/3 right-10 w-72 h-72" color1="#ec4899" color2="#8b5cf6" delay={2.5} />
      
      
      {/* Grid background - only in hero section */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]" />
      
      {/* Mouse follower effect */}
      <MouseFollower />
      
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-5xl sm:text-6xl md:text-7xl text-gray-900 mb-4 sm:mb-6 leading-tight"
              >
                Your{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 bg-clip-text text-transparent font-Raleway font-extrabold">
                    Competitive Programming
                  </span>
                  <span className="absolute bottom-1 sm:bottom-2 left-0 w-full h-2 sm:h-3 bg-gradient-to-r from-primary-200/30 to-purple-200/30 -z-10 rounded" />
                </span>{" "}
                Portfolio
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg sm:text-xl text-gray-600 mb-8 sm:mb-12 leading-relaxed max-w-3xl mx-auto"
              >
                Showcase your coding journey across multiple platforms with beautiful analytics 
                and AI-powered insights.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-16 sm:mb-20"
              >
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
              </motion.div>

              {/* Hero Image with Radial Reveal */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="relative w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl border border-primary-100 group"
              >
                <div className="aspect-video relative overflow-hidden">

                  {/* Hover reveal with dashboard.png */}
                  <div>
                    <img 
                      src="/dashboard.png" 
                      alt="Dashboard Preview" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-b from-white to-primary-50/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2"
              >
                Insane Features For Programmars
              </motion.h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
                icon={Share2} 
                title="Share with Friends" 
                description="Easily share your achievements and progress on social media platforms and inspire your friends to join." 
                index={0}
              />

              <FeatureCard 
                icon={BarChart} 
                title="Beautiful Analytics" 
                description="Visualize your progress with interactive charts and performance metrics to help you track your progress."
                index={1}
              />
              <FeatureCard 
                icon={Brain} 
                title="AI Insights" 
                description="Get personalized insights and recommendations to improve your coding skills."
                index={2}
              />
              <FeatureCard 
                icon={Briefcase} 
                title="Portfolio Builder" 
                description="Create a professional portfolio showcasing your skills, projects, and certificates."
                index={3}
              />
              <FeatureCard 
                icon={Search} 
                title="Recruiter Matching" 
                description="Connect with recruiters looking for candidates with your specific skills."
                index={4}
              />
              <FeatureCard 
                icon={FileText} 
                title="AI Summarization" 
                description="Get concise summaries of your achievements and progress across platforms."
                index={5}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Platforms Section */}
      <section id="platforms" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
              >
                Supported Platforms
              </motion.h2>
            </div>

            <div className="flex flex-wrap justify-center gap-6">
              <PlatformCard 
                name="LeetCode" 
                logo="/leetcode.png"
                description="Track your problem-solving progress and contest performance."
                index={0}
              />
              <PlatformCard 
                name="CodeChef" 
                logo="/codechef.png"
                description="Showcase your ratings, rankings, and contest achievements."
                index={1}
              />
              <PlatformCard 
                name="GeeksForGeeks" 
                logo="/geeksforgeeks.png"
                description="Display your coding score and problem-solving statistics."
                index={2}
              />
              <PlatformCard 
                name="Codeforces" 
                logo="/codeforces.png"
                description="Highlight your rating history and contest participation."
                index={3}
              />
            </div>
          </div>
        </div>
      </section>


      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gradient-to-b from-primary-50/30 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-4">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8"
              >
                It is Simple
              </motion.h2>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-8">
              <Step 
                number={1} 
                title="Sign Up & Connect Platforms" 
                description="Create your account and connect your competitive programming platform profiles."
                icon={Terminal}
                index={0}
              />
              <Step 
                number={2} 
                title="AI Data Extraction" 
                description="Our AI agents automatically fetch and analyze your data from all connected platforms."
                icon={Database}
                index={1}
              />
              <Step 
                number={3} 
                title="Build Your Portfolio" 
                description="Add your skills, projects, and certificates to create a comprehensive portfolio."
                icon={FileText}
                index={2}
              />
              <Step 
                number={4} 
                title="Get Discovered" 
                description="Share your profile with recruiters or let them find you through our platform."
                icon={Search}
                index={3}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gradient-to-b from-white to-primary-50/30 overflow-hidden z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
              >
                Testimonials
              </motion.h2>
            </div>

            <div className="relative">
              <motion.div
                className="flex gap-6"
                animate={{
                  x: [0, -1000],
                }}
                transition={{
                  x: {
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 20,
                    ease: "linear",
                  },
                }}
              >
                {[
                  {
                    name: "Arjun Sharma",
                    role: "Final year student",
                    text: "Codex revolutionized how I present my competitive programming achievements to recruiters. The AI-powered insights helped me identify areas for improvement, and I landed my dream job!"
                  },
                  {
                    name: "Priya Patel",
                    role: "Tech Lead @ Microsoft",
                    text: "As a recruiter, Codex has been invaluable for finding talented developers. The platform's comprehensive profiles and AI matching make it easy to identify candidates with the right skills."
                  },
                  {
                    name: "Vikram Mehta",
                    role: "SDE @ Amazon",
                    text: "The most comprehensive platform for showcasing CP skills. The beautiful dashboards and analytics helped me track my progress, and I got multiple interview calls!"
                  },
                  {
                    name: "Arjun Sharma",
                    role: "Final year student",
                    text: "Codex revolutionized how I present my competitive programming achievements to recruiters. The AI-powered insights helped me identify areas for improvement, and I landed my dream job!"
                  },
                  {
                    name: "Priya Patel",
                    role: "Tech Lead @ Microsoft",
                    text: "As a recruiter, Codex has been invaluable for finding talented developers. The platform's comprehensive profiles and AI matching make it easy to identify candidates with the right skills."
                  },
                  {
                    name: "Vikram Mehta",
                    role: "SDE @ Amazon",
                    text: "The most comprehensive platform for showcasing CP skills. The beautiful dashboards and analytics helped me track my progress, and I got multiple interview calls!"
                  },
                ].map((testimonial, index) => (
                  <Testimonial key={index} {...testimonial} index={index} />
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
              >
                Frequently Asked Questions
              </motion.h2>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <FaqAccordion />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-primary-50/30 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-16">
                Ready to Showcase Your Skills?
              </h2>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center z-100">
              <Link href="/sign-up">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto text-base sm:text-lg border-2 border-primary-200 text-primary-700 bg-white/50 backdrop-blur-sm hover:bg-white/80"
                >
                  Get Started Now
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/recruiter">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full sm:w-auto text-base sm:text-lg border-2 border-primary-200 text-primary-700 bg-white/50 backdrop-blur-sm hover:bg-white/80"
                >
                  Recruiter Portal
                </Button>
              </Link>

              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
} 