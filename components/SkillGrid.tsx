"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AddSkillCard } from "./AddSkillCard";
import SkillCard from "./SkillCard";
import { useUser } from "@clerk/nextjs";

interface CategorySkills {
  _id: string;
  userId: string;
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
  const skillsData = useQuery(
    api.skills.getUserSkills,
    userData?.username ? { username: userData.username } : "skip"
  );

  const skills = skillsData ?? [];

  const deleteSkillCategory = useMutation(api.skills.deleteSkillCategory);

  const handleDelete = async (category: string) => {
    if (!userData?.username) return;
    try {
      await deleteSkillCategory({
        username: userData.username,
        category
      });
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 mt-8 gap-5">
      {skills.map((categorySkills: CategorySkills) => (
        <SkillCard
          key={categorySkills._id}
          category={categorySkills.category}
          skills={categorySkills.skills}
          onDelete={() => handleDelete(categorySkills.category)}
          onUpdate={() => {
            // The query will automatically refetch when the data changes
            // No need to manually refetch
          }}
        />
      ))}
      <AddSkillCard />
    </div>
  );
} 