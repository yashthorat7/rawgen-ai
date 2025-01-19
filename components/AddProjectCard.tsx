"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { AddProjectDialog } from "@/components/AddProjectDialog";

export function AddProjectCard() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="flex justify-center">
        <button 
          onClick={() => setIsOpen(true)}
          className="flex w-full h-[120px] sm:h-[225px] items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors bg-transparent group"
        >
          <Plus className="w-8 h-8 text-gray-300" />
        </button>
      </div>

      <AddProjectDialog 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
} 