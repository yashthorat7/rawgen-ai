"use client";

import { useScrollLock } from "@/lib/utils";
import { X, ExternalLink, Github } from "lucide-react";

interface InfoProjectCardProps {
  title: string;
  description: string;
  projectLink?: string;
  deployLink?: string;
  techStack: string[];
  image?: string;
  onClose: () => void;
}

export function InfoProjectCard({
  title,
  description,
  projectLink,
  deployLink,
  techStack,
  image,
  onClose
}: InfoProjectCardProps) {
  useScrollLock(true);
  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 overflow-auto">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-full md:max-w-[800px] lg:max-w-[1000px] max-h-[90vh] flex flex-col">
          {/* Header with integrated close button */}
          <div className="p-4 sm:p-6 border-b flex justify-between items-center">
            <h2 className="text-xl sm:text-2xl font-bold text-primary-600">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 sm:p-6 overflow-y-auto">
            {image && (
              <div className="aspect-video mb-4 sm:mb-6 overflow-hidden rounded-lg border border-gray-200">
                <img
                  src={image}
                  alt={title}
                  className="w-full h-full object-contain bg-gray-50"
                />
              </div>
            )}

            <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
              {techStack.map((tech, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary-100 text-primary-600 rounded-md text-sm font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>

            <p className="text-gray-600 whitespace-pre-wrap mb-4 sm:mb-6 text-sm sm:text-base">
              {description}
            </p>
          </div>

          <div className="p-4 sm:p-6 border-t flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
            <a
              href={projectLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-gray-200 flex-1
                ${projectLink 
                  ? 'hover:bg-gray-50 cursor-pointer' 
                  : 'opacity-50 cursor-not-allowed'
                }`}
              onClick={(e) => !projectLink && e.preventDefault()}
            >
              <Github className="w-5 h-5" />
              <span>View Source</span>
            </a>
            
            <a
              href={deployLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-primary-600 text-white flex-1
                ${deployLink 
                  ? 'hover:bg-primary-700 cursor-pointer' 
                  : 'opacity-50 cursor-not-allowed'
                }`}
              onClick={(e) => !deployLink && e.preventDefault()}
            >
              <ExternalLink className="w-5 h-5" />
              <span>Visit Project</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
} 