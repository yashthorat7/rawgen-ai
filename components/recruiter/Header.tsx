"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
    const router = useRouter();

    const handleLogout = () => {
        window.localStorage.removeItem('recruiterEmail');
        router.push('/');
    };

    return (
        <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
            <div className="flex items-center justify-between px-6 py-3 mx-auto w-full lg:w-[90%]">
                <Link href="/" className="flex items-center gap-2 hover:scale-105 transition-transform">
                    <div className="relative w-8 h-8">
                        <Image src="/logo.svg" alt="Logo" fill className="animate-pulse" />
                    </div>
                    <span className="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 font-Raleway font-[900]" style={{ fontFamily: 'Raleway' }}>
                        CodeX
                    </span>
                </Link>

                {/* Logout Button */}
                <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 h-10 transition-all text-sm"
                >
                    <LogOut className="w-4 h-4 flex sm:hidden" />
                    <span className="hidden sm:block">Logout</span>
                </Button>
            </div>
        </header>
    );
} 