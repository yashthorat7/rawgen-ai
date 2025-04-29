"use client";

import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { AddProjectCard } from "./AddProjectCard";
import { ProjectCard } from "./ProjectCard";
import { Id } from "@/convex/_generated/dataModel";
import { ProjectCardSkeleton } from "../platform-stats/LoadingSkeleton";
import { Title } from "../ui/Title";
import { useMemo } from "react";

interface Project {
  id: Id<"projects">;
  title: string;
  description: string;
  projectLink: string;
  deployLink?: string;
  techStack: string[];
  image: string | null | undefined;
  order: number;
}

interface ProjectGridProps {
  username?: string;
  isPublicView?: boolean;
}

export function ProjectGrid({ username, isPublicView = false }: ProjectGridProps) {
  const { user, isLoaded } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  const removeProject = useMutation(api.projects.remove);
  const reorderProjects = useMutation(api.projects.reorder);

  const privateUserData = useQuery(
    api.users.getUser,
    !isPublicView && email ? { email } : "skip"
  );

  const projects = useQuery(
    api.projects.get,
    isPublicView 
      ? username ? { username } : "skip"
      : privateUserData?.username ? { username: privateUserData.username } : "skip"
  );

  // Ensure projects are sorted by order
  const sortedProjects = useMemo(() => {
    if (!projects) return undefined;
    return [...projects].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [projects]);

  const handleDelete = async (projectId: Id<"projects">) => {
    try {
      await removeProject({ projectId });
    } catch (error) {
      console.error("Failed to delete project:", error);
      alert("Failed to delete project. Please try again.");
    }
  };

  const handleReorder = async (fromIndex: number, toIndex: number) => {
    if (!email || !projects || !privateUserData?.username) return;

    const newProjects = [...projects];
    const [movedItem] = newProjects.splice(fromIndex, 1);
    newProjects.splice(toIndex, 0, movedItem);

    const updates = newProjects.map((project, i) => ({
      projectId: project.id,
      order: i,
    }));

    await reorderProjects({
      email,
      updates,
    });
  };

  if ((!isLoaded && !isPublicView) || (!isPublicView && !privateUserData) || !sortedProjects) {
    return (
      <>
        <Title title="Projects" />
        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {[...Array(3)].map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      </>
    );
  }

  if (!isPublicView && !email) {
    return (
      <>
        <Title title="Projects" />
        <div className="mt-2 text-center text-gray-500">
          Please log in to view projects
        </div>
      </>
    );
  }

  if (!sortedProjects || sortedProjects.length === 0) {
    if (isPublicView) {
      return null;
    }
    return (
      <>
        <Title title="Projects" />
        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          <AddProjectCard />
        </div>
      </>
    );
  }

  return (
    <>
      <Title title="Projects" />
      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
        {sortedProjects.map((project: Project, index) => (
          <ProjectCard
            key={project.id}
            id={project.id}
            title={project.title}
            description={project.description}
            projectLink={project.projectLink}
            deployLink={project.deployLink}
            techStack={project.techStack}
            image={project.image || undefined}
            index={index}
            onReorder={!isPublicView ? handleReorder : undefined}
            onDelete={!isPublicView ? () => handleDelete(project.id) : undefined}
            isPublicView={isPublicView}
          />
        ))}
        {!isPublicView && <AddProjectCard />}
      </div>
    </>
  );
}
