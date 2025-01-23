"use client";

import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { AddProjectCard } from "./AddProjectCard";
import { ProjectCard } from "./ProjectCard";
import { Id } from "@/convex/_generated/dataModel";
import { ProjectCardSkeleton } from "../platform-stats/LoadingSkeleton";

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

export function ProjectGrid() {
  const { user, isLoaded } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  const removeProject = useMutation(api.projects.remove);
  const reorderProjects = useMutation(api.projects.reorder);

  // First get user data from email
  const userData = useQuery(
    api.users.getUser,
    email ? { email } : "skip"
  );

  // Then use the username to get projects
  const projects = useQuery(
    api.projects.get,
    userData?.username ? { username: userData.username } : "skip"
  );

  const handleDelete = async (projectId: Id<"projects">) => {
    try {
      await removeProject({ projectId });
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  const handleReorder = async (fromIndex: number, toIndex: number) => {
    if (!email || !projects) return;

    // Create updates array with new order
    const newProjects = [...projects];
    const [movedItem] = newProjects.splice(fromIndex, 1);
    newProjects.splice(toIndex, 0, movedItem);

    // Update order in database
    const updates = newProjects.map((project, i) => ({
      projectId: project.id,
      order: i,
    }));

    await reorderProjects({
      email,
      updates,
    });
  };

  // Show loading state while user data is loading
  if (!isLoaded || !userData || projects === undefined) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-12">
        {[...Array(3)].map((_, i) => (
          <ProjectCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Show message if no user is logged in
  if (!email) {
    return (
      <div className="mt-12 text-center text-gray-500">
        Please log in to view projects
      </div>
    );
  }

  // Show message if no projects found
  if (projects.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-12">
        <AddProjectCard />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-12">
      {projects.map((project: Project, index) => (
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
          onReorder={handleReorder}
          onDelete={() => handleDelete(project.id)}
        />
      ))}
      <AddProjectCard />
    </div>
  );
}
