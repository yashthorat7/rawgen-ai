"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ImageSelector } from "./ImageSelector";
import { CheckCircle2, XCircle, Github, Linkedin, Twitter, Globe } from "lucide-react";
import { SocialLinks } from "@/lib/types";

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
    const [socialLinks, setSocialLinks] = useState<SocialLinks>({});

    const updateSettings = useMutation(api.users.updateUser);
    const updateCounters = useMutation(api.counters.update);
    const generateMarksheetUrl = useMutation(api.users.generateMarksheetUploadUrl);
    const saveMarksheet = useMutation(api.users.saveMarksheetImage);

    // Get user data from database
    const userEmail = user?.primaryEmailAddress?.emailAddress;
    const userInfo = useQuery(
        api.users.getUser,
        userEmail ? { email: userEmail } : "skip"
    );

    // Get counters data
    const counters = useQuery(
        api.counters.get,
        userInfo?._id ? { userId: userInfo._id } : "skip"
    );

    // Get marksheet image URL if it exists
    const marksheetImageUrl = useQuery(
        api.users.getMarksheetImageUrl,
        userInfo?.marksheetImage ? { storageId: userInfo.marksheetImage } : "skip"
    );

    // Initialize data from database when dialog opens
    useEffect(() => {
        if (!isOpen) return;

        if (userInfo) {
            setFirstName(userInfo.firstName || defaultFirstName);
            setLastName(userInfo.lastName || defaultLastName);
            setUsername(userInfo.username || "");
            setCgpa(userInfo.cgpa?.toString() || "");
            setIsUsernameValid(!!userInfo.username);
            
            // Parse social links from counters
            if (counters?.socialLinks) {
                try {
                    setSocialLinks(JSON.parse(counters.socialLinks));
                } catch (e) {
                    console.error('Error parsing social links:', e);
                    setSocialLinks({});
                }
            }
        } else if (userEmail) {
            setUsername(userEmail);
            setFirstName(defaultFirstName);
            setLastName(defaultLastName);
            setIsUsernameValid(true);
        }
    }, [userInfo, counters, isOpen, defaultFirstName, defaultLastName]);

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

    const checkUsername = useQuery(
        api.users.checkUsernameAvailable,
        username && username !== userEmail ? { username } : "skip"
    );

    useEffect(() => {
        if (username === userEmail) {
            setIsUsernameValid(true);
            setIsValidatingUsername(false);
            return;
        }

        // If the username hasn't changed from what's in the database, it's valid
        if (userInfo && username === userInfo.username) {
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
    }, [username, checkUsername, userEmail, userInfo]);

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setUsername(value);
        // Only validate if the username is different from both email and current username
        if (value !== userEmail && (!userInfo || value !== userInfo.username)) {
            setIsValidatingUsername(true);
        }
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
        if (!userEmail || isLoading || !isFormValid) return;

        setIsLoading(true);
        try {
            // First update user info and get the userId
            const userId = await updateSettings({
                email: userEmail,
                username,
                firstName,
                lastName,
                cgpa: cgpa ? parseFloat(cgpa) : undefined,
            });

            // Then update counters with the userId
            await updateCounters({
                userId,
                socialLinks: JSON.stringify(socialLinks),
            });

            handleClose();
        } catch (error) {
            console.error('Error updating settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Add handler for social link updates
    const handleSocialLinkChange = (platform: keyof SocialLinks, value: string) => {
        setSocialLinks(prev => ({
            ...prev,
            [platform]: value || undefined // Remove empty values
        }));
    };

    // Handle click events for closing
    const handleClose = (e?: React.MouseEvent) => {
        if (e) e.preventDefault();
        onClose();
    };

    const isFormValid = isUsernameValid && username.trim() !== "" && 
        firstName.trim() !== "" && lastName.trim() !== "";

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
                                {userInfo?.marksheetImage && marksheetImageUrl && (
                                    <div className="mt-2">
                                        <a
                                            href={marksheetImageUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary-600 hover:text-primary-700"
                                        >
                                            View Marksheet
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Social Links Section */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Social Links</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Github className="w-5 h-5 text-gray-500" />
                                        <input
                                            type="text"
                                            value={socialLinks.github || ''}
                                            onChange={(e) => handleSocialLinkChange('github', e.target.value)}
                                            placeholder="GitHub username"
                                            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Linkedin className="w-5 h-5 text-gray-500" />
                                        <input
                                            type="text"
                                            value={socialLinks.linkedin || ''}
                                            onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                                            placeholder="LinkedIn username"
                                            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Twitter className="w-5 h-5 text-gray-500" />
                                        <input
                                            type="text"
                                            value={socialLinks.twitter || ''}
                                            onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                                            placeholder="Twitter username"
                                            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Globe className="w-5 h-5 text-gray-500" />
                                        <input
                                            type="url"
                                            value={socialLinks.website || ''}
                                            onChange={(e) => handleSocialLinkChange('website', e.target.value)}
                                            placeholder="Personal website URL"
                                            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="p-6 border-t">
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={handleClose}
                                className="px-4 py-2 border rounded-md hover:bg-gray-50"
                            >
                                Close
                            </button>
                            <button
                                form="settings-form"
                                type="submit"
                                disabled={isLoading || !isFormValid}
                                className={`px-4 py-2 rounded-md text-white ${
                                    isLoading || !isFormValid
                                        ? 'bg-primary-400 cursor-not-allowed'
                                        : 'bg-primary-600 hover:bg-primary-700'
                                }`}
                            >
                                {isLoading ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
} 