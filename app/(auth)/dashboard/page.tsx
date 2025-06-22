"use client";

import { useUser } from "@clerk/nextjs";
import { Header } from "@/components/layout/Header";
import { AiIntro } from "@/components/intro/AiIntro";
import { PlatformProvider } from "@/lib/PlatformContext";
import { ProfileGrid } from "@/components/profile/ProfileGrid";
import { Intro } from "@/components/intro/Intro";
import { TagStrip } from "@/components/intro/TagStrip";
import { SkillGrid } from "@/components/skill/SkillGrid";
import { ProjectGrid } from "@/components/project/ProjectGrid";
import { CertificateGrid } from "@/components/certificate/CertificateGrid";
import { Footer } from "@/components/layout/Footer";
import { FeaturesDialog } from "@/components/dashboard/FeaturesDialog";
import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { usePathname } from "next/navigation";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  const [showFeatures, setShowFeatures] = useState(false);
  const pathname = usePathname();

  const userData = useQuery(api.users.getUser, email ? { email } : "skip");

  useEffect(() => {
    if (!isLoaded || !email || userData === undefined) return;

    const isOwnDashboard = pathname === "/dashboard";
    if (!isOwnDashboard) return;

    const hasLearned = userData?.haslearned === true;
    setShowFeatures(!hasLearned);
  }, [isLoaded, email, userData, pathname]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <PlatformProvider>
      <div className="min-h-screen flex flex-col relative">
        <div className="fixed inset-0 bg-gradient-to-b from-transparent to-primary-100/50 pointer-events-none" />

        {/* Content */}
        <Header />
        <main className="flex-1 relative dotted-background">
          <div className="p-4 mt-4 mx-auto w-full lg:w-[90%]">
            <Intro />
            <AiIntro />
            <TagStrip />
            <ProfileGrid />
            <SkillGrid />
            <ProjectGrid />
            <CertificateGrid />
          </div>
        </main>
        <Footer />

        {/* Features Dialog */}
        {showFeatures && email && (
          <FeaturesDialog
            onClose={() => setShowFeatures(false)}
            userEmail={email}
          />
        )}
      </div>
    </PlatformProvider>
  );
}
