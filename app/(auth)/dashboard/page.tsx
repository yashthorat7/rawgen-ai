import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/web_layout/Header";
import { AiSuggestor } from "@/components/layout/AiIntro";
import { PlatformProvider } from "@/lib/PlatformContext";
import { ProfileGrid } from "@/components/profile/ProfileGrid";
import { Intro } from "@/components/layout/Intro";
import { TagStrip } from "@/components/layout/TagStrip";
import { SkillGrid } from "@/components/skill/SkillGrid";
import { ProjectGrid } from "@/components/project/ProjectGrid";
import { CertificateGrid } from "@/components/certificate/CertificateGrid";
import { Footer } from "@/components/layout/web_layout/Footer";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <PlatformProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 dotted-background">
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