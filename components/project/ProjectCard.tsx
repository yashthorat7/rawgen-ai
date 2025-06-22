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
  index: number;
  onReorder?: (fromIndex: number, toIndex: number) => Promise<void>;
  isPublicView?: boolean;
}

export function ProjectCard({
  id,
  title,
  description,
  projectLink,
  deployLink,
  techStack,
  image,
  onDelete,
  index,
  onReorder,
  isPublicView = false,
}: ProjectCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const truncateDescription = (text: string) => {
    const sentence = text.split(/[.!?]/)[0];
    return sentence + (text.length > sentence.length ? "..." : "");
  };

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add(
      "border-2",
      "border-primary-500",
      "border-dashed",
    );
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove(
      "border-2",
      "border-primary-500",
      "border-dashed",
    );
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove(
      "border-2",
      "border-primary-500",
      "border-dashed",
    );

    const fromIndex = parseInt(e.dataTransfer.getData("text/plain"));
    if (fromIndex === index) return;

    await onReorder?.(fromIndex, index);
  };

  return (
    <>
      <div
        className={`group relative bg-white 
                  w-full overflow-hidden select-none
                  shadow-[0_4px_8px_rgba(0,0,100,0.08)] transition-all duration-200 ease-in-out 
                  hover:shadow-[0_8px_12px_rgba(0,0,100,0.1)] hover:scale-[1.01] rounded-lg
                  cursor-pointer ${isDragging ? "opacity-50" : ""}`}
        onClick={() => setShowInfo(true)}
        draggable={!isPublicView}
        onDragStart={!isPublicView ? handleDragStart : undefined}
        onDragEnd={!isPublicView ? handleDragEnd : undefined}
        onDragOver={!isPublicView ? handleDragOver : undefined}
        onDragLeave={!isPublicView ? handleDragLeave : undefined}
        onDrop={!isPublicView ? handleDrop : undefined}
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
            <h3 className="font-bold text-xl text-gray-900">{title}</h3>
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
          {!isPublicView && (
            <div className="absolute bottom-4 right-4">
              <UpdateCardIcon
                onEdit={() => setIsEditDialogOpen(true)}
                onDelete={onDelete}
              />
            </div>
          )}
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
          image,
        }}
        mode="edit"
      />
    </>
  );
}
