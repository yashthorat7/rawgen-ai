"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AddSkillCard } from "./AddSkillCard";
import SkillCard from "./SkillCard";
import { useUser } from "@clerk/nextjs";

interface CategorySkills {
  _id: string;
  category: string;
  skills: string[];
}

export function SkillGrid() {
  const { user, isLoaded } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;

  // First get user data from email
  const userData = useQuery(
    api.users.getUser,
    email ? { email } : "skip"
  );

  // Then use the username from user data to get skills
  const skills = useQuery(
    api.skills.getUserSkills,
    userData?.username ? { username: userData.username } : "skip"
  );

  const deleteSkillCategory = useMutation(api.skills.deleteSkillCategory);

  // Show loading state while user data is loading
  if (!isLoaded || !userData || skills === undefined) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 mt-8 gap-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm animate-pulse min-h-[225px] p-4">
            {/* Category */}
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
            
            {/* Skills */}
            <div className="flex flex-wrap gap-2">
              {[...Array(6)].map((_, j) => (
                <div key={j} className="h-8 bg-gray-200 rounded w-20" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Show message if no user is logged in
  if (!email) {
    return (
      <div className="mt-8 text-center text-gray-500">
        Please log in to view skills
      </div>
    );
  }

  // Show message if no skills found
  if (skills.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 mt-8 gap-5">
        <AddSkillCard />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 mt-8 gap-5">
      {skills.map((categorySkills, index) => (
        <SkillCard
          key={categorySkills._id || `skill-${categorySkills.category}-${index}`}
          category={categorySkills.category}
          skills={categorySkills.skills}
          onDelete={() => deleteSkillCategory({
            username: userData.username,
            category: categorySkills.category
          })}
        />
      ))}
      <AddSkillCard />
    </div>
  );
} 