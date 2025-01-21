"use client";

import { Trash2, PencilIcon } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { AddProjectDialog } from "./AddProjectDialog";
import { UpdateCardIcon } from "../ui/UpdateCardIcon";
import { InfoProjectCard } from "./InfoProjectCard";

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
  const [showInfo, setShowInfo] = useState(false);

  // Function to truncate description to first sentence
  const truncateDescription = (text: string) => {
    const sentence = text.split(/[.!?]/)[0];
    return sentence + (text.length > sentence.length ? '...' : '');
  };

  return (
    <>
      <div 
        className="group relative bg-white 
                  w-full overflow-hidden
                  shadow-[0_4px_8px_rgba(0,0,100,0.08)] transition-all duration-200 ease-in-out 
                  hover:shadow-[0_8px_12px_rgba(0,0,100,0.1)] hover:scale-[1.01] rounded-lg
                  cursor-pointer"
        onClick={() => setShowInfo(true)}
      >
        {image && (
          <div className="aspect-video overflow-hidden p-4 pb-1">
            <img 
              src={image} 
              alt={title}
              className="w-full h-full object-cover rounded-lg border border-gray-100"
            />
          </div>
        )}
        
        <div className="p-4 pt-0">
          <div className="mb-2">
            <h3 className="font-bold text-xl text-gray-900">
              {title}
            </h3>
          </div>

          <p className="text-gray-600 text-sm mb-2 truncate whitespace-nowrap overflow-hidden">
            {truncateDescription(description)}
          </p>

          <div className="flex flex-wrap gap-2">
            {techStack.map((tech, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-primary-100 text-primary-600 rounded text-xs font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
          <div className="absolute bottom-4 right-4">
            <UpdateCardIcon
              onEdit={() => setIsEditDialogOpen(true)}
              onDelete={onDelete}
            />
          </div>
        </div>
      </div>

      {showInfo && (
        <InfoProjectCard
          title={title}
          description={description}
          projectLink={projectLink}
          deployLink={deployLink}
          techStack={techStack}
          image={image}
          onClose={() => setShowInfo(false)}
        />
      )}

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