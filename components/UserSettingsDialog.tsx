"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ImageSelector } from "./ImageSelector";
import { CheckCircle2, XCircle } from "lucide-react";

interface UserSettingsDialogProps {
    isOpen: boolean;
    onClose: (shouldOpen?: boolean) => void;
    defaultFirstName?: string;
    defaultLastName?: string;
}

export function UserSettingsDialog({ isOpen, onClose, defaultFirstName = "", defaultLastName = "" }: UserSettingsDialogProps) {
    const { user } = useUser();
    const [firstName, setFirstName] = useState(defaultFirstName);
    const [lastName, setLastName] = useState(defaultLastName);
    const [username, setUsername] = useState("");
    const [cgpa, setCgpa] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isValidatingUsername, setIsValidatingUsername] = useState(false);
    const [isUsernameValid, setIsUsernameValid] = useState<boolean | null>(null);
    const [image, setImage] = useState<string | null>(null);
    const [isUploadingMarksheet, setIsUploadingMarksheet] = useState(false);
    const [shouldAutoOpen, setShouldAutoOpen] = useState(false);

    const updateSettings = useMutation(api.users.updateUser);
    const generateMarksheetUrl = useMutation(api.users.generateMarksheetUploadUrl);
    const saveMarksheet = useMutation(api.users.saveMarksheetImage);

    // Get user data from database
    const userEmail = user?.primaryEmailAddress?.emailAddress;
    const userInfo = useQuery(
        api.users.getUser,
        userEmail ? { email: userEmail } : "skip"
    );

    // Check if we need to auto-open the dialog
    useEffect(() => {
        if (userInfo === undefined) return; // Still loading
        if (userEmail && !userInfo) {
            // No user data found, auto-open dialog
            setShouldAutoOpen(true);
            handleClose(); // Reset the dialog state
        }
    }, [userInfo, userEmail]);

    // Auto-open the dialog if needed
    useEffect(() => {
        if (shouldAutoOpen) {
            handleClose(); // Reset any existing state
            setTimeout(() => {
                setShouldAutoOpen(false);
                onClose(true); // Force open the dialog
            }, 100);
        }
    }, [shouldAutoOpen]);

    // Initialize data from database when component loads
    useEffect(() => {
        if (userInfo) {
            setFirstName(userInfo.firstName || defaultFirstName);
            setLastName(userInfo.lastName || defaultLastName);
            setUsername(userInfo.username || "");
            setCgpa(userInfo.cgpa?.toString() || "");
            // Set username as valid if it matches the current user's username
            setIsUsernameValid(!!userInfo.username);
        } else if (userEmail) {
            // If no user info exists yet, set defaults
            setUsername(userEmail);
            setFirstName(defaultFirstName);
            setLastName(defaultLastName);
            setIsUsernameValid(true); // Email is always a valid default username
        }
    }, [userInfo, userEmail, defaultFirstName, defaultLastName]);

    const checkUsername = useQuery(
        api.users.checkUsernameAvailable,
        username && username !== userEmail ? { username } : "skip"
    );

    const marksheetImage = useQuery(
        api.users.getMarksheetImage,
        userEmail ? { email: userEmail } : "skip"
    );

    useEffect(() => {
        if (username === userEmail) {
            setIsUsernameValid(true);
            setIsValidatingUsername(false);
            return;
        }

        if (username && checkUsername !== undefined) {
            setIsUsernameValid(checkUsername);
            setIsValidatingUsername(false);
        } else {
            setIsUsernameValid(null);
        }
    }, [username, checkUsername, userEmail]);

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setUsername(value);
        setIsValidatingUsername(true);
    };

    const handleMarksheetUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !userEmail) return;

        try {
            setIsUploadingMarksheet(true);
            const uploadUrl = await generateMarksheetUrl();
            const result = await fetch(uploadUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });

            if (!result.ok) {
                throw new Error(`Upload failed: ${result.statusText}`);
            }

            const { storageId } = await result.json();
            await saveMarksheet({
                email: userEmail,
                storageId
            });
        } catch (error) {
            console.error("Failed to upload marksheet:", error);
        } finally {
            setIsUploadingMarksheet(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userEmail || !isUsernameValid) return;

        setIsLoading(true);
        try {
            console.log("Updating user settings:", {
                email: userEmail,
                username,
                firstName,
                lastName,
                cgpa: cgpa ? parseFloat(cgpa) : undefined,
            });

            await updateSettings({
                email: userEmail,
                username,
                firstName: firstName || undefined,
                lastName: lastName || undefined,
                cgpa: cgpa ? parseFloat(cgpa) : undefined,
            });

            console.log("Settings updated successfully");
            onClose();
        } catch (error) {
            console.error("Error updating settings:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle click events for closing
    const handleClose = (e?: React.MouseEvent) => {
        if (e) e.preventDefault();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                onClick={handleClose}
            />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-auto">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-[500px] max-h-[90vh] flex flex-col">
                    <div className="p-6 border-b">
                        <h2 className="text-2xl font-bold text-primary-600">Profile Settings</h2>
                    </div>

                    <div className="p-6 overflow-y-auto">
                        <form id="settings-form" onSubmit={handleSubmit} className="space-y-3">
                            <div className="flex justify-center">
                                <ImageSelector
                                    image={image}
                                    onImageChange={setImage}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Username</label>
                                <div className="flex gap-1">
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={handleUsernameChange}
                                        className={`flex-1 px-3 py-2 border-2 rounded-md focus:outline-primary-500 ${isUsernameValid === false ? 'border-red-500' :
                                            isUsernameValid === true ? 'border-green-500' : ''
                                            }`}
                                        placeholder="Choose a username"
                                    />
                                    {isValidatingUsername ? (
                                        <div className="w-10 flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                                        </div>
                                    ) : username && (
                                        <div className="w-10 flex items-center justify-center">
                                            {isUsernameValid ? (
                                                <CheckCircle2 className="text-green-500 w-6 h-6" />
                                            ) : (
                                                <XCircle className="text-red-500 w-6 h-6" />
                                            )}
                                        </div>
                                    )}
                                </div>
                                {isUsernameValid === false && (
                                    <p className="text-red-500 text-sm mt-1">Username is already taken</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">First Name</label>
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md focus:outline-primary-500"
                                        placeholder="John"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Last Name</label>
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md focus:outline-primary-500"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">CGPA</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={cgpa}
                                        onChange={(e) => setCgpa(e.target.value)}
                                        className="flex-1 px-3 py-2 border rounded-md focus:outline-primary-500"
                                        placeholder="3.5"
                                        step="0.01"
                                        min="0"
                                        max="10"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Marksheet</label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        onChange={handleMarksheetUpload}
                                        className="hidden"
                                        id="marksheet-upload"
                                        accept="image/*,.pdf"
                                    />
                                    <label
                                        htmlFor="marksheet-upload"
                                        className={`px-4 py-2 rounded-md cursor-pointer inline-flex items-center gap-2 ${
                                            userInfo?.marksheetImage
                                                ? userInfo.isverified
                                                    ? 'bg-green-600 hover:bg-green-700'
                                                    : 'bg-gray-500 hover:bg-gray-600'
                                                : 'bg-primary-600 hover:bg-primary-700'
                                        } text-white`}
                                    >
                                        {isUploadingMarksheet ? (
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        ) : userInfo?.marksheetImage ? (
                                            <>
                                                {userInfo.isverified ? (
                                                    <>
                                                        <CheckCircle2 className="w-5 h-5" />
                                                        Verified
                                                    </>
                                                ) : (
                                                    'Uploaded'
                                                )}
                                            </>
                                        ) : (
                                            'Upload Marksheet'
                                        )}
                                    </label>
                                </div>
                                {userInfo?.marksheetImage && marksheetImage && (
                                    <div className="mt-2">
                                        <a
                                            href={marksheetImage}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary-600 hover:text-primary-700"
                                        >
                                            View Marksheet
                                        </a>
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="p-6 border-t">
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={handleClose}
                                className="px-4 py-2 border rounded-md hover:bg-gray-50"
                            >
                                Close
                            </button>
                            <button
                                form="settings-form"
                                type="submit"
                                disabled={isLoading || !isUsernameValid}
                                className={`px-4 py-2 rounded-md bg-primary-600 text-white ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-700'
                                    }`}
                            >
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
} 