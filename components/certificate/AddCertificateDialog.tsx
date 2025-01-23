"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { X, Upload } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import Select from "react-select";

interface AddCertificateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    id?: Id<"certificates">;
    title: string;
    category: string;
    description: string;
    image?: string;
  };
  mode?: 'add' | 'edit';
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const CERTIFICATE_CATEGORIES = [
  "Internship",
  "Competition",
  "Course",
] as const;

// Add this type for categories
type CategoryOption = {
  value: string;
  label: string;
};

const categoryOptions: CategoryOption[] = [
  { value: "Internship", label: "Internship" },
  { value: "Competition", label: "Competition" },
  { value: "Course", label: "Course" },
];

export function AddCertificateDialog({ 
  isOpen, 
  onClose, 
  initialData,
  mode = 'add' 
}: AddCertificateDialogProps) {
  const { user } = useUser();
  const [title, setTitle] = useState(initialData?.title || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.image || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const addCertificate = useMutation(api.certificates.add);
  const updateCertificate = useMutation(api.certificates.update);
  const generateUploadUrl = useMutation(api.certificates.generateUploadUrl);
  const storeImage = useMutation(api.certificates.storeImage);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setCategory(initialData.category);
      setDescription(initialData.description);
      setPreviewUrl(initialData.image || null);
    }
  }, [initialData]);

  const handleClose = () => {
    setTitle("");
    setCategory("");
    setDescription("");
    setImage(null);
    setPreviewUrl(null);
    setIsLoading(false);
    setIsDragging(false);
    onClose();
  };

  const handleImageChange = (file: File | null) => {
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        alert("File size must be less than 10MB");
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert("File must be an image");
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

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        alert("File size must be less than 10MB");
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert("File must be an image");
        return;
      }
      setImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const isFormValid = title.trim() && category.trim() && description.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.primaryEmailAddress?.emailAddress || !isFormValid) return;

    setIsLoading(true);
    try {
      let certificateImage: Id<"_storage"> | undefined = undefined;

      if (image) {
        const uploadUrl = await generateUploadUrl();
        
        await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": image.type },
          body: image,
        });

        const storageId = uploadUrl.split('/').pop()?.split('?')[0];
        if (!storageId) throw new Error("Failed to get storage ID");

        await storeImage({ storageId: storageId as Id<"_storage"> });
        certificateImage = storageId as Id<"_storage">;
      }

      if (mode === 'edit' && initialData?.id) {
        await updateCertificate({
          certificateId: initialData.id,
          email: user.primaryEmailAddress.emailAddress,
          title,
          category,
          description,
          certificateImage,
        });
      } else {
        await addCertificate({
          email: user.primaryEmailAddress.emailAddress,
          title,
          category,
          description,
          certificateImage,
        });
      }

      handleClose();
    } catch (error) {
      console.error('Error saving certificate:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]" onClick={handleClose} />
      <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 overflow-auto">
        <div className="bg-white rounded-lg shadow-xl w-[500px] ">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'edit' ? 'Edit' : 'Add'}
            </h2>
            <button 
              onClick={handleClose}
              className="rounded-full p-2 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <form id="certificate-form" onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certificate Image
                </label>
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
                    onClick={() => document.getElementById('certificate-image')?.click()}
                  >
                    {previewUrl ? (
                      <img 
                        src={previewUrl} 
                        alt="Certificate preview" 
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
                      id="certificate-image"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
                    />
                  </div>
                </div>
              </div>

              {/* Title Input */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Enter certificate title"
                />
              </div>

              {/* Category Dropdown */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <Select
                  id="category"
                  value={categoryOptions.find(opt => opt.value === category)}
                  onChange={(newValue) => setCategory(newValue?.value || "")}
                  options={categoryOptions}
                  className="mt-1"
                  placeholder="Select a category"
                  isClearable
                  classNames={{
                    control: (state) => 
                      `border rounded-md ${
                        state.isFocused 
                          ? 'border-primary-500 ring-1 ring-primary-500' 
                          : 'border-gray-300'
                      }`,
                  }}
                />
              </div>

              {/* Description Input */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Enter certificate description"
                />
              </div>
            </div>
          </form>

          <div className="p-6 border-t">
            <div className="flex justify-end gap-2">
              <button
                onClick={handleClose}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                form="certificate-form"
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
                  : (mode === 'edit' ? 'Update' : 'Add')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 