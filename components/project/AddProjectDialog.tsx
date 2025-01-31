"use client";

import { useState, KeyboardEvent, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { X, Plus, Upload } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { cn, useScrollLock } from "@/lib/utils";

interface AddProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    id?: Id<"projects">;
    title: string;
    description: string;
    projectLink: string;
    deployLink?: string;
    techStack: string[];
    image?: string;
  };
  mode?: 'add' | 'edit';
}

const MAX_PROJECT_IMAGE_SIZE = 500 * 1024; // 500KB

export function AddProjectDialog({ isOpen, onClose, initialData, mode = 'add' }: AddProjectDialogProps) {
  useScrollLock(isOpen);
  const { user } = useUser();
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [projectLink, setProjectLink] = useState(initialData?.projectLink || "");
  const [deployLink, setDeployLink] = useState(initialData?.deployLink || "");
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.image || null);
  const [techStack, setTechStack] = useState<Set<string>>(new Set(initialData?.techStack || []));
  const [techInput, setTechInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const addProject = useMutation(api.projects.add);
  const updateProject = useMutation(api.projects.update);
  const generateUploadUrl = useMutation(api.projects.generateUploadUrl);
  const saveImage = useMutation(api.projects.saveImage);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setProjectLink(initialData.projectLink);
      setDeployLink(initialData.deployLink || "");
      setPreviewUrl(initialData.image || null);
      setTechStack(new Set(initialData.techStack));
    }
  }, [initialData]);

  const resetForm = () => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setProjectLink(initialData.projectLink);
      setDeployLink(initialData.deployLink || "");
      setImage(null);
      setPreviewUrl(initialData.image || null);
      setTechStack(new Set(initialData.techStack));
    } else {
      setTitle("");
      setDescription("");
      setProjectLink("");
      setDeployLink("");
      setImage(null);
      setPreviewUrl(null);
      setTechStack(new Set());
    }
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
      // Check file size
      if (file.size > MAX_PROJECT_IMAGE_SIZE) {
        alert(`File size must be less than ${MAX_PROJECT_IMAGE_SIZE / 1024}KB`);
        return;
      }

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
      // Check file size
      if (file.size > MAX_PROJECT_IMAGE_SIZE) {
        alert(`File size must be less than ${MAX_PROJECT_IMAGE_SIZE / 1024}KB`);
        return;
      }
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
    const email = user?.emailAddresses[0]?.emailAddress;
    if (!email) return;

    setIsLoading(true);
    try {
      let imageId = undefined;

      if (image) {
        // Get upload URL
        const uploadUrl = await generateUploadUrl();
        
        // Upload the image
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": image.type },
          body: image,
        });
        
        if (!result.ok) {
          throw new Error(`Upload failed: ${result.statusText}`);
        }

        const { storageId } = await result.json();
        imageId = storageId;

        // Save the image reference
        await saveImage({
          storageId: imageId
        });
      }

      if (mode === 'edit' && initialData?.id) {
        // Update existing project
        await updateProject({
          projectId: initialData.id,
          email,
          title,
          description,
          projectLink,
          deployLink: deployLink || undefined,
          techStack: JSON.stringify(Array.from(techStack)),
          projectImage: image ? imageId : undefined, // Only send imageId if new image uploaded
        });
      } else {
        // Create new project
        await addProject({
          email,
          title,
          description,
          projectLink,
          deployLink: deployLink || undefined,
          techStack: Array.from(techStack),
          projectImage: imageId,
        });
      }

      handleClose();
    } catch (error) {
      console.error(`Failed to ${mode} project:`, error);
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const techStackArray = Array.from(techStack);
  const isFormValid = 
    title.trim() !== "" && 
    description.trim() !== "" && 
    projectLink.trim() !== "" && 
    (image !== null || (initialData && previewUrl)) && // Allow existing image in edit mode
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
            <h2 className="text-2xl font-bold text-primary-600">
              {mode === 'edit' ? 'Edit Project' : 'Add New Project'}
            </h2>
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
                  Description <span className="text-gray-500">({description.length}/700)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 700))}
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
                {isLoading 
                  ? (mode === 'edit' ? 'Updating...' : 'Adding...') 
                  : (mode === 'edit' ? 'Update Project' : 'Add Project')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 