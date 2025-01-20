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
  const skillsData = useQuery(
    api.skills.getUserSkills,
    userData?.username ? { username: userData.username } : "skip"
  );

  const skills = skillsData ?? [];

  // Add debugging to check for duplicate IDs
  const seenIds = new Set();
  skills.forEach((skill) => {
    if (seenIds.has(skill._id)) {
      console.warn('Duplicate _id found:', skill._id);
    }
    seenIds.add(skill._id);
  });

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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 mt-8 gap-5">
      {skills.map((categorySkills: CategorySkills, index) => (
        <SkillCard
          key={categorySkills._id || `skill-${categorySkills.category}-${index}`}
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