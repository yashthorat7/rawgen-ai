"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import Select, { MultiValue, SingleValue } from "react-select"
import CreatableSelect from 'react-select/creatable'

type OptionType = { value: string; label: string };

const skillCategories = [
  { value: 'programming', label: 'Programming Languages' },
  { value: 'frameworks', label: 'Frameworks & Libraries' },
  { value: 'databases', label: 'Databases' },
  { value: 'tools', label: 'Developer Tools' },
  { value: 'soft_skills', label: 'Soft Skills' },
]

const skillOptions = {
  programming: [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'typescript', label: 'TypeScript' },
  ],
  frameworks: [
    { value: 'react', label: 'React' },
    { value: 'nextjs', label: 'Next.js' },
    { value: 'angular', label: 'Angular' },
    { value: 'vue', label: 'Vue.js' },
    { value: 'django', label: 'Django' },
  ],
  databases: [
    { value: 'mysql', label: 'MySQL' },
    { value: 'mongodb', label: 'MongoDB' },
    { value: 'postgresql', label: 'PostgreSQL' },
    { value: 'redis', label: 'Redis' },
    { value: 'firebase', label: 'Firebase' },
  ],
  tools: [
    { value: 'git', label: 'Git' },
    { value: 'docker', label: 'Docker' },
    { value: 'kubernetes', label: 'Kubernetes' },
    { value: 'aws', label: 'AWS' },
    { value: 'linux', label: 'Linux' },
  ],
  soft_skills: [
    { value: 'teamwork', label: 'Teamwork' },
    { value: 'communication', label: 'Communication' },
    { value: 'leadership', label: 'Leadership' },
    { value: 'problem_solving', label: 'Problem Solving' },
    { value: 'time_management', label: 'Time Management' },
  ],
}

interface AddSkillDialogProps {
  onClose: () => void;
}

export function AddSkillDialog({ onClose }: AddSkillDialogProps) {
  const { user } = useUser()
  const [selectedCategory, setSelectedCategory] = useState<OptionType | null>(null)
  const [selectedSkills, setSelectedSkills] = useState<OptionType[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const userEmail = user?.primaryEmailAddress?.emailAddress
  const userInfo = useQuery(
    api.users.getUser,
    userEmail ? { email: userEmail } : "skip"
  )

  const addSkills = useMutation(api.skills.addSkills)

  const handleSubmit = async () => {
    if (!userInfo?.username || !selectedCategory || selectedSkills.length === 0) return

    setIsLoading(true)
    try {
      await addSkills({
        username: userInfo.username,
        category: selectedCategory.value,
        skills: selectedSkills.map(skill => skill.value)
      })
      onClose()
    } catch (error) {
      console.error("Failed to add skills:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCategory = (inputValue: string) => {
    const newCategory = {
      value: inputValue.toLowerCase().replace(/\s+/g, '_'),
      label: inputValue
    }
    setSelectedCategory(newCategory)
    // Add the new category to skillOptions
    skillOptions[newCategory.value as keyof typeof skillOptions] = []
  }

  const selectStyles = {
    control: (base: any, state: { isFocused: boolean }) => ({
      ...base,
      backgroundColor: 'white',
      borderColor: state.isFocused ? '#6366f1' : '#d1d5db',
      borderWidth: '2px',
      borderRadius: '0.375rem',
      boxShadow: 'none',
      '&:hover': {
        borderColor: state.isFocused ? '#6366f1' : '#d1d5db'
      }
    }),
    menuPortal: (base: any) => ({
      ...base,
      zIndex: 9999
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <CreatableSelect<OptionType>
          value={selectedCategory}
          onChange={(option) => {
            setSelectedCategory(option)
            setSelectedSkills([])
          }}
          onCreateOption={handleCreateCategory}
          options={skillCategories}
          placeholder="Select or create a category"
          className="w-full"
          formatCreateLabel={(inputValue) => `Create category "${inputValue}"`}
          styles={selectStyles}
        />
      </div>

      {selectedCategory && (
        <div>
          <label className="block text-sm font-medium mb-1">Skills</label>
          <Select<OptionType, true>
            value={selectedSkills}
            onChange={(newValue) => setSelectedSkills(newValue as OptionType[])}
            options={skillOptions[selectedCategory.value as keyof typeof skillOptions] || []}
            placeholder="Select skills"
            isMulti
            className="w-full"
            styles={selectStyles}
          />
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="px-4 py-2 border rounded-md hover:bg-gray-50"
        >
          Close
        </button>
        <button
          onClick={handleSubmit}
          disabled={isLoading || !selectedCategory || selectedSkills.length === 0}
          className={`px-4 py-2 rounded-md text-white ${
            isLoading || !selectedCategory || selectedSkills.length === 0
              ? 'bg-primary-400 cursor-not-allowed'
              : 'bg-primary-600 hover:bg-primary-700'
          }`}
        >
          {isLoading ? 'Adding...' : 'Add'}
        </button>
      </div>
    </div>
  )
}