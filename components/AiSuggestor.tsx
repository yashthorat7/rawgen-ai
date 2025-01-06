"use client";

export function AiSuggestor() {
  return (
    <div className="mt-5 mb-5">
      <label className="block w-full px-4 py-3 relative rounded-lg text-gray-500 cursor-text overflow-hidden z-0
                       before:absolute before:inset-0 before:rounded-lg before:content-[''] before:z-[1]
                       before:bg-[linear-gradient(var(--angle),#12c2e9,#c471ed,#f64f59)]
                       before:animate-[rotate_4s_linear_infinite]
                       after:absolute after:inset-[2px] after:rounded-lg after:bg-gray-50 after:z-[2]">
        <span className="relative z-[3]">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos. Lorem ipsum dolor sit amet consectetur adipisicing elit. Perspiciatis, voluptate.
        </span>
      </label>
    </div>
  );
} 