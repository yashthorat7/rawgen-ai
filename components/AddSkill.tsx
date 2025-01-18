"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { AddSkillDialog } from "./AddSkillDialog";

export function AddSkill() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="flex justify-center mt-8 mb-2">
        <button 
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors bg-transparent group"
        >
          <Plus className="w-5 h-5 text-gray-400 group-hover:text-gray-500" />
          <span className="text-gray-400 group-hover:text-gray-500 font-medium">
            Add Skill
          </span>
        </button>
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-[800px] max-h-[90vh] flex flex-col">
              <div className="p-6 border-b">
                <h2 className="text-2xl font-bold text-primary-600">Add Skills</h2>
              </div>

              <div className="p-6 overflow-y-auto">
                <AddSkillDialog onClose={() => setIsOpen(false)} />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
