"use client";

import { X } from "lucide-react";
import { cn, useScrollLock } from "@/lib/utils";

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
  useScrollLock(true);
  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 overflow-auto">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-full md:max-w-[800px] lg:max-w-[1000px] max-h-[90vh] flex flex-col">
          <div className="p-4 sm:p-6 border-b flex justify-between items-center">
            <h2 className="text-xl sm:text-2xl font-bold text-primary-600">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 sm:p-6 overflow-y-auto">
            {image && (
              <div className="mb-4 sm:mb-6 overflow-hidden rounded-lg border border-gray-200">
                <img
                  src={image}
                  alt={title}
                  className="w-full h-full object-contain bg-gray-50 max-h-[70vh]"
                />
              </div>
            )}

            <div className="mb-4 sm:mb-6">
              <span className="px-3 py-1 bg-primary-100 text-primary-600 rounded-md text-sm font-medium">
                {category}
              </span>
            </div>

            {/* Description */}
            <p className="text-gray-600 whitespace-pre-wrap text-sm sm:text-base">
              {description}
            </p>
          </div>
        </div>
      </div>
    </>
  );
} 