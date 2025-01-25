"use client";

import { PencilIcon, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";

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
  const [showConfirm, setShowConfirm] = useState(false);
  const confirmRef = useRef<HTMLDivElement>(null);
  
  const positionClasses = {
    "top-right": "top-0 right-0",
    "bottom-right": "bottom-0 right-0"
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (confirmRef.current && !confirmRef.current.contains(event.target as Node)) {
        setShowConfirm(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        <div className="relative">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowConfirm(true);
            }}
            className="p-2 hover:bg-red-50 rounded-full transition-colors bg-white/80"
          >
            <Trash2 className="w-5 h-5 text-red-500" />
          </button>

          {showConfirm && (
            <div 
              ref={confirmRef}
              className="absolute bottom-full right-0 mb-3 bg-white rounded-lg 
                        shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-gray-100 
                        p-4 w-56 text-sm z-50 animate-in fade-in slide-in-from-top-2"
            >
              <p className="text-gray-700 font-medium mb-3">Are you sure you want to delete this card?</p>
              <div className="flex justify-end gap-2">
                <button
                  className="px-3 py-1.5 text-gray-600 hover:text-gray-800 
                            hover:bg-gray-50 rounded-md transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowConfirm(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-3 py-1.5 bg-red-500 text-white rounded-md 
                            hover:bg-red-600 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                    setShowConfirm(false);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
} 