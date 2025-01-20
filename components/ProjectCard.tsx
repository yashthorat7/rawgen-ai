"use client";

import { Trash2 } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

interface ProjectCardProps {
  id?: Id<"projects">;
  title: string;
  description: string;
  projectLink: string;
  deployLink?: string;
  techStack: string[];
  image?: string | null;
  isLoading?: boolean;
  onDelete?: (id: Id<"projects">) => void;
}

export function ProjectCard({ 
  id,
  title, 
  description, 
  projectLink, 
  deployLink, 
  techStack, 
  image,
  isLoading,
  onDelete 
}: ProjectCardProps) {

  if (isLoading) {
    return (
      <div className="p-4 border rounded-lg animate-pulse bg-white">
        <div className="aspect-video bg-gray-200 rounded-lg mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  // Function to truncate description to first 10 words
  const truncateDescription = (text: string) => {
    const words = text.split(' ');
    if (words.length > 16) {
      return words.slice(0, 16).join(' ') + '...';
    }
    return text;
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (id && onDelete) {
      onDelete(id);
    }
  };

  return (
    <div className="group relative bg-white 
                    w-full min-w-[280px] max-w-full overflow-hidden
                    shadow-[0_4px_8px_rgba(0,0,100,0.08)] transition-all duration-200 ease-in-out 
                    hover:shadow-[0_8px_12px_rgba(0,0,100,0.1)] hover:scale-[1.01] p-4 rounded-lg">
      {image && (
        <div className="aspect-video border-2 border-gray-100 mb-2 rounded-lg overflow-hidden bg-gray-100">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
        </div>
      )}
      
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-xl text-gray-900">
          {title}
        </h3>
      </div>
      
      <p className="text-gray-600 text-sm line-clamp-2 mb-2">
        {truncateDescription(description)}
      </p>
      
      {techStack.length > 0 && (
        <div className="mt-2 flex gap-2 flex-wrap">
          {techStack.map((tech, i) => (
            <span 
              key={i} 
              className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs font-medium"
            >
              {tech}
            </span>
          ))}
        </div>
      )}

      {onDelete && id && (
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleDelete}
            className="p-1 hover:bg-red-50 rounded-full transition-colors"
          >
            <Trash2 className="w-5 h-5 text-red-500" />
          </button>
        </div>
      )}
    </div>
  );
} 