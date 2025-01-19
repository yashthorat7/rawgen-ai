"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { AddProjectCard } from "./AddProjectCard";

type Project = {
  id: string;
  title: string;
  description: string;
  projectLink?: string;
  deployLink?: string;
  techStack: string[];
};

export function ProjectGrid() {
  const projects = useQuery(api.projects.get);

  if (!projects) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
        <div className="p-4 border rounded-lg animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-12">
      {projects.map((project: Project) => (
        <div key={project.id} className="p-4 border rounded-lg">
          <h3 className="font-semibold">{project.title}</h3>
          <p className="text-gray-600 mt-2">{project.description}</p>
          {project.techStack && project.techStack.length > 0 && (
            <div className="mt-4 flex gap-2 flex-wrap">
              {project.techStack.map((tech, i) => (
                <span key={i} className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-sm">
                  {tech}
                </span>
              ))}
            </div>
          )}
          <div className="mt-4 flex justify-end gap-4">
            {project.projectLink && (
              <a href={project.projectLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">
                View Code →
              </a>
            )}
            {project.deployLink && (
              <a href={project.deployLink} target="_blank" rel="noopener noreferrer" className="text-green-500 hover:text-green-600">
                Live Demo →
              </a>
            )}
          </div>
        </div>
      ))}
      <AddProjectCard />
    </div>
  );
}
