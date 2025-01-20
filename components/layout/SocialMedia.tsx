"use client";

import { Github, Linkedin, Twitter, Globe, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SocialMediaProps {
  github?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
  iconSize?: number;
  className?: string;
  iconClassName?: string;
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
  iconSize = 24,
  className,
  iconClassName
}: SocialMediaProps) {
  // Only include links that are set in database
  const socialLinks = [
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
      icon: Twitter,
      label: "Twitter",
      hoverColor: "hover:text-sky-500"
    },
    website && {
      url: website,
      icon: Globe,
      label: "Website",
      hoverColor: "hover:text-green-600"
    }
  ].filter((link): link is SocialLink => Boolean(link)); // Remove null/undefined entries

  if (socialLinks.length === 0) return null;

  return (
    <div className={cn("flex items-center mt-0 sm:mt-4 gap-8", className)}>
      {socialLinks.map(({ url, icon: Icon, label, hoverColor }) => (
        <a
          key={label}
          href={url}
          target="_blank"
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