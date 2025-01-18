"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import Select, { MultiValue, SingleValue } from "react-select"

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

export function AddSkillDialog() {
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
    } catch (error) {
      console.error("Failed to add skills:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <Select<OptionType>
          value={selectedCategory}
          onChange={(option) => {
            setSelectedCategory(option)
            setSelectedSkills([])
          }}
          options={skillCategories}
          placeholder="Select a category"
          className="w-full"
        />
      </div>

      {selectedCategory && (
        <div>
          <label className="block text-sm font-medium mb-1">Skills</label>
          <Select<OptionType, true>
            value={selectedSkills}
            onChange={(newValue) => setSelectedSkills(newValue as OptionType[])}
            options={skillOptions[selectedCategory.value as keyof typeof skillOptions]}
            placeholder="Select skills"
            isMulti
            className="w-full"
          />
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button
          onClick={handleSubmit}
          disabled={isLoading || !selectedCategory || selectedSkills.length === 0}
          className={`px-4 py-2 rounded-md bg-primary-600 text-white ${
            isLoading || !selectedCategory || selectedSkills.length === 0
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-primary-700'
          }`}
        >
          {isLoading ? 'Adding...' : 'Add Skills'}
        </button>
      </div>
    </div>
  )
}