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
  const reorderSkills = useMutation(api.skills.reorderSkills);

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
          <div key={i} className="bg-white rounded-lg shadow-sm animate-pulse min-h-[225px] flex flex-col">
            {/* Skills at the top */}
            <div className="flex-1 p-4">
              <div className="flex flex-wrap gap-2 justify-center">
                {[...Array(6)].map((_, j) => (
                  <div key={j} className="h-7 bg-gray-200 rounded-md w-16" />
                ))}
              </div>
            </div>
            
            {/* Category at the bottom */}
            <div className="p-3 flex justify-center items-center border-t border-gray-100">
              <div className="h-6 bg-gray-200 rounded w-32" />
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

  const handleReorder = async (fromIndex: number, toIndex: number) => {
    if (!email || !skills) return;

    // Create updates array with new order
    const newSkills = [...skills];
    const [movedItem] = newSkills.splice(fromIndex, 1);
    newSkills.splice(toIndex, 0, movedItem);

    // Update order in database
    const updates = newSkills.map((skill, i) => ({
      category: skill.category,
      order: i,
    }));

    await reorderSkills({
      email,
      updates,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 mt-8 gap-5">
      {skills.map((categorySkills, index) => (
        <SkillCard
          key={categorySkills._id || `skill-${categorySkills.category}-${index}`}
          category={categorySkills.category}
          skills={categorySkills.skills}
          index={index}
          onReorder={handleReorder}
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