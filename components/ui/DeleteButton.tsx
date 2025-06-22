"use client";

import { useState, useEffect, useRef } from "react";
import { Trash2 } from "lucide-react";

interface DeleteButtonProps {
  onDelete: () => void;
}

export function DeleteButton({ onDelete }: DeleteButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const confirmRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        confirmRef.current &&
        !confirmRef.current.contains(event.target as Node)
      ) {
        setShowConfirm(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <button
        className="p-1.5 rounded-full hover:bg-red-50 group transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          setShowConfirm(true);
        }}
      >
        <Trash2 className="w-5 h-5 text-gray-300 group-hover:text-red-500 transition-colors" />
      </button>

      {showConfirm && (
        <div
          ref={confirmRef}
          className="absolute bottom-full right-0 mb-3 bg-white rounded-lg 
                    shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-gray-100 
                    p-4 w-56 text-sm z-50 animate-in fade-in slide-in-from-top-2"
        >
          <p className="text-gray-700 font-medium mb-3">
            Are you sure you want to delete this card?
          </p>
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
