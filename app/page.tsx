import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { AiSuggestor } from "@/components/AiSuggestor";
import { PlatformProvider } from "@/lib/PlatformContext";
import { PlatformGrid } from "@/components/PlatformGrid";

export default async function Home() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <PlatformProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 p-4 mt-[57px] mx-auto w-full lg:w-[80%]">
          <AiSuggestor />
          <PlatformGrid />
        </main>
      </div>
    </PlatformProvider>
  );
}
