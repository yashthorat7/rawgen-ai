"use client";

import { Plus } from "lucide-react";

export function AddSkill() {
  return (
    <div className="flex justify-center mt-8 mb-2">
      <button className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors bg-transparent group">
        <Plus className="w-5 h-5 text-gray-400 group-hover:text-gray-500" />
        <span className="text-gray-400 group-hover:text-gray-500 font-medium">
          Add Skill
        </span>
      </button>
    </div>
  );
}
