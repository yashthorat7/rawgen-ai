"use client";

import { useState } from "react";
import { extractGeeksForGeeksData } from "@/lib/extractors/geeksforgeeksExtractor";
import type { GeeksForGeeksData } from "@/lib/types";

export function Temp() {
  const [username, setUsername] = useState("");
  const [data, setData] = useState<GeeksForGeeksData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setLoading(true);
      try {
        const result = await extractGeeksForGeeksData(username);
        setData(result);
      } catch (error) {
        console.error('Error fetching data:', error);
        setData(null);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter GeeksForGeeks username"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-blue-300"
        >
          {loading ? 'Loading...' : 'Fetch Data'}
        </button>
      </form>
      
      {data && (
        <pre className="mt-8 p-4 bg-gray-50 rounded-lg overflow-auto text-sm">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
} 