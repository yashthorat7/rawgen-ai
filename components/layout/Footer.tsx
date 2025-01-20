export function Footer() {
  return (
    <footer className="w-full border-t mt-auto">
      <div className="w-[90%] mx-auto py-2">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div>
            Made by Yash
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com/yashthorat7"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-700"
            >
              GitHub
            </a>
            <a 
              href="https://github.com/yashthorat7"
              className="hover:text-gray-700"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
} 