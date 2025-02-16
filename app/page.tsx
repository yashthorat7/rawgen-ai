import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Hero } from "@/components/layout/Hero";
import { Footer } from "@/components/layout/Footer";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <>
      <Hero />
      <Footer />
    </>
  );
}