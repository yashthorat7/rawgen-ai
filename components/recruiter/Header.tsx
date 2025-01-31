"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

function useScrollDirection() {
    const [scrollDirection, setScrollDirection] = useState("up");
    const [prevOffset, setPrevOffset] = useState(0);

    useEffect(() => {
        const toggleScrollDirection = () => {
            let scrollY = window.pageYOffset;
            if (scrollY === 0) {
                setScrollDirection("up");
            } else if (scrollY > prevOffset) {
                setScrollDirection("down");
            } else if (scrollY < prevOffset) {
                setScrollDirection("up");
            }
            setPrevOffset(scrollY);
        };

        window.addEventListener("scroll", toggleScrollDirection);
        return () => {
            window.removeEventListener("scroll", toggleScrollDirection);
        };
    }, [prevOffset]);

    return scrollDirection;
}

export function Header() {
    const router = useRouter();
    const scrollDirection = useScrollDirection();

    const handleLogout = () => {
        window.localStorage.removeItem('recruiterEmail');
        router.push('/');
    };

    return (
        <header className={`sticky transition-transform duration-300 ${
            scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"
        } top-0 z-20 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 select-none`}>
            <div className="flex items-center justify-between px-6 py-2 mx-auto w-full lg:w-[90%] relative">
                <Link href="/" className="flex items-center gap-2">
                    <div className="relative w-8 h-8">
                        <Image
                            src="/logo.svg"
                            alt="Logo"
                            fill
                        />
                    </div>
                    <span className="text-2xl font-Raleway text-gray-900 font-[900]">
                        CODEX
                    </span>
                </Link>

                <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="flex items-center gap-2 hover:bg-red-100 px-3 py-2 rounded-md transition-colors text-sm font-medium border border-gray-200 hover:border-gray-300"
                >
                    <LogOut className="w-5 h-5 sm:hidden" />
                    <span className="hidden sm:block">Log out</span>
                </Button>
            </div>
        </header>
    );
} 