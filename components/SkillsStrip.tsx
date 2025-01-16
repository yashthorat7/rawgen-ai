"use client";

import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { useState, useEffect, useRef } from "react";
import TechIcon from "tech-stack-icons";

// Map of skill names to their colors and icon names
const skillMappings: Record<string, { color: string; icon?: string }> = {
    react: { color: "#61DAFB", icon: "react" },
    typescript: { color: "#3178C6", icon: "typescript" },
    javascript: { color: "#F7DF1E", icon: "javascript" },
    python: { color: "#3776AB", icon: "python" },
    java: { color: "#007396", icon: "java" },
    cpp: { color: "#00599C", icon: "cpp" },
    "c++": { color: "#00599C", icon: "cpp" },
    nodejs: { color: "#339933", icon: "nodejs" },
    html: { color: "#E34F26", icon: "html5" },
    css: { color: "#1572B6", icon: "css3" },
    git: { color: "#F05032", icon: "git" },
    docker: { color: "#2496ED", icon: "docker" },
    kubernetes: { color: "#326CE5", icon: "kubernetes" },
    aws: { color: "#232F3E", icon: "aws" },
    mongodb: { color: "#47A248", icon: "mongodb" },
    postgresql: { color: "#4169E1", icon: "postgresql" },
    mysql: { color: "#4479A1", icon: "mysql" },
    redis: { color: "#DC382D", icon: "redis" },
    // Add more mappings as needed
};

function IconOrText({ name, icon }: { name: string; icon?: string }) {
    const [showText, setShowText] = useState(false);

    useEffect(() => {
        // If no icon specified, show text immediately
        if (!icon) {
            setShowText(true);
            return;
        }

        // Try to render the icon, if it fails, show text
        try {
            const TechIconComponent = () => <TechIcon name={icon} className="w-4 h-4" />;
            TechIconComponent();
        } catch {
            setShowText(true);
        }
    }, [icon]);

    if (showText) {
        return (
            <span className="text-sm font-medium capitalize text-gray-800">
                {name}
            </span>
        );
    }

    return (
        <div className="w-5 h-5 flex items-center justify-center">
            <TechIcon name={icon!} className="w-4 h-4" />
        </div>
    );
}

export function SkillsStrip() {
    const { user } = useUser();
    const [isPaused, setIsPaused] = useState(false);
    const [skills, setSkills] = useState<string[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const userSettings = useQuery(
        api.profiles.getUserSettings,
        user?.primaryEmailAddress?.emailAddress
            ? { email: user.primaryEmailAddress.emailAddress }
            : "skip"
    );

    useEffect(() => {
        if (!userSettings?.skills) return;

        const normalizedSkills = userSettings.skills
            .map(skill => skill.toLowerCase())
            .filter(skill => skillMappings[skill]);

        if (normalizedSkills.length === 0) return;

        // Ensure we have at least 14 elements
        let baseSkills = [...normalizedSkills];
        while (baseSkills.length < 14) {
            baseSkills = [...baseSkills, ...normalizedSkills];
        }
        baseSkills = baseSkills.slice(0, Math.max(14, normalizedSkills.length));

        // Initialize with three copies for smooth scrolling
        setSkills([...baseSkills, ...baseSkills, ...baseSkills]);
    }, [userSettings?.skills]);

    useEffect(() => {
        if (!scrollRef.current || skills.length === 0 || isPaused) return;

        const scrollContainer = scrollRef.current;
        const itemWidth = scrollContainer.children[0].getBoundingClientRect().width;
        const baseLength = skills.length / 3;
        let currentScroll = 0;

        const scroll = () => {
            if (isPaused) return;

            currentScroll += 1;
            scrollContainer.style.transform = `translateX(-${currentScroll}px)`;

            // When we've scrolled one third of the way through
            if (currentScroll >= itemWidth * baseLength) {
                currentScroll = 0;
                scrollContainer.style.transform = 'translateX(0)';
                scrollContainer.style.transition = 'none';
                requestAnimationFrame(() => {
                    scrollContainer.style.transition = 'transform 40ms linear';
                });
            }

            requestAnimationFrame(scroll);
        };

        const animationFrame = requestAnimationFrame(scroll);
        return () => cancelAnimationFrame(animationFrame);
    }, [skills, isPaused]);

    if (skills.length === 0) return null;

    return (
        <div className="w-full overflow-hidden mb-6 bg-gray-50 relative" ref={containerRef}>
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-50 to-transparent z-10" />

            <div
                ref={scrollRef}
                className="flex whitespace-nowrap py-1"
                style={{
                    transition: 'transform 40ms linear'
                }}
            >
                {skills.map((skill, index) => {
                    const mapping = skillMappings[skill];
                    return (
                        <div
                            key={`${skill}-${index}`}
                            className="mx-2 px-3 py-1 rounded-md bg-white shadow-sm 
                                     hover:bg-gray-50 transition-colors duration-200 cursor-default
                                     flex items-center gap-2"
                            style={{ borderLeft: `3px solid ${mapping.color}` }}
                            onMouseEnter={() => setIsPaused(true)}
                            onMouseLeave={() => setIsPaused(false)}
                        >
                            <IconOrText name={skill} icon={mapping.icon} />
                        </div>
                    );
                })}
            </div>

            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-50 to-transparent z-10" />
        </div>
    );
} 