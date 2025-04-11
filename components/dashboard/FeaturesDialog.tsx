"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const features = [
  {
    image: "/features/page1.png"
  },
  {
    image: "/features/page2.png"
  },
  {
    image: "/features/page3.png"
  },
  {
    image: "/features/page4.png"
  }
];

interface FeaturesDialogProps {
  onClose: () => void;
  userEmail?: string;
}

export function FeaturesDialog({ onClose, userEmail }: FeaturesDialogProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const updateHasLearned = useMutation(api.users.updateHasLearned);

  const handleNext = () => {
    if (currentIndex < features.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      handleCompleteDialog();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleCompleteDialog = async () => {
    if (userEmail) {
      try {
        // Update user's haslearned status in the database
        await updateHasLearned({ email: userEmail });
      } catch (error) {
        console.error("Failed to update haslearned status:", error);
      }
    }
    
    // Close the dialog
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full overflow-hidden relative">
        {/* Close button */}
        <button
          onClick={handleCompleteDialog}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Content */}
        <div className="relative aspect-[16/9] w-full">
          <Image
            src={features[currentIndex].image}
            alt={`Feature ${currentIndex + 1}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px"
            className="object-contain"
            priority
          />
        </div>

        {/* Navigation */}
        <div className="p-2 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <Button
            onClick={handleNext}
            variant="default"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {currentIndex === features.length - 1 ? "Get Started" : "Next"}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 