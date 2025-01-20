import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { AiSuggestor } from "@/components/AiIntro";
import { PlatformProvider } from "@/lib/PlatformContext";
import { ProfileGrid } from "@/components/ProfileGrid";
import { Intro } from "@/components/Intro";
import { TagStrip } from "@/components/TagStrip";
import { SkillGrid } from "@/components/SkillGrid";
import { ProjectGrid } from "@/components/ProjectGrid";
import { Footer } from "@/components/Footer";

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
          <div className="p-4 mt-[57px] mx-auto w-full lg:w-[90%]">
            <Intro />
            <AiSuggestor />
            <TagStrip />
            <ProfileGrid />
            <SkillGrid />
            <ProjectGrid />
          </div>
        </main>
        <Footer />
      </div>
    </PlatformProvider>
  );
} 