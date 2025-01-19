"use client";

import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";

type Project = {
  id: string;
  title: string;
  description: string;
};

export function ProjectGrid() {
  const projects = useQuery(api.projects.get);
  const addProject = useMutation(api.projects.add);

  if (!projects) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="p-4 border rounded-lg animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const handleAddProject = () => {
    addProject({
      title: "New Project",
      description: "Project description",
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      <div className="p-4 h-12 border rounded-lg">
        <h3 className="font-semibold">Sample Project</h3>
        <p className="text-gray-600 mt-2">This is a sample project description.</p>
        <div className="mt-4 flex gap-2">
          <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-sm">React</span>
          <span className="px-2 py-1 bg-green-100 text-green-600 rounded text-sm">Node.js</span>
        </div>
        <div className="mt-4 flex justify-end">
          <button className="text-blue-500 hover:text-blue-600">View Details →</button>
        </div>
      </div>
      <button 
        onClick={handleAddProject}
        className="p-4 border rounded-lg text-center hover:bg-gray-50"
      >
        + Add Project
      </button>
    </div>
  );
}
