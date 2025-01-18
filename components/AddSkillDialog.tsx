"use client"

import { useState, KeyboardEvent } from "react"
import { useUser } from "@clerk/nextjs"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { X, Plus } from "lucide-react"

interface AddSkillDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddSkillDialog({ isOpen, onClose }: AddSkillDialogProps) {
  const { user } = useUser()
  const [category, setCategory] = useState("")
  const [skillInput, setSkillInput] = useState("")
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const userEmail = user?.primaryEmailAddress?.emailAddress
  const addSkills = useMutation(api.skills.addSkills)

  const handleSubmit = async () => {
    if (!userEmail || !category.trim() || selectedSkills.length === 0) return;

    setIsLoading(true)
    try {
      await addSkills({
        email: userEmail,
        category: category.trim().toLowerCase().replace(/\s+/g, '_'),
        skills: selectedSkills
      })
      onClose()
    } catch (error) {
      console.error("Failed to add skills:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddSkill = () => {
    if (!skillInput.trim()) return;
    
    // Remove whitespace and convert to lowercase
    const formattedSkill = skillInput.trim().toLowerCase();
    
    if (!selectedSkills.includes(formattedSkill)) {
      setSelectedSkills([...selectedSkills, formattedSkill]);
    }
    setSkillInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (!skillInput.trim()) return;
      
      // Remove whitespace and convert to lowercase
      const formattedSkill = skillInput.trim().toLowerCase();
      
      if (!selectedSkills.includes(formattedSkill)) {
        setSelectedSkills([...selectedSkills, formattedSkill]);
      }
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSelectedSkills(prev => prev.filter(skill => skill !== skillToRemove));
  }

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-auto">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-[500px] max-h-[90vh] flex flex-col">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold text-primary-600">Add Skills</h2>
          </div>

          <div className="p-6 pt-4 overflow-y-auto">
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border-2 rounded-md focus:outline-none focus:border-primary-600"
                  placeholder="Enter a category name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Skills</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="flex-1 px-3 py-2 border-2 rounded-md focus:outline-none focus:border-primary-600"
                      placeholder="Press comma to add"
                    />
                    <button
                      onClick={handleAddSkill}
                      disabled={!skillInput.trim()}
                      className={`px-4 py-2 rounded-md text-white ${
                        !skillInput.trim()
                          ? 'bg-primary-400 cursor-not-allowed'
                          : 'bg-primary-600 hover:bg-primary-700'
                      }`}
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {selectedSkills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedSkills.map((skill, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded-md"
                        >
                          <span>{skill}</span>
                          <button
                            onClick={() => handleRemoveSkill(skill)}
                            className="p-0.5 hover:bg-primary-200 rounded-full"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !category.trim() || selectedSkills.length === 0}
                  className={`px-4 py-2 rounded-md text-white ${
                    isLoading || !category.trim() || selectedSkills.length === 0
                      ? 'bg-primary-400 cursor-not-allowed'
                      : 'bg-primary-600 hover:bg-primary-700'
                  }`}
                >
                  {isLoading ? 'Adding...' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}