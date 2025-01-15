"use client"

import { useState, useRef } from "react"
import { usePlatforms } from "@/lib/PlatformContext"
import { validateLeetCodeProfile } from "@/lib/validators/leetcodeValidator"
import { validateGeeksForGeeksProfile } from "@/lib/validators/geeksforgeeksValidator"
import { validateCodeChefProfile } from "@/lib/validators/codechefValidator"
import { validateCodeforcesProfile } from "@/lib/validators/codeforcesValidator"
import { PlatformForm } from "./PlatformForm"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

type PlatformOption = { value: string; label: string; };

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
  const { platforms } = usePlatforms()
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformOption | null>(null)
  const [username, setUsername] = useState("")
  const [platformError, setPlatformError] = useState("")
  const [usernameError, setUsernameError] = useState("")
  const [validationMessage, setValidationMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isValidated, setIsValidated] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Query for existing profile
  const existingProfile = useQuery(
    api.profiles.checkProfileExists,
    selectedPlatform && username.trim()
      ? {
        platform: selectedPlatform.value,
        username: username.trim()
      }
      : "skip"
  )

  const checkIfUsernameExists = (platform: string, username: string) => {
    return platforms.some(p =>
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
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  const validateProfile = async () => {
    if (!selectedPlatform || !username.trim()) return;

    if (checkIfUsernameExists(selectedPlatform.value, username)) {
      setValidationMessage(`${username} is already added for ${selectedPlatform.label}`);
      setIsValidated(false);
      return;
    }

    // Check if profile exists in database
    if (existingProfile?.exists) {
      setValidationMessage(`${username} on ${selectedPlatform.label} is being used by ${existingProfile.email}`);
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
      // Validate against platform API
      switch (selectedPlatform.value) {
        case 'leetcode':
          exists = await validateLeetCodeProfile(username);
          break;
        case 'codechef':
          exists = await validateCodeChefProfile(username, signal);
          break;
        case 'geeksforgeeks':
          exists = await validateGeeksForGeeksProfile(username, signal);
          break;
        case 'codeforces':
          exists = await validateCodeforcesProfile(username, signal);
          break;
        default:
          exists = false;
      }

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

  const handleSubmit = async () => {
    if (selectedPlatform && username) {
      if (!isValidated) {
        setValidationMessage("Please validate the username first");
        return;
      }
      try {
        setSuccessMessage("");
        await onSubmit(selectedPlatform.value, username);
        setSuccessMessage(`Successfully added ${username} to ${selectedPlatform.label}`);
        // Close dialog after 1.5 seconds
        setTimeout(() => {
          handleClose();
        }, 1500);
      } catch (error) {
        setValidationMessage(error instanceof Error ? error.message : "Failed to add platform");
      }
    }
  };

  const handleValidate = async () => {
    if (selectedPlatform && username) {
      await validateProfile();
    }
  };

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    setUsernameError("");
    setSuccessMessage("");
    if (isValidated) {
      setIsValidated(false);
      setValidationMessage("");
    }
  };

  const handlePlatformChange = (option: PlatformOption | null) => {
    setSelectedPlatform(option);
    setPlatformError("");
    setSuccessMessage("");
    if (isValidated) {
      setIsValidated(false);
      setValidationMessage("");
    }
  };

  return (
    <PlatformForm
      isOpen={open}
      selectedPlatform={selectedPlatform}
      username={username}
      platformError={platformError}
      usernameError={usernameError}
      validationMessage={successMessage || validationMessage}
      isValidated={isValidated}
      isValidating={isValidating}
      isLoading={isLoading}
      onPlatformChange={handlePlatformChange}
      onUsernameChange={handleUsernameChange}
      onClose={handleClose}
      onSubmit={handleValidate}
      onAdd={handleSubmit}
    />
  );
}