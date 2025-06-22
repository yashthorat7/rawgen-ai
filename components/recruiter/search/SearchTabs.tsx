"use client";

import { ReactNode } from "react";
import { Star, Briefcase, Code2, Filter, Award } from "lucide-react";

export type TabType =
  | "users"
  | "platforms"
  | "skills"
  | "projects"
  | "certificates";

interface SearchTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs: { id: TabType; label: string; icon: ReactNode }[] = [
  { id: "users", label: "Users", icon: <Star className="h-4 w-4" /> },
  { id: "platforms", label: "Platforms", icon: <Filter className="h-4 w-4" /> },
  { id: "skills", label: "Skills", icon: <Code2 className="h-4 w-4" /> },
  {
    id: "projects",
    label: "Projects",
    icon: <Briefcase className="h-4 w-4" />,
  },
  {
    id: "certificates",
    label: "Certificates",
    icon: <Award className="h-4 w-4" />,
  },
];

export function SearchTabs({ activeTab, onTabChange }: SearchTabsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {["users", "platforms", "skills", "projects", "certificates"].map(
        (tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab as TabType)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab
                ? "bg-primary-100 text-primary-700 font-medium"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ),
      )}
    </div>
  );
}
