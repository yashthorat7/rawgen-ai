import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Hero } from "@/components/Hero";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return <Hero />;
}
