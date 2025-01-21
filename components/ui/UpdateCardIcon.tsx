"use client";

import { PencilIcon, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

interface UpdateCardIconProps {
  onEdit?: () => void;
  onDelete?: () => void;
  showOnHover?: boolean;
  position?: "top-right" | "bottom-right";
}

export function UpdateCardIcon({ 
  onEdit, 
  onDelete, 
  showOnHover = true,
  position = "bottom-right" 
}: UpdateCardIconProps) {
  const positionClasses = {
    "top-right": "top-0 right-0",
    "bottom-right": "bottom-0 right-0"
  };

  return (
    <motion.div 
      className={`absolute ${positionClasses[position]} ${
        showOnHover ? "opacity-60 sm:opacity-0 group-hover:opacity-100" : "opacity-100"
      } transition-opacity duration-200 flex gap-1`}
      initial={false}
    >
      {onEdit && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onEdit();
          }}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors bg-white/80"
        >
          <PencilIcon className="w-5 h-5 text-gray-600" />
        </button>
      )}
      {onDelete && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete();
          }}
          className="p-2 hover:bg-red-50 rounded-full transition-colors bg-white/80"
        >
          <Trash2 className="w-5 h-5 text-red-500" />
        </button>
      )}
    </motion.div>
  );
} 