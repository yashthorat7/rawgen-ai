"use client";

import { X } from "lucide-react";

interface InfoCertificateCardProps {
  title: string;
  category: string;
  description: string;
  image?: string | null;
  onClose: () => void;
}

export function InfoCertificateCard({
  title,
  category,
  description,
  image,
  onClose
}: InfoCertificateCardProps) {
  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 overflow-auto">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-[600px] max-h-[90vh] flex flex-col">
          {/* Header with integrated close button */}
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-2xl font-bold text-primary-600">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto">
            {image && (
              <div className="aspect-video mb-6 overflow-hidden rounded-lg border border-gray-200">
                <img
                  src={image}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Category Tag */}
            <div className="mb-6">
              <span className="px-3 py-1 bg-primary-100 text-primary-600 rounded-md text-sm font-medium">
                {category}
              </span>
            </div>

            {/* Description */}
            <p className="text-gray-600 whitespace-pre-wrap">
              {description}
            </p>
          </div>
        </div>
      </div>
    </>
  );
} 