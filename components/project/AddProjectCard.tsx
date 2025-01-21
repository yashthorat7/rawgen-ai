"use client";

import { useState } from "react";
import { AddProjectDialog } from "./AddProjectDialog";

export function AddProjectCard() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="flex justify-center">
        <button 
          onClick={() => setIsOpen(true)}
          className="flex w-full h-[120px] sm:h-full sm:min-h-[225px] items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:text-primary-500 transition-colors bg-transparent group"
        >
          <span className="text-gray-400 group-hover:text-primary-500 font-medium">
            Add Project
          </span>
        </button>
      </div>

      <AddProjectDialog 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
} 