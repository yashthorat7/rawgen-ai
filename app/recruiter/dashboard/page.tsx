'use client';

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Header } from "@/components/recruiter/Header";
import { Footer } from "@/components/layout/Footer";
import { useState, useEffect } from "react";

export default function RecruiterDashboard() {
    const router = useRouter();
    const [email, setEmail] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedEmail = window.localStorage.getItem('recruiterEmail');
        if (!storedEmail) {
            router.push('/recruiter');
        } else {
            setEmail(storedEmail);
        }
        setIsLoading(false);
    }, [router]);

    const recruiter = useQuery((api as any).recruiters.getByEmail, { 
        email 
    });

    if (isLoading || !email) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
        );
    }

    if (!recruiter) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col relative">
            {/* Fixed Gradient Background */}
            <div className="fixed inset-0 bg-gradient-to-b from-transparent to-primary-100/50 pointer-events-none" />
            
            {/* Content */}
            <Header />
            <main className="flex-1 relative dotted-background p-4">
                <div className="mt-1 gap-4 w-full sm:w-[90%] flex flex-col">
                    {/* Recruiter Status Banner */}
                    {!recruiter.isPermitted && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
                            <p className="text-yellow-700">
                                Your account is pending approval. Please wait for admin verification.
                            </p>
                        </div>
                    )}

                    {recruiter.isPermitted && (
                        <div className="grid gap-6">
                            {/* Add your recruiter dashboard components here */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h3 className="text-xl font-semibold mb-4">Talent Pool</h3>
                                <p className="text-gray-600">
                                    Start exploring talented developers and mark your favorites.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>

    );
} 