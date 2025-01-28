import { Github, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t mt-auto select-none">
      <div className="w-[90%] mx-auto py-2">
        <div className="flex items-center justify-between text-sm text-gray-800">
          <div>
            Made by Group 10
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com/yashthorat7"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-700 transition-colors"
            >
              <Github className="w-5 h-5 sm:hidden" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <a 
              href="https://github.com/yashthorat7"
              className="hover:text-gray-700 transition-colors"
            >
              <Mail className="w-5 h-5 sm:hidden" />
              <span className="hidden sm:inline">Contact Us</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
} 