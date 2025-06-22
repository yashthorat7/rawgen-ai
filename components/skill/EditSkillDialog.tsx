"use client";

import { useState, KeyboardEvent, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { X, Plus } from "lucide-react";
import { cn, useScrollLock } from "@/lib/utils";

interface EditSkillDialogProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  initialSkills: string[];
  onUpdate?: () => void;
}

export function EditSkillDialog({
  isOpen,
  onClose,
  category,
  initialSkills,
  onUpdate,
}: EditSkillDialogProps) {
  useScrollLock(isOpen);
  const { user, isLoaded: isUserLoaded } = useUser();
  const [skillInput, setSkillInput] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(
    new Set(initialSkills),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [categoryName, setCategoryName] = useState(category);

  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const userData = useQuery(
    api.users.getUser,
    userEmail ? { email: userEmail } : "skip",
  );
  const username = userData?.username;

  useEffect(() => {
    if (isOpen) {
      setSelectedSkills(
        new Set(initialSkills.map((s) => s.toLowerCase().trim())),
      );
      setSkillInput("");
      setIsLoading(false);
      setCategoryName(category);
    }
  }, [isOpen, initialSkills, category]);

  const updateSkills = useMutation(api.skills.update);
  const deleteCategory = useMutation(api.skills.deleteSkillCategory);

  const handleAddSkill = () => {
    if (!skillInput.trim() || selectedSkills.size >= 16) return;

    const formattedSkill = skillInput.trim().toLowerCase();

    setSelectedSkills((prev) => new Set([...prev, formattedSkill]));
    setSkillInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (selectedSkills.size >= 16) {
      if (e.key === "Enter" || e.key === ",") e.preventDefault();
      return;
    }

    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const newSkills = new Set(selectedSkills);
    newSkills.delete(skillToRemove);
    setSelectedSkills(newSkills);
  };

  const handleSubmit = async () => {
    if (!isUserLoaded || !userData) return;

    if (!userEmail || !username) return;

    setIsLoading(true);
    try {
      const skillsArray = Array.from(selectedSkills).sort();

      if (skillsArray.length === 0) {
        await deleteCategory({
          username,
          category: categoryName,
        });
      } else {
        await updateSkills({
          email: userEmail,
          oldCategory: category,
          newCategory: categoryName.trim(),
          skills: skillsArray,
        });
      }

      onUpdate?.();
      onClose();
    } catch (error) {
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (!isUserLoaded || !userData) return;

    if (!userEmail || !username) return;

    setIsLoading(true);
    try {
      await deleteCategory({
        username,
        category: categoryName,
      });
      onUpdate?.();
      onClose();
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setCategoryName(category);
    setSelectedSkills(new Set(initialSkills));
    setSkillInput("");
    setIsLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const skillsArray = Array.from(selectedSkills);

  const isDisabled = !isUserLoaded || !userData || isLoading;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]"
        onClick={handleClose}
      />
      <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 overflow-auto">
        <div
          className="bg-white rounded-lg shadow-xl w-full max-w-[500px] max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold text-primary-600">
              Edit Skills - {categoryName}
            </h2>
          </div>

          <div className="p-6 pt-4 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-primary-500"
                  placeholder="e.g., Programming Languages"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Skills{" "}
                  <span className="text-gray-500">
                    ({selectedSkills.size}/16)
                  </span>
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={selectedSkills.size >= 16 || isDisabled}
                      className="flex-1 px-3 py-2 border-2 rounded-md focus:outline-none focus:border-primary-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder={
                        selectedSkills.size >= 16
                          ? "Max skills reached"
                          : "Press enter or comma to add"
                      }
                    />
                    <button
                      onClick={handleAddSkill}
                      disabled={
                        !skillInput.trim() ||
                        selectedSkills.size >= 16 ||
                        isDisabled
                      }
                      className={`px-4 py-2 rounded-md text-white ${
                        !skillInput.trim() ||
                        selectedSkills.size >= 16 ||
                        isDisabled
                          ? "bg-primary-400 cursor-not-allowed"
                          : "bg-primary-600 hover:bg-primary-700"
                      }`}
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  {skillsArray.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {skillsArray.map((skill, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded-md"
                        >
                          <span>{skill}</span>
                          <button
                            onClick={() => handleRemoveSkill(skill)}
                            disabled={isDisabled}
                            className="p-0.5 hover:bg-primary-200 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={handleClose}
                  disabled={isDisabled}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={
                    isDisabled ||
                    !categoryName.trim() ||
                    selectedSkills.size === 0 ||
                    selectedSkills.size > 16
                  }
                  className={`px-4 py-2 rounded-md text-white ${
                    isDisabled ||
                    !categoryName.trim() ||
                    selectedSkills.size === 0 ||
                    selectedSkills.size > 16
                      ? "bg-primary-400 cursor-not-allowed"
                      : "bg-primary-600 hover:bg-primary-700"
                  }`}
                >
                  {isLoading ? "Updating..." : "Update"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
