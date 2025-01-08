"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { PencilIcon } from "lucide-react";
import { createPortal } from 'react-dom';

interface ImageSelectorProps {
  image: string | null;
  onImageChange: (image: string) => void;
}

export function ImageSelector({ image, onImageChange }: ImageSelectorProps) {
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 100,
    height: 100,
    x: 0,
    y: 0
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImage(reader.result as string);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const getCroppedImg = () => {
    if (!imageRef.current) return;

    const canvas = document.createElement('canvas');
    const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
    const scaleY = imageRef.current.naturalHeight / imageRef.current.height;
    canvas.width = crop.width!;
    canvas.height = crop.height!;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    ctx.drawImage(
      imageRef.current,
      crop.x! * scaleX,
      crop.y! * scaleY,
      crop.width! * scaleX,
      crop.height! * scaleY,
      0,
      0,
      crop.width!,
      crop.height!
    );

    const base64Image = canvas.toDataURL('image/jpeg');
    onImageChange(base64Image);
    setShowCropModal(false);
    setTempImage(null);
  };

  return (
    <>
      <div 
        className="relative cursor-pointer group"
        onClick={handleImageClick}
      >
        <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 transition-all duration-200 group-hover:border-blue-500">
          {image ? (
            <div className="relative w-full h-full">
              <Image
                src={image}
                alt="Profile"
                fill
                className="object-cover rounded-full"
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 group-hover:text-blue-500">
              <svg
                className="w-24 h-24"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
          )}
          
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-full transition-all duration-200 flex items-center justify-center">
            {image && (
              <span className="text-white opacity-0 group-hover:opacity-100 text-m flex flex-row">
                <PencilIcon className="w-6 h-6" />Edit
              </span>
            )}
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/*"
          className="hidden"
        />
      </div>

      {showCropModal && tempImage && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-[500px] max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b flex-shrink-0">
              <h3 className="text-lg font-semibold">Adjust Profile Picture</h3>
            </div>
            
            <div className="flex-1 p-4 overflow-auto flex items-center justify-center bg-gray-50">
              <div className="max-w-full max-h-full">
                <ReactCrop
                  crop={crop}
                  onChange={c => setCrop(c)}
                  aspect={1}
                  circularCrop
                >
                  <Image
                    ref={imageRef}
                    src={tempImage}
                    alt="Crop preview"
                    width={500}
                    height={500}
                    className="max-w-full max-h-[60vh] object-contain"
                    unoptimized
                  />
                </ReactCrop>
              </div>
            </div>

            <div className="p-4 border-t flex justify-end gap-2 bg-white flex-shrink-0">
              <button
                onClick={() => setShowCropModal(false)}
                className="px-6 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={getCroppedImg}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
} 