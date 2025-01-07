"use client";

import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { ImageSelector } from "./ImageSelector";
import { PlatformCounter } from "./PlatformCounter";

export function Intro() {
  const { user } = useUser();
  const fullName = user?.fullName || "there";
  const [image, setImage] = useState<string | null>(null);

  return (
    <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-2 sm:gap-4 mb-2 sm:mb-4 -mt-4 sm:mt-1 px-8">
      <div className="text-center sm:text-left -mt-8 sm:mt-0">
        <h1 className="text-2xl sm:text-4xl font-bold -mb-4 sm:mb-0">
          Hi {fullName} 👋
        </h1>
        <p className="hidden sm:block text-gray-600">
          This is a summary of your coding journey...
        </p>
        <PlatformCounter />
      </div>

      <div className="scale-75 sm:scale-100">
        <ImageSelector 
          image={image}
          onImageChange={setImage}
        />
      </div>
    </div>
  );
} 