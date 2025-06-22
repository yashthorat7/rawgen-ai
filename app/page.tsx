import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Landing } from "@/components/landing/Landing";
import { Footer } from "@/components/layout/Footer";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <>
      <Landing />
      <Footer />
    </>
  );
}
