"use client";

import { Github, Linkedin, PenOff, Globe, Mail, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SocialMediaProps {
  github?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
  email?: string;
  iconSize?: number;
  className?: string;
  iconClassName?: string;
  isLoading?: boolean;
}

interface SocialLink {
  url: string;
  icon: LucideIcon;
  label: string;
  hoverColor: string;
}

export function SocialMedia({ 
  github, 
  linkedin, 
  twitter,
  website,
  email,
  iconSize = 24,
  className,
  iconClassName,
  isLoading = false
}: SocialMediaProps) {
  // If loading, show skeleton animation
  if (isLoading) {
    return (
      <div className={cn("flex items-center mt-0 sm:mt-4 gap-8", className)}>
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i}
            className="w-5 h-5 rounded-full bg-gray-200 animate-pulse"
          />
        ))}
      </div>
    );
  }

  // Create base social links without email
  const baseLinks = [
    github && {
      url: `https://github.com/${github}`,
      icon: Github,
      label: "GitHub",
      hoverColor: "hover:text-gray-900"
    },
    linkedin && {
      url: `https://linkedin.com/in/${linkedin}`,
      icon: Linkedin,
      label: "LinkedIn",
      hoverColor: "hover:text-blue-600"
    },
    twitter && {
      url: `https://twitter.com/${twitter}`,
      icon: PenOff,
      label: "Twitter",
      hoverColor: "hover:text-violet-600"
    },
    website && {
      url: website,
      icon: Globe,
      label: "Website",
      hoverColor: "hover:text-green-600"
    }
  ].filter((link): link is SocialLink => Boolean(link));

  // Add email only if we have other social links
  const socialLinks = [
    ...baseLinks,
    baseLinks.length > 0 && email && {
      url: `mailto:${email}`,
      icon: Mail,
      label: "Email",
      hoverColor: "hover:text-red-500"
    }
  ].filter((link): link is SocialLink => Boolean(link));

  if (socialLinks.length === 0) return null;

  return (
    <div className={cn("flex items-center mt-0 sm:mt-4 gap-8 sm:gap-12 animate-in fade-in-50", className)}>
      {socialLinks.map(({ url, icon: Icon, label, hoverColor }) => (
        <a
          key={label}
          href={url}
          target={label === "Email" ? "_self" : "_blank"}
          rel="noopener noreferrer"
          className={cn(
            "transition-colors", 
            hoverColor,
            iconClassName ?? "text-gray-600"
          )}
          title={label}
        >
          <Icon 
            className="hidden sm:block" 
            size={25} 
            strokeWidth={1.5} 
          />
          <Icon 
            className="sm:hidden" 
            size={20} 
            strokeWidth={1.5} 
          />
        </a>
      ))}
    </div>
  );
} 