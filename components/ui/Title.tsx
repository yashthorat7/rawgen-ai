"use client";

interface TitleProps {
  title: string;
}

export function Title({ title }: TitleProps) {
  return (
    <div className="flex items-center justify-center gap-4 mb-4 mt-8 px-4">
      <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-gray-300" />
      <h2 className="text-2xl font-bold text-gray-800 whitespace-nowrap">
        {title}
      </h2>
      <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-gray-300" />
    </div>
  );
} 