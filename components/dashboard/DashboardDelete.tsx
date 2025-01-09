"use client";

import { useState, useEffect, useRef } from "react";
import { Trash2 } from "lucide-react";

interface DashboardDeleteProps {
  onDelete: () => void;
}

export function DashboardDelete({ onDelete }: DashboardDeleteProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const confirmRef = useRef<HTMLDivElement>(null);

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
    <div className="relative">
      <button 
        className="flex items-center gap-2 p-1.5 sm:p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-all duration-200"
        onClick={(e) => {
          e.stopPropagation();
          setShowConfirm(true);
        }}
      >
        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="hidden sm:inline text-sm">Delete</span>
      </button>

      {showConfirm && (
        <div 
          ref={confirmRef}
          className="absolute top-full right-0 mt-2 bg-white rounded-lg 
                    shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-gray-100 
                    p-4 w-56 text-sm z-50 animate-in fade-in slide-in-from-top-2"
        >
          <p className="text-gray-700 font-medium mb-3">Are you sure you want to delete this profile?</p>
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
  );
} 