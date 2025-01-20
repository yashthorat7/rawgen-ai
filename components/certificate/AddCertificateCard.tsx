"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { AddCertificateDialog } from "./AddCertificateDialog";

export function AddCertificateCard() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="flex justify-center">
        <button 
          onClick={() => setIsOpen(true)}
          className="flex w-full h-full min-h-[120px] sm:h-full sm:min-h-[225px] items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors bg-transparent group"
        >
          <Plus className="w-8 h-8 text-gray-300 group-hover:text-gray-400" />
        </button>
      </div>

      <AddCertificateDialog 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
} 