import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { ProfileGrid } from "@/components/profile/ProfileGrid";
import { SkillGrid } from "@/components/skill/SkillGrid";
import { ProjectGrid } from "@/components/project/ProjectGrid";
import { CertificateGrid } from "@/components/certificate/CertificateGrid";
import { Footer } from "@/components/layout/Footer";
import { Intro } from "@/components/intro/Intro";
import { AiIntro } from "@/components/intro/AiIntro";
import { TagStrip } from "@/components/intro/TagStrip";
import { PlatformProvider } from "@/lib/PlatformContext";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function UserProfilePage(props: PageProps) {
  // Await the params
  const { params } = props;
  const { username } = await params;
  
  // This will be a public view of a user's profile
  // We'll fetch the user's data using their username
  const user = await convex.query(api.users.getUserByUsername, { username });
  
  if (!user) {
    notFound();
  }

  // Convert profiles to platform data format
  const platformData = user.profiles.reduce((acc: any, profile) => {
    const { platformName, platformUsername, platformCacheData } = profile;
    if (!acc[platformName]) {
      acc[platformName] = {};
    }
    acc[platformName][platformUsername] = JSON.parse(platformCacheData || '{}');
    return acc;
  }, {});

  return (
    <PlatformProvider platformData={platformData}>
      <div className="min-h-screen flex flex-col relative">
        {/* Fixed Gradient Background */}
        <div className="fixed inset-0 bg-gradient-to-b from-transparent to-primary-100/50 pointer-events-none" />
        
        {/* Content */}
        <Header />
        <main className="flex-1 relative dotted-background">
          <div className="p-4 mt-4 mx-auto w-full lg:w-[90%]">
            <Intro username={username} isPublicView={true} />
            <AiIntro username={username} isPublicView={true} />
            <TagStrip username={username} isPublicView={true} />
            <ProfileGrid 
              username={username} 
              isPublicView={true} 
              platformData={platformData}
            />
            <SkillGrid username={username} isPublicView={true} />
            <ProjectGrid username={username} isPublicView={true} />
            <CertificateGrid username={username} isPublicView={true} />
          </div>
        </main>
        <Footer />
      </div>
    </PlatformProvider>
  );
} 