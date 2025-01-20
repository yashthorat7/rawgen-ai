"use client";

import { Trash2, PencilIcon } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { AddProjectDialog } from "./AddProjectDialog";

interface ProjectCardProps {
  id: Id<"projects">;
  title: string;
  description: string;
  projectLink?: string;
  deployLink?: string;
  techStack: string[];
  image?: string;
  onDelete?: () => void;
}

export function ProjectCard({ 
  id,
  title, 
  description, 
  projectLink, 
  deployLink,
  techStack,
  image,
  onDelete 
}: ProjectCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Function to truncate description to first 10 words
  const truncateDescription = (text: string) => {
    const words = text.split(' ');
    if (words.length <= 10) return text;
    return words.slice(0, 10).join(' ') + '...';
  };

  return (
    <>
      <div className="group relative bg-white 
                    w-full overflow-hidden
                    shadow-[0_4px_8px_rgba(0,0,100,0.08)] transition-all duration-200 ease-in-out 
                    hover:shadow-[0_8px_12px_rgba(0,0,100,0.1)] hover:scale-[1.01] rounded-lg
                    border border-gray-100">
        {image && (
          <div className="aspect-video overflow-hidden p-4">
            <img 
              src={image} 
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="p-4">
          <div className="mb-2">
            <h3 className="font-bold text-xl text-gray-900">
              {title}
            </h3>
          </div>

          <p className="text-gray-600 text-sm mb-4">
            {truncateDescription(description)}
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {techStack.map((tech, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-primary-100 text-primary-600 rounded text-xs font-medium"
              >
                {tech}
              </span>
            ))}
          </div>

          {deployLink && (
            <a 
              href={deployLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Live Demo →
            </a>
          )}

          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
            <button
              onClick={() => setIsEditDialogOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <PencilIcon className="w-4 h-4 text-gray-600" />
            </button>
            {onDelete && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-2 hover:bg-red-50 rounded-full transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            )}
          </div>
        </div>
      </div>

      <AddProjectDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        initialData={{
          id,
          title,
          description,
          projectLink: projectLink || "",
          deployLink,
          techStack,
          image
        }}
        mode="edit"
      />
    </>
  );
} 