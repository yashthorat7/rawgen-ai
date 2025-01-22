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
      <div className="min-h-screen flex flex-col relative bg-gradient-to-br from-white via-primary-50 to-white">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-40 left-10 w-72 h-72 bg-gradient-to-r from-primary-400/20 to-purple-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-40 right-10 w-72 h-72 bg-gradient-to-r from-primary-600/20 to-pink-400/20 rounded-full blur-3xl" />
        </div>

        <Header />
        <main className="flex-1 relative">
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