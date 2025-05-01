"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AddSkillCard } from "./AddSkillCard";
import { SkillCard } from "./SkillCard";
import { useUser } from "@clerk/nextjs";
import { Title } from "../ui/Title";
import { useMemo } from "react";
import { SkillCardSkeleton } from "../platform-stats/LoadingSkeleton";

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

  const privateUserData = useQuery(
    api.users.getUser,
    !isPublicView && email ? { email } : "skip"
  );

  const skills = useQuery(
    api.skills.getUserSkills,
    isPublicView 
      ? username ? { username } : "skip"
      : privateUserData?.username ? { username: privateUserData.username } : "skip"
  );

  const sortedSkills = useMemo(() => {
    if (!skills) return undefined;
    return [...skills].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [skills]);

  const deleteSkillCategory = useMutation(api.skills.deleteSkillCategory);
  if ((!isLoaded && !isPublicView) || (!isPublicView && !privateUserData) || !sortedSkills) {
    return (
      <>
        <Title title="Skills" />
        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
          {[...Array(3)].map((_, i) => (
            <SkillCardSkeleton key={i} />
          ))}
        </div>
      </>
    );
  }

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

    const newSkills = [...skills];
    const [movedItem] = newSkills.splice(fromIndex, 1);
    newSkills.splice(toIndex, 0, movedItem);

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
        {sortedSkills.map((categorySkills, index) => (
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