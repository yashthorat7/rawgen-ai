"use client";

import Select from "react-select";

export const platforms = [
  { value: 'leetcode', label: 'LeetCode' },
  { value: 'codechef', label: 'CodeChef' },
  { value: 'geeksforgeeks', label: 'GeeksForGeeks' },
  { value: 'codeforces', label: 'Codeforces' }
];

interface PlatformFormProps {
  selectedPlatform: typeof platforms[0] | null;
  username: string;
  platformError: string;
  usernameError: string;
  validationMessage: string;
  isValidated: boolean;
  isValidating: boolean;
  onPlatformChange: (option: typeof platforms[0] | null) => void;
  onUsernameChange: (username: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function PlatformForm({
  selectedPlatform,
  username,
  platformError,
  usernameError,
  validationMessage,
  isValidated,
  isValidating,
  onPlatformChange,
  onUsernameChange,
  onClose,
  onSubmit,
}: PlatformFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1">
          Platform
        </label>
        <Select
          value={selectedPlatform}
          onChange={(option) => onPlatformChange(option)}
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
          onChange={(e) => onUsernameChange(e.target.value)}
          placeholder="eg. indiragandhi"
          className={`w-full px-3 py-2 border rounded-md focus:outline-primary-500 focus:border-primary-500`}
        />
        {usernameError && (
          <p className="mt-1 text-xs text-red-500">{usernameError}</p>
        )}
        {validationMessage && (
          <p className={`mt-1 text-xs ${isValidated ? 'text-green-600' : 'text-red-500'}`}>
            {validationMessage}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border rounded-md"
        >
          Close
        </button>
        <button
          type="submit"
          disabled={isValidating}
          className="px-4 py-2 bg-primary-600 text-white rounded-md disabled:opacity-50"
        >
          {isValidating ? 'Validating...' : isValidated ? 'Add' : 'Validate'}
        </button>
      </div>
    </form>
  );
} 