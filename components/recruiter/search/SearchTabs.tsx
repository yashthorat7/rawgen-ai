"use client";

import { ReactNode } from "react";
import { Star, Briefcase, Code2, Filter, Award } from "lucide-react";

export type TabType = "users" | "projects" | "skills" | "platforms" | "certificates";

interface SearchTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs: { id: TabType; label: string; icon: ReactNode }[] = [
  { id: "users", label: "Users", icon: <Star className="h-4 w-4" /> },
  { id: "platforms", label: "Platforms", icon: <Filter className="h-4 w-4" /> },
  { id: "skills", label: "Skills", icon: <Code2 className="h-4 w-4" /> },
  { id: "projects", label: "Projects", icon: <Briefcase className="h-4 w-4" /> },
  { id: "certificates", label: "Certificates", icon: <Award className="h-4 w-4" /> },
];

export function SearchTabs({ activeTab, onTabChange }: SearchTabsProps) {
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex space-x-1 min-w-max md:min-w-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
              transition-colors duration-200
              ${
                activeTab === tab.id
                  ? "bg-primary-100 text-primary-900"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }
            `}
          >
            {tab.icon}
            <span className="whitespace-nowrap">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
} 