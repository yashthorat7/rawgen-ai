"use client"

import { useState, useRef } from "react"
import { Transition } from "@headlessui/react"
import { usePlatforms } from "@/lib/PlatformContext"
import { validateLeetCodeProfile } from "@/lib/validators/leetcodeValidator"
import { validateGeeksForGeeksProfile } from "@/lib/validators/geeksforgeeksValidator"
import { validateCodeChefProfile } from "@/lib/validators/codechefValidator"
import { validateCodeforcesProfile } from "@/lib/validators/codeforcesValidator"
import { PlatformForm } from "./PlatformForm"

type PlatformOption = { value: string; label: string; };

export function AddPlatformDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { platforms, addPlatform } = usePlatforms()
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformOption | null>(null)
  const [username, setUsername] = useState("")
  const [platformError, setPlatformError] = useState("")
  const [usernameError, setUsernameError] = useState("")
  const [validationMessage, setValidationMessage] = useState("")
  const [isValidated, setIsValidated] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

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
    
    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal
    
    setIsValidating(true);
    let exists = false;

    try {
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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setPlatformError("")
    setUsernameError("")
    
    let hasError = false
    
    if (!selectedPlatform) {
      setPlatformError("Platform needed")
      hasError = true
    }
    
    if (!username.trim()) {
      setUsernameError("Username needed")
      hasError = true
    }
    
    if (hasError) return

    if (!isValidated) {
      await validateProfile()
      return
    }
    
    addPlatform(selectedPlatform!.value, username)
    handleClose()
  }

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    setUsernameError("");
    if (isValidated) {
      setIsValidated(false);
      setValidationMessage("");
    }
  };

  const handlePlatformChange = (option: PlatformOption | null) => {
    setSelectedPlatform(option);
    setPlatformError("");
    if (isValidated) {
      setIsValidated(false);
      setValidationMessage("");
    }
  };

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Transition
        show={open}
        enter="transition duration-300 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-200 ease-in"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
      >
        <div className="bg-white rounded-lg w-[400px] max-w-[90vw] shadow-lg border border-gray-200 transition-all duration-300 ease-in-out">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-primary-600 mb-2">Add Platform</h2>
            <PlatformForm
              selectedPlatform={selectedPlatform}
              username={username}
              platformError={platformError}
              usernameError={usernameError}
              validationMessage={validationMessage}
              isValidated={isValidated}
              isValidating={isValidating}
              onPlatformChange={handlePlatformChange}
              onUsernameChange={handleUsernameChange}
              onClose={handleClose}
              onSubmit={onSubmit}
            />
          </div>
        </div>
      </Transition>
    </div>
  )
}