import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";

export async function Header() {
  const { userId } = await auth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/60 backdrop-blur-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-2 mx-auto w-full lg:w-[90%]">
        <div className="text-2xl font-extrabold text-gray-900">CodeX</div>
        <div className="flex items-center gap-4">
          <UserButton 
            afterSignOutUrl="/sign-in"
            appearance={{
              elements: {
                avatarBox: "w-10 h-10 rounded-full"
              }
            }}
          />
        </div>
      </div>
    </header>
  );
} 