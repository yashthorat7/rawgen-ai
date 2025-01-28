"use client";

interface TitleProps {
  title: string;
}

export function Title({ title }: TitleProps) {
  return (
    <div className="flex items-center justify-center gap-4 mb-4 mt-8 sm:mb-6 sm:mt-12 px-4 group">
      <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-gray-300 group-hover:to-pink-500 transition-all duration-300" />
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 group-hover:text-pink-600 transition-colors duration-300 whitespace-nowrap tracking-widest">
        {title.toUpperCase()}
      </h2>
      <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-gray-300 group-hover:to-pink-500 transition-all duration-300" />
    </div>
  );
} 