"use client";

import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { AddProjectCard } from "./AddProjectCard";
import { ProjectCard } from "./ProjectCard";
import { Id } from "@/convex/_generated/dataModel";

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

  // Show loading state while user data is loading
  if (!isLoaded || !userData || projects === undefined) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-12">
        {[...Array(1)].map((_, i) => (
          <ProjectCard
            key={i}
            title=""
            description=""
            projectLink=""
            techStack={[]}
            image={undefined}
            isLoading={true}
          />
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
      {projects.map((project: Project) => (
        <ProjectCard
          key={project.id}
          id={project.id}
          title={project.title}
          description={project.description}
          projectLink={project.projectLink}
          deployLink={project.deployLink}
          techStack={project.techStack}
          image={project.image}
          onDelete={handleDelete}
        />
      ))}
      <AddProjectCard />
    </div>
  );
}
