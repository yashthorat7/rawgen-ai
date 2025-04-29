import { notFound } from "next/navigation";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { AiIntro } from "@/components/intro/AiIntro";
import { TagStrip } from "@/components/intro/TagStrip";
import { Intro } from "@/components/intro/Intro";
import { PlatformProvider } from "@/lib/PlatformContext";
import { ProfileGrid } from "@/components/profile/ProfileGrid";
import { SkillGrid } from "@/components/skill/SkillGrid";
import { ProjectGrid } from "@/components/project/ProjectGrid";
import { CertificateGrid } from "@/components/certificate/CertificateGrid";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function ProfilePage({ params }: PageProps) {
  try {
    const resolvedParams = await params;
    const decodedUsername = decodeURIComponent(resolvedParams.username);
    
    const user = await convex.query(api.users.getUserByUsername, { username: decodedUsername });
    
    if (!user) {
      notFound();
    }
  
    const platformData = await convex.query(api.users.getFullPlatformDataByUsername, { username: decodedUsername });
  
    return (
      <PlatformProvider platformData={platformData || undefined}>
        <div className="min-h-screen flex flex-col relative">
          <div className="fixed inset-0 bg-gradient-to-b from-transparent to-primary-100/50 pointer-events-none" />
          
          {/* Content */}
          <Header />
          <main className="flex-1 relative dotted-background">
            <div className="p-4 mt-4 mx-auto w-full lg:w-[90%]">
              <Intro username={decodedUsername} isPublicView={true} />
              <AiIntro username={decodedUsername} isPublicView={true} />
              <TagStrip username={decodedUsername} isPublicView={true} />
              <ProfileGrid 
                username={decodedUsername} 
                isPublicView={true} 
                platformData={platformData}
              />
              <SkillGrid username={decodedUsername} isPublicView={true} />
              <ProjectGrid username={decodedUsername} isPublicView={true} />
              <CertificateGrid username={decodedUsername} isPublicView={true} />
            </div>
          </main>
          <Footer />
        </div>
      </PlatformProvider>
    );
  } catch (error) {
    notFound();
  }
} 