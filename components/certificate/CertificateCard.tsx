"use client";

import { Trash2 } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

interface CertificateCardProps {
  id?: Id<"certificates">;
  title: string;
  category: string;
  description: string;
  image?: string | null;
  isLoading?: boolean;
  onDelete?: (id: Id<"certificates">) => void;
}

export function CertificateCard({ 
  id,
  title, 
  category,
  description,
  image,
  isLoading,
  onDelete 
}: CertificateCardProps) {

  if (isLoading) {
    return (
      <div className="p-4 border rounded-lg animate-pulse bg-white">
        <div className="aspect-video bg-gray-200 rounded-lg mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (id && onDelete) {
      onDelete(id);
    }
  };

  // Function to truncate description to first sentence
  const truncateDescription = (text: string) => {
    const sentence = text.split(/[.!?]/)[0];
    return sentence + (text.length > sentence.length ? '...' : '');
  };

  return (
    <div className="group relative bg-white 
                    w-full overflow-hidden
                    shadow-[0_4px_8px_rgba(0,0,100,0.08)] transition-all duration-200 ease-in-out 
                    hover:shadow-[0_8px_12px_rgba(0,0,100,0.1)] hover:scale-[1.01] rounded-lg
                    border border-gray-100">
      {image && (
        <div className="aspect-video overflow-hidden p-0 sm:p-4">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover rounded-t-lg sm:rounded-lg border border-gray-100"
          />
        </div>
      )}
      
      <div className="p-4 pt-0">
        <div className="mb-2 mt-1">
          <h3 className="font-bold text-xl text-gray-900">
            {title}
          </h3>
          <span className="px-2 py-1 bg-primary-100 text-primary-600 rounded text-xs font-medium inline-block mt-2">
            {category}
          </span>
        </div>

        <p className="text-gray-600 text-sm truncate whitespace-nowrap overflow-hidden">
          {truncateDescription(description)}
        </p>

        {onDelete && (
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={handleDelete}
              className="p-2 hover:bg-red-50 rounded-full transition-colors"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 