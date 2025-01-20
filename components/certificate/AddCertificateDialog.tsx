"use client";

import { useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { X, Upload } from "lucide-react";
import Select from "react-select";

const CATEGORIES = [
  { value: "Internships", label: "Internships" },
  { value: "Competitions", label: "Competitions" },
  { value: "Courses", label: "Courses" }
] as const;

type CategoryOption = typeof CATEGORIES[number];

interface AddCertificateDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddCertificateDialog({ isOpen, onClose }: AddCertificateDialogProps) {
  const { user } = useUser();
  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryOption | null>(null);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const addCertificate = useMutation(api.certificates.add);
  const generateUploadUrl = useMutation(api.certificates.generateUploadUrl);
  const saveImage = useMutation(api.certificates.saveImage);

  const resetForm = () => {
    setTitle("");
    setSelectedCategory(null);
    setDescription("");
    setImage(null);
    setPreviewUrl(null);
    setIsLoading(false);
    setIsDragging(false);
    setImageError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateImageDimensions = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        const isValid = Math.abs(aspectRatio - 16/9) < 0.1; // Allow small deviation
        if (!isValid) {
          setImageError("Image must have a 16:9 aspect ratio");
        } else {
          setImageError(null);
        }
        resolve(isValid);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageChange = async (file: File | null) => {
    if (file) {
      const isValidDimensions = await validateImageDimensions(file);
      if (isValidDimensions) {
        setImage(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setImage(null);
        setPreviewUrl(null);
      }
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

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      await handleImageChange(file);
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 100) {
      setDescription(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || !user?.emailAddresses[0]?.emailAddress) return;

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

      // Create the certificate
      await addCertificate({
        email: user.emailAddresses[0].emailAddress,
        title: title.trim(),
        category: selectedCategory.value,
        description: description.trim(),
        certificateImage: imageId,
      });

      handleClose();
    } catch (error) {
      console.error("Failed to add certificate:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const isFormValid = title.trim() !== "" && 
                     selectedCategory !== null && 
                     description.trim() !== "";

  const selectStyles = {
    control: (base: any, state: { isFocused: boolean }) => ({
      ...base,
      backgroundColor: 'white',
      borderColor: state.isFocused ? '#6366f1' : '#d1d5db',
      borderWidth: '1px',
      borderRadius: '0.375rem',
      boxShadow: 'none',
      '&:hover': {
        borderColor: state.isFocused ? '#6366f1' : '#d1d5db'
      }
    }),
    menuPortal: (base: any) => ({
      ...base,
      zIndex: 9999
    })
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={handleClose}
      />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-auto">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-[500px] max-h-[90vh] flex flex-col">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold text-primary-600">Add New Certificate</h2>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-6">
            <div className="space-y-6">
              {/* Image Upload */}
              <div>
                <div
                  className={`relative border-2 border-dashed rounded-lg transition-colors
                            ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400'}
                            ${image ? 'aspect-video' : 'h-[200px]'}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {image ? (
                    <>
                      <img
                        src={previewUrl || ''}
                        alt="Preview"
                        className="w-full h-full object-contain rounded"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImage(null);
                          setPreviewUrl(null);
                          setImageError(null);
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-100 rounded-full text-red-600 hover:bg-red-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500">
                      <Upload className="w-8 h-8 mb-2" />
                      <p className="text-sm">Drag and drop an image, or click to select</p>
                      <p className="text-xs text-gray-400 mt-1">Image must be in 16:9 ratio</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  )}
                </div>
                {imageError && (
                  <p className="mt-1 text-sm text-red-500">{imageError}</p>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Certificate Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter certificate title"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Category
                </label>
                <Select
                  value={selectedCategory}
                  onChange={(option) => setSelectedCategory(option as CategoryOption)}
                  options={CATEGORIES}
                  placeholder="Select a category"
                  menuPortalTarget={document.body}
                  styles={selectStyles}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <div className="relative">
                  <textarea
                    value={description}
                    onChange={handleDescriptionChange}
                    rows={3}
                    maxLength={500}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter certificate description"
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                    {description.length}/500
                  </div>
                </div>
              </div>
            </div>
          </form>

          <div className="p-6 border-t">
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!isFormValid || isLoading}
                className={`px-4 py-2 rounded-md text-white ${
                  isLoading || !isFormValid
                    ? 'bg-primary-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700'
                }`}
              >
                {isLoading ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 