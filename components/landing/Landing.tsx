"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Users, ArrowRight, Cpu, FileText, Sparkles
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { motion, useScroll, useSpring, useInView } from "framer-motion";
import { FaqAccordion } from "@/components/ui/Faq";
import { Header } from "../layout/Header";

const MouseFollower = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    
    checkScreenSize();
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", checkScreenSize);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);
  
  if (!isMounted || !isLargeScreen) return null;

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
  title, 
  description, 
  index,
  image 
}: {
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
      <div className="absolute inset-0 bg-gradient-to-r from-primary-400/20 to-purple-400/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300 max-h-full" />
      <InteractiveCard className="p-2 lg:p-6 bg-white/80 backdrop-blur-sm border border-primary-100/50">
        <div className="relative h-full mb-4 overflow-hidden rounded-lg">
          {image ? (
            <div className="w-full h-full overflow-hidden">
              <img 
                src={image} 
                alt={title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ) : (
            <div className={`w-full h-full ${gradients[index % gradients.length]} p-2.5 flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}>
              <div className="relative z-10">
                
              </div>
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-20 h-20 bg-white/20 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-1/4 translate-y-1/4" />
                <div className="absolute top-1/2 left-1/3 w-12 h-12 bg-white/20 rounded-full" />
              </div>
            </div>
          )}
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
  
  const gradients = [
    "from-blue-500 to-cyan-400",
    "from-purple-500 to-pink-400",
    "from-orange-500 to-amber-400",
    "from-emerald-500 to-teal-400"
  ];
  
  const iconColors = [
    "text-blue-600",
    "text-purple-600",
    "text-orange-600",
    "text-emerald-600"
  ];
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: index * 0.2 }}
      className="relative flex flex-col items-center mx-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col items-center w-full">
        <motion.div
          className={`w-24 h-24 rounded-full bg-gradient-to-br ${gradients[index % gradients.length]} flex items-center justify-center shadow-lg cursor-pointer relative z-10`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
            <Icon className={`w-10 h-10 ${iconColors[index % iconColors.length]}`} />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white text-gray-900 flex items-center justify-center font-bold text-lg shadow-md border-2 border-gray-100">
            {number}
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={isHovered ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 10, scale: 0.9 }}
          className={`absolute top-28 w-64 p-5 bg-white rounded-xl shadow-xl z-20 border border-gray-100 hidden lg:block`}
          style={{ 
            boxShadow: `0 15px 30px -5px rgba(0, 0, 0, 0.1), 0 10px 15px -5px ${index % 4 === 0 ? 'rgba(59, 130, 246, 0.1)' : index % 4 === 1 ? 'rgba(168, 85, 247, 0.1)' : index % 4 === 2 ? 'rgba(249, 115, 22, 0.1)' : 'rgba(16, 185, 129, 0.1)'}`
          }}
        >
          <h3 className={`text-xl font-bold mb-2 ${iconColors[index % iconColors.length]}`}>{title}</h3>
          <p className="text-gray-600">{description}</p>
        </motion.div>
        
        <div className="mt-5 text-center px-4 w-full lg:hidden">
          <h3 className={`text-xl font-bold mb-2 ${iconColors[index % iconColors.length]}`}>{title}</h3>
          <p className="text-gray-600">{description}</p>
        </div>
      </div>
    </motion.div>
  );
};

const Testimonial = ({ 
  name, 
  role, 
  text, 
  index,
  image
}: { 
  name: string, 
  role: string, 
  text: string, 
  index: number,
  image?: string
}) => {
  return (
    <div className="p-6 rounded-xl bg-white/60 backdrop-blur-sm border border-primary-100/50 min-w-[300px]">
      <div className="flex items-center gap-3 mb-4">
        {image ? (
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary-200">
            <img src={image} alt={name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-purple-400 flex items-center justify-center text-white font-bold">
            {name[0]}
          </div>
        )}
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
  const { isLoaded } = useUser();
  const { scrollYProgress } = useScroll();

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
      
      
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]" />
      
      <MouseFollower />
      
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

              {/* Hero Imag */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="relative max-w-full w-[1000px] mx-auto rounded-xl overflow-hidden shadow-2xl border border-primary-100 group"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src="/dashboard.png" 
                    alt="Dashboard Preview" 
                    className="w-full h-full object-cover" 
                  />
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
                Insane Features For Programmers
              </motion.h2>
            </div>

            <div className="grid grid-cols-2 gap-2 lg:gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard 
                title="Share with Friends" 
                description="Easily share your achievements and progress on social media platforms and inspire your friends to join." 
                index={0}
                image="/intro/pic1.png"
              />

              <FeatureCard 
                title="Beautiful Analytics" 
                description="Visualize your progress with interactive charts and performance metrics to track your progress."
                index={1}
                image="/intro/pic2.png"
              />
              <FeatureCard 
                title="AI Insights" 
                description="Get personalized insights and recommendations to improve your coding skills."
                index={2}
                image="/intro/pic3.png"
              />
              <FeatureCard 
                title="Portfolio Builder" 
                description="Create a professional portfolio showcasing your skills, projects, and certificates."
                index={3}
                image="/intro/pic4.png"
              />
              <FeatureCard 
                title="Recruiter Matching" 
                description="Connect with recruiters looking for candidates with your specific skills and get discovered."
                index={4}
                image="/intro/pic5.png"
              />
              <FeatureCard 
                title="AI Summarization" 
                description="Get concise summaries of your achievements and progress across platforms."
                index={5}
                image="/intro/pic6.png"
              />
            </div>
          </div>
        </div>
      </section>


      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gradient-to-b from-primary-50/30 to-white overflow-visible">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
              >
                It is Simple
              </motion.h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 place-items-center">
              <Step 
                number={1} 
                title="Sign Up & Connect Platforms" 
                description="Create your account and link your competitive programming profiles from various platforms."
                icon={Users}
                index={0}
              />
              <Step 
                number={2} 
                title="AI Data Extraction" 
                description="Our smart AI automatically analyzes your performance data across all connected platforms."
                icon={Cpu}
                index={1}
              />
              <Step 
                number={3} 
                title="Build Your Portfolio" 
                description="Add skills, projects, and certificates to showcase your complete coding journey."
                icon={FileText}
                index={2}
              />
              <Step 
                number={4} 
                title="Get Discovered" 
                description="Share your profile with recruiters and stand out with your programming achievements."
                icon={Sparkles}
                index={3}
              />
            </div>

            <div className="hidden lg:block relative h-1 w-3/4 mx-auto mt-8">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400"></div>
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
                    duration: 30,
                    ease: "linear",
                  },
                }}
              >
                {[
                  {
                    name: "Baburao Apte",
                    role: "Final year student",
                    text: "RawGen AI revolutionized how I present my competitive programming achievements to recruiters. The AI-powered insights helped me identify areas for improvement, and I landed my dream job!",
                    image: "/users/pic1.png"
                  },
                  {
                    name: "Raju",
                    role: "Tech Lead @ Microsoft",
                    text: "As a recruiter, RawGen AI has been invaluable for finding talented developers. The platform's comprehensive profiles and AI matching make it easy to identify candidates with the right skills.",
                    image: "/users/pic2.png"
                  },
                  {
                    name: "Shaam",
                    role: "SDE @ Amazon",
                    text: "The most comprehensive platform for showcasing CP skills. The beautiful dashboards and analytics helped me track my progress, and I got multiple interview calls!",
                    image: "/users/pic3.png"
                  },
                  {
                    name: "Rajpal Yadav",
                    role: "Final year student",
                    text: "RawGen AI revolutionized how I present my competitive programming achievements to recruiters. The AI-powered insights helped me identify areas for improvement, and I landed my dream job!",
                    image: "/users/pic4.png"
                  },
                  {
                    name: "Totla Seth",
                    role: "Tech Lead @ Amazon",
                    text: "As a recruiter, RawGen AI has been invaluable for finding talented developers. The platform's comprehensive profiles and AI matching make it easy to identify candidates with the right skills.",
                    image: "/users/pic5.png"
                  },
                  {
                    name: "Kachra Seth",
                    role: "SDE @ Google",
                    text: "The most comprehensive platform for showcasing CP skills. The beautiful dashboards and analytics helped me track my progress, and I got multiple interview calls!",
                    image: "/users/pic6.png"
                  },
                  {
                    name: "Baburao Apte",
                    role: "Final year student",
                    text: "RawGen AI revolutionized how I present my competitive programming achievements to recruiters. The AI-powered insights helped me identify areas for improvement, and I landed my dream job!",
                    image: "/users/pic1.png"
                  },
                  {
                    name: "Raju",
                    role: "Tech Lead @ Microsoft",
                    text: "As a recruiter, RawGen AI has been invaluable for finding talented developers. The platform's comprehensive profiles and AI matching make it easy to identify candidates with the right skills.",
                    image: "/users/pic2.png"
                  },
                  {
                    name: "Shaam",
                    role: "SDE @ Amazon",
                    text: "The most comprehensive platform for showcasing CP skills. The beautiful dashboards and analytics helped me track my progress, and I got multiple interview calls!",
                    image: "/users/pic3.png"
                  },
                  {
                    name: "Rajpal Yadav",
                    role: "Final year student",
                    text: "RawGen AI revolutionized how I present my competitive programming achievements to recruiters. The AI-powered insights helped me identify areas for improvement, and I landed my dream job!",
                    image: "/users/pic4.png"
                  },
                  {
                    name: "Totla Seth",
                    role: "Tech Lead @ Amazon",
                    text: "As a recruiter, RawGen AI has been invaluable for finding talented developers. The platform's comprehensive profiles and AI matching make it easy to identify candidates with the right skills.",
                    image: "/users/pic5.png"
                  },
                  {
                    name: "Kachra Seth",
                    role: "SDE @ Google",
                    text: "The most comprehensive platform for showcasing CP skills. The beautiful dashboards and analytics helped me track my progress, and I got multiple interview calls!",
                    image: "/users/pic6.png"
                  },
                ].map((testimonial, index) => (
                  <Testimonial key={index} {...testimonial} index={index} />
                ))}
              </motion.div>
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
                FAQs
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
                Let's Start Your Showcasing Journey
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