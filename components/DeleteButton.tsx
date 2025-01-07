"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

interface DeleteButtonProps {
  onDelete: () => void;
}

export function DeleteButton({ onDelete }: DeleteButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="relative">
      <button 
        className="p-0 rounded-full hover:bg-red-50 group transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          setShowConfirm(true);
        }}
      >
        <Trash2 className="w-6 h-6 text-gray-300 group-hover:text-red-500 transition-colors" />
      </button>

      {showConfirm && (
        <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg p-3 w-48 text-sm">
          <p className="text-gray-600 mb-2">Delete this card?</p>
          <div className="flex justify-end gap-2">
            <button
              className="px-2 py-1 text-gray-500 hover:text-gray-700 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setShowConfirm(false);
              }}
            >
              Cancel
            </button>
            <button
              className="px-2 py-1 text-red-500 hover:text-red-700 transition-colors"
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