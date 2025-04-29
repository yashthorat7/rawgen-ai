'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff, X } from "lucide-react";

export default function RecruiterLoginPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        firstName: "",
        lastName: "",
        password: "",
    });

    const createRecruiter = useMutation((api as any).recruiters.create);
    const verifyRecruiter = useMutation((api as any).recruiters.verify);

    useEffect(() => {
        const storedEmail = window.localStorage.getItem('recruiterEmail');
        if (storedEmail) {
            router.push('/recruiter/dashboard');
        }
        setIsLoading(false);
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setIsLoading(true);

        try {
            if (isLogin) {
                const result = await verifyRecruiter({
                    email: formData.email,
                    password: formData.password,
                });
                
                if (result.success) {
                    window.localStorage.setItem('recruiterEmail', formData.email);
                    router.push("/recruiter/dashboard");
                } else {
                    setError(result.message);
                }
            } else {
                const result = await createRecruiter({
                    email: formData.email,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    password: formData.password,
                    markstar: [],
                    isPermitted: false,
                });

                if (result.success) {
                    setSuccess("Registration successful! Please wait for admin approval. We'll notify you via email.");
                    setFormData({ email: "", firstName: "", lastName: "", password: "" });
                    setIsLogin(true);
                } else {
                    setError(result.message);
                }
            }
        } catch (error: any) {
            setError("An unexpected error occurred. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-primary-50 to-white">
            {/* Close Button */}
            <button
                onClick={() => router.push('/')}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/70 backdrop-blur-sm border border-gray-200/50 shadow-sm hover:shadow-md transition-all hover:scale-105 hover:bg-white/90"
            >
                <X className="w-5 h-5 text-gray-600" />
            </button>

            <div className="w-full max-w-md mx-4">
                <div className="bg-white/70 backdrop-blur-lg shadow-xl border border-primary-100 rounded-xl p-8">
                    <h1 className="text-3xl font-bold text-center mb-8 text-primary-600">
                        {isLogin ? "Recruiter Login" : "Recruiter Registration"}
                    </h1>

                    {error && (
                        <div className="mb-4 p-3 text-sm rounded bg-red-50 border border-red-500 text-red-600">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-3 text-sm rounded bg-green-50 border border-green-500 text-green-600">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            type="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            className="w-full bg-white border-primary-200 focus:border-primary-500 focus:ring-primary-500"
                        />

                        {!isLogin && (
                            <>
                                <Input
                                    type="text"
                                    placeholder="First Name"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    required
                                    className="w-full bg-white border-primary-200 focus:border-primary-500 focus:ring-primary-500"
                                />
                                <Input
                                    type="text"
                                    placeholder="Last Name"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    required
                                    className="w-full bg-white border-primary-200 focus:border-primary-500 focus:ring-primary-500"
                                />
                            </>
                        )}

                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                className="w-full bg-white border-primary-200 focus:border-primary-500 focus:ring-primary-500 pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-primary-600 hover:bg-primary-700 text-white"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : isLogin ? (
                                "Login"
                            ) : (
                                "Register"
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError("");
                                setSuccess("");
                                setFormData({ email: "", firstName: "", lastName: "", password: "" });
                            }}
                            className="text-primary-600 hover:text-primary-700 text-sm"
                        >
                            {isLogin
                                ? "Don't have an account? Register"
                                : "Already have an account? Login"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
} 