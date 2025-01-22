import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { AiSuggestor } from "@/components/intro/AiIntro";
import { PlatformProvider } from "@/lib/PlatformContext";
import { ProfileGrid } from "@/components/profile/ProfileGrid";
import { Intro } from "@/components/intro/Intro";
import { TagStrip } from "@/components/intro/TagStrip";
import { SkillGrid } from "@/components/skill/SkillGrid";
import { ProjectGrid } from "@/components/project/ProjectGrid";
import { CertificateGrid } from "@/components/certificate/CertificateGrid";
import { Footer } from "@/components/layout/Footer";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <PlatformProvider>
      <div className="min-h-screen flex flex-col relative">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-purple-100/40 pointer-events-none" />
        
        {/* Content */}
        <Header />
        <main className="flex-1 relative dotted-background">
          <div className="p-4 mt-4 mx-auto w-full lg:w-[90%]">
            <Intro />
            <AiSuggestor />
            <TagStrip />
            <ProfileGrid />
            <SkillGrid />
            <ProjectGrid />
            <CertificateGrid />
          </div>
        </main>
        <Footer />
      </div>
    </PlatformProvider>
  );
} 