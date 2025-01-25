"use client"

import { useState, useRef } from "react"
import { usePlatforms } from "@/lib/PlatformContext"
import { validateProfile } from "@/lib/profileValidator"
import Select from "react-select";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useScrollLock } from "@/lib/utils";

type Platform = 'leetcode' | 'codechef' | 'geeksforgeeks' | 'codeforces';

interface PlatformOption {
  value: Platform;
  label: string;
}

export const platforms: PlatformOption[] = [
  { value: 'leetcode' as Platform, label: 'LeetCode' },
  { value: 'codechef' as Platform, label: 'CodeChef' },
  { value: 'geeksforgeeks' as Platform, label: 'GeeksForGeeks' },
  { value: 'codeforces' as Platform, label: 'Codeforces' }
];

interface AddPlatformDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (platform: string, username: string) => Promise<void>;
  isLoading: boolean;
}

export function AddPlatformDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading
}: AddPlatformDialogProps) {
  useScrollLock(open);
  const { platforms: existingPlatforms } = usePlatforms()
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformOption | null>(null)
  const [username, setUsername] = useState("")
  const [platformError, setPlatformError] = useState("")
  const [usernameError, setUsernameError] = useState("")
  const [validationMessage, setValidationMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isValidated, setIsValidated] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Add this to check for existing profiles
  const existingProfile = useQuery(
    api.users.checkProfileExists,
    selectedPlatform && username ? {
      platformName: selectedPlatform.value,
      platformUsername: username
    } : "skip"
  );

  const checkIfUsernameExists = (platform: string, username: string) => {
    return existingPlatforms.some(p =>
      p.platform === platform &&
      p.username.toLowerCase() === username.toLowerCase()
    );
  };

  const resetForm = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setSelectedPlatform(null)
    setUsername("")
    setPlatformError("")
    setUsernameError("")
    setValidationMessage("")
    setSuccessMessage("")
    setIsValidated(false)
    setIsValidating(false)
    setError(null)
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  const validateUserProfile = async () => {
    if (!selectedPlatform || !username.trim()) return;

    if (checkIfUsernameExists(selectedPlatform.value, username)) {
      setValidationMessage(`${username} is already added for ${selectedPlatform.label}`);
      setIsValidated(false);
      return;
    }

    // Check if profile exists in database
    if (existingProfile?.exists) {
      setValidationMessage(`${username} on ${selectedPlatform.label} already in use by ${existingProfile.username}`);
      setIsValidated(false);
      return;
    }

    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal

    setIsValidating(true);
    setValidationMessage("");
    setSuccessMessage("");
    let exists = false;

    try {
      exists = await validateProfile(selectedPlatform.value, username, signal);

      if (!signal.aborted) {
        setValidationMessage(
          exists
            ? `${username} exists on ${selectedPlatform.label}`
            : `${username} not found on ${selectedPlatform.label}`
        );
        setIsValidated(exists);
      }
    } catch {
      if (!signal.aborted) {
        setValidationMessage("Error validating profile");
        setIsValidated(false);
      }
    } finally {
      if (!signal.aborted) {
        setIsValidating(false);
      }
    }
  }

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

      await onSubmit(selectedPlatform.value, username);
      setSuccessMessage(`Successfully added ${username} to ${selectedPlatform.label}`);
      // Close dialog after 1.5 seconds
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to add platform");
    }
  };

  const handleUsernameKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedPlatform && username && !isValidating && !isValidated) {
        validateUserProfile();
      }
    }
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]"
        onClick={handleClose}
      />
      <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 overflow-auto">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-[400px] max-h-[90vh] flex flex-col">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold text-primary-600">Add Platform</h2>
          </div>

          <div className="p-6 overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium mb-1 -mt-2">
                  Platform
                </label>
                <div className="relative">
                  <Select
                    value={selectedPlatform}
                    onChange={(option) => {
                      setError(null);
                      setSelectedPlatform(option);
                    }}
                    options={platforms}
                    placeholder="Select a platform"
                    menuPortalTarget={document.body}
                    styles={{
                      control: (base) => ({
                        ...base,
                        backgroundColor: 'white',
                        borderColor: '#d1d5db',
                        borderRadius: '0.375rem',
                      }),
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999
                      })
                    }}
                  />
                </div>
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
                    setUsername(e.target.value);
                  }}
                  onKeyDown={handleUsernameKeyPress}
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
                {successMessage && (
                  <p className="mt-1 text-xs text-green-600">{successMessage}</p>
                )}
              </div>
            </form>
          </div>

          <div className="p-6 border-t z-50">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Close
              </button>
              {!isValidated ? (
                <button
                  type="button"
                  onClick={validateUserProfile}
                  disabled={!selectedPlatform || !username || isValidating}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isValidating ? 'Validating...' : 'Validate'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isLoading ? 'Adding...' : 'Add'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}