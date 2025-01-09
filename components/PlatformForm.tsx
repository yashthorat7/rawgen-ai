"use client";

import { useState } from "react";
import Select from "react-select";
import { usePlatforms } from "@/lib/PlatformContext";

export const platforms = [
  { value: 'leetcode', label: 'LeetCode' },
  { value: 'codechef', label: 'CodeChef' },
  { value: 'geeksforgeeks', label: 'GeeksForGeeks' },
  { value: 'codeforces', label: 'Codeforces' }
];

interface PlatformFormProps {
  isOpen: boolean;
  selectedPlatform: typeof platforms[0] | null;
  username: string;
  platformError: string;
  usernameError: string;
  validationMessage: string;
  isValidated: boolean;
  isValidating: boolean;
  isLoading: boolean;
  onPlatformChange: (option: typeof platforms[0] | null) => void;
  onUsernameChange: (username: string) => void;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  onAdd: () => Promise<void>;
}

export function PlatformForm({
  isOpen,
  selectedPlatform,
  username,
  platformError,
  usernameError,
  validationMessage,
  isValidated,
  isValidating,
  isLoading,
  onPlatformChange,
  onUsernameChange,
  onClose,
  onSubmit,
  onAdd,
}: PlatformFormProps) {
  const { platforms: existingPlatforms } = usePlatforms();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!selectedPlatform || !username || !isValidated) return;

    try {
      // Only check for duplicate within the same platform
      const existingInSamePlatform = existingPlatforms?.find(
        p => p.platform === selectedPlatform.value && p.username === username
      );

      if (existingInSamePlatform) {
        setError(`Username ${username} already exists for ${selectedPlatform.value}`);
        return;
      }

      await onAdd();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add platform');
    }
  };

  return (
    <>
      {isOpen && (
        <>
          <div className="dialog-backdrop" onClick={onClose} />
          <div className="dialog-content">
            <div className="bg-white rounded-lg p-6 shadow-xl w-[400px] max-w-[90vw]">
              <h2 className="text-2xl font-bold text-primary-600 mb-4">Add Platform</h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Platform
                  </label>
                  <Select
                    value={selectedPlatform}
                    onChange={(option) => {
                      setError(null);
                      onPlatformChange(option);
                    }}
                    options={platforms}
                    placeholder="Select a platform"
                    styles={{
                      control: (base) => ({
                        ...base,
                        backgroundColor: 'white',
                        borderColor: '#d1d5db',
                        borderRadius: '0.375rem',
                      }),
                    }}
                  />
                  <div className="overflow-visible">
                    {platformError && <p className="text-red-500 text-sm">{platformError}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setError(null);
                      onUsernameChange(e.target.value);
                    }}
                    placeholder="eg. indiragandhi"
                    className="w-full px-3 py-2 border rounded-md focus:outline-primary-500 focus:border-primary-500"
                  />
                  {usernameError && (
                    <p className="mt-1 text-xs text-red-500">{usernameError}</p>
                  )}
                  {validationMessage && (
                    <p className={`mt-1 text-xs ${isValidated ? 'text-green-600' : 'text-red-500'}`}>
                      {validationMessage}
                    </p>
                  )}
                  {error && (
                    <p className="mt-1 text-xs text-red-500">{error}</p>
                  )}
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border rounded-md hover:bg-gray-50"
                  >
                    Close
                  </button>
                  {!isValidated ? (
                    <button
                      type="button"
                      onClick={() => onSubmit()}
                      disabled={!selectedPlatform || !username || isValidating}
                      className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {isValidating ? 'Validating...' : 'Validate'}
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {isLoading ? 'Adding...' : 'Add'}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
} 