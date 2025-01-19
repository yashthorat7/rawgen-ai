"use client";

import { useState, KeyboardEvent } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { X, Plus, Upload } from "lucide-react";

interface AddProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddProjectDialog({ isOpen, onClose }: AddProjectDialogProps) {
  const { user } = useUser();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectLink, setProjectLink] = useState("");
  const [deployLink, setDeployLink] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [techStack, setTechStack] = useState<Set<string>>(new Set());
  const [techInput, setTechInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const addProject = useMutation(api.projects.add);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setProjectLink("");
    setDeployLink("");
    setImage(null);
    setPreviewUrl(null);
    setTechStack(new Set());
    setTechInput("");
    setIsLoading(false);
    setIsDragging(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleImageChange = (file: File | null) => {
    if (file) {
      setImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageChange(file);
    }
  };

  const handleAddTech = () => {
    if (!techInput.trim() || techStack.size >= 12) return;
    const formattedTech = techInput.trim().toLowerCase();
    setTechStack(prev => new Set([...prev, formattedTech]));
    setTechInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (techStack.size >= 12) {
      if (e.key === 'Enter' || e.key === ',') e.preventDefault();
      return;
    }
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTech();
    }
  };

  const handleRemoveTech = (techToRemove: string) => {
    const newTechStack = new Set(techStack);
    newTechStack.delete(techToRemove);
    setTechStack(newTechStack);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.emailAddresses[0]?.emailAddress) return;

    setIsLoading(true);
    try {
      await addProject({
        title,
        description,
        projectLink,
        deployLink,
        techStack: Array.from(techStack),
      });
      handleClose();
    } catch (error) {
      console.error("Failed to add project:", error);
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const techStackArray = Array.from(techStack);
  const isFormValid = 
    title.trim() !== "" && 
    description.trim() !== "" && 
    projectLink.trim() !== "" && 
    image !== null && 
    techStack.size >= 1 && 
    techStack.size <= 12;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={handleClose}
      />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-auto">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-[500px] max-h-[90vh] flex flex-col">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold text-primary-600">Add New Project</h2>
          </div>

          <div className="p-6 overflow-y-auto">
            <form id="project-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="flex justify-center">
                <div 
                  className={`relative w-full aspect-video rounded-lg border-2 ${
                    isDragging 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-dashed border-gray-300 hover:border-gray-400'
                  } transition-colors cursor-pointer overflow-hidden`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('project-image')?.click()}
                >
                  {previewUrl ? (
                    <img 
                      src={previewUrl} 
                      alt="Project preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                      <Upload className="w-8 h-8 mb-2" />
                      <p className="text-sm font-medium">Drop image here or click to upload</p>
                      <p className="text-xs mt-1">Supports JPG, PNG, GIF</p>
                    </div>
                  )}
                  <input
                    type="file"
                    id="project-image"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Project Name</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-primary-500"
                  placeholder="My Awesome Project"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Description <span className="text-gray-500">({description.length}/500)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                  className="w-full px-3 py-2 border rounded-md focus:outline-primary-500 min-h-[100px]"
                  placeholder="Describe your project..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Tech Stack <span className="text-gray-500">({techStack.size}/12)</span>
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={techInput}
                      onChange={(e) => setTechInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={techStack.size >= 12}
                      className="flex-1 px-3 py-2 border-2 rounded-md focus:outline-none focus:border-primary-600 disabled:bg-gray-100"
                      placeholder={techStack.size >= 12 ? "Max tech stack reached" : "React, Node.js, etc."}
                    />
                    <button
                      type="button"
                      onClick={handleAddTech}
                      disabled={!techInput.trim() || techStack.size >= 12}
                      className={`px-4 py-2 rounded-md text-white ${
                        !techInput.trim() || techStack.size >= 12
                          ? 'bg-primary-400 cursor-not-allowed'
                          : 'bg-primary-600 hover:bg-primary-700'
                      }`}
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {techStackArray.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {techStackArray.map((tech, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded-md"
                        >
                          <span>{tech}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTech(tech)}
                            className="p-0.5 hover:bg-primary-200 rounded-full"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Project Link</label>
                <input
                  type="url"
                  value={projectLink}
                  onChange={(e) => setProjectLink(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-primary-500"
                  placeholder="https://github.com/username/project"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Deploy Link</label>
                <input
                  type="url"
                  value={deployLink}
                  onChange={(e) => setDeployLink(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-primary-500"
                  placeholder="https://my-project.vercel.app"
                />
              </div>
            </form>
          </div>

          <div className="p-6 border-t">
            <div className="flex justify-end gap-2">
              <button
                onClick={handleClose}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                form="project-form"
                type="submit"
                disabled={isLoading || !isFormValid}
                className={`px-4 py-2 rounded-md text-white ${
                  isLoading || !isFormValid
                    ? 'bg-primary-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700'
                }`}
              >
                {isLoading ? 'Adding...' : 'Add Project'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 