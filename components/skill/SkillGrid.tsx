"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AddSkillCard } from "./AddSkillCard";
import SkillCard from "./SkillCard";
import { useUser } from "@clerk/nextjs";
import { Title } from "../ui/Title";

interface CategorySkills {
  _id: string;
  category: string;
  skills: string[];
}

interface SkillGridProps {
  username?: string;
  isPublicView?: boolean;
}

export function SkillGrid({ username, isPublicView = false }: SkillGridProps) {
  const { user, isLoaded } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  const reorderSkills = useMutation(api.skills.reorderSkills);

  // First get user data from email (for private view)
  const privateUserData = useQuery(
    api.users.getUser,
    !isPublicView && email ? { email } : "skip"
  );

  // Get skills either from username (public) or user data (private)
  const skills = useQuery(
    api.skills.getUserSkills,
    isPublicView 
      ? username ? { username } : "skip"
      : privateUserData?.username ? { username: privateUserData.username } : "skip"
  );

  const deleteSkillCategory = useMutation(api.skills.deleteSkillCategory);

  // Show loading state while data is loading
  if ((!isLoaded && !isPublicView) || (!isPublicView && !privateUserData) || skills === undefined) {
    return (
      <>
        <Title title="Skills" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 mt-2 gap-4 sm:gap-5">
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
      </>
    );
  }

  // Show message if no skills found
  if (!skills || skills.length === 0) {
    if (isPublicView) {
      return null;
    }
    return (
      <>
        <Title title="Skills" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 mt-2 gap-4 sm:gap-5">
          <AddSkillCard />
        </div>
      </>
    );
  }

  const handleReorder = async (fromIndex: number, toIndex: number) => {
    if (!email || !skills || !privateUserData?.username) return;

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
    <>
      <Title title="Skills" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 mt-2 gap-4 sm:gap-5">
        {skills.map((categorySkills, index) => (
          <SkillCard
            key={categorySkills._id || `skill-${categorySkills.category}-${index}`}
            category={categorySkills.category}
            skills={categorySkills.skills}
            index={index}
            onReorder={!isPublicView ? handleReorder : undefined}
            onDelete={!isPublicView && privateUserData?.username ? () => deleteSkillCategory({
              username: privateUserData.username,
              category: categorySkills.category
            }) : undefined}
            isPublicView={isPublicView}
          />
        ))}
        {!isPublicView && <AddSkillCard />}
      </div>
    </>
  );
} 