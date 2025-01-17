"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ImageSelector } from "./ImageSelector";
import { CheckCircle2, XCircle } from "lucide-react";

interface UserSettingsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    defaultFirstName?: string;
    defaultLastName?: string;
}

export function UserSettingsDialog({ isOpen, onClose, defaultFirstName = "", defaultLastName = "" }: UserSettingsDialogProps) {
    const { user } = useUser();
    const [firstName, setFirstName] = useState(defaultFirstName);
    const [lastName, setLastName] = useState(defaultLastName);
    const [username, setUsername] = useState("");
    const [description, setDescription] = useState("");
    const [cgpa, setCgpa] = useState("");
    const [skillInput, setSkillInput] = useState("");
    const [skills, setSkills] = useState<string[]>([]);
    const [hobbyInput, setHobbyInput] = useState("");
    const [hobbies, setHobbies] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isValidatingUsername, setIsValidatingUsername] = useState(false);
    const [isUsernameValid, setIsUsernameValid] = useState<boolean | null>(null);
    const [image, setImage] = useState<string | null>(null);
    const [isUploadingMarksheet, setIsUploadingMarksheet] = useState(false);

    const updateSettings = useMutation(api.profiles.updateUserSettings);
    const generateMarksheetUrl = useMutation(api.profiles.generateMarksheetUploadUrl);
    const saveMarksheet = useMutation(api.profiles.saveMarksheetImage);
    const userSettings = useQuery(
        api.profiles.getUserSettings,
        user?.primaryEmailAddress?.emailAddress
            ? { email: user.primaryEmailAddress.emailAddress }
            : "skip"
    );

    const checkUsername = useQuery(
        api.profiles.checkUsernameAvailable,
        username && username !== userSettings?.username
            ? { username }
            : "skip"
    );

    const marksheetImage = useQuery(
        api.profiles.getMarksheetImage,
        user?.primaryEmailAddress?.emailAddress
            ? { email: user.primaryEmailAddress.emailAddress }
            : "skip"
    );

    useEffect(() => {
        if (userSettings) {
            setFirstName(userSettings.firstName || defaultFirstName);
            setLastName(userSettings.lastName || defaultLastName);
            setUsername(userSettings.username || "");
            setDescription(userSettings.description || "");
            setCgpa(userSettings.cgpa?.toString() || "");
            setSkills(userSettings.skills || []);
            setHobbies(userSettings.hobbies || []);
        } else {
            setFirstName(defaultFirstName);
            setLastName(defaultLastName);
        }
    }, [userSettings, defaultFirstName, defaultLastName]);

    useEffect(() => {
        if (username === userSettings?.username) {
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
    }, [username, checkUsername, userSettings]);

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setUsername(value);
    };

    const handleMarksheetUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user?.primaryEmailAddress?.emailAddress) return;

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
                email: user.primaryEmailAddress.emailAddress,
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
        if (!user?.primaryEmailAddress?.emailAddress) return;
        if (username && !isUsernameValid) return;

        setIsLoading(true);
        try {
            await updateSettings({
                email: user.primaryEmailAddress.emailAddress,
                username: username || undefined,
                firstName: firstName || undefined,
                lastName: lastName || undefined,
                cgpa: cgpa ? parseFloat(cgpa) : undefined,
                skills: skills.length > 0 ? skills : undefined,
                hobbies: hobbies.length > 0 ? hobbies : undefined,
                description: description || undefined,
            });
            onClose();
        } catch (error) {
            console.error("Error updating settings:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                onClick={onClose}
            />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-auto">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-[500px] max-h-[90vh] flex flex-col">
                    <div className="p-6 border-b">
                        <h2 className="text-2xl font-bold text-primary-600">Profile Settings</h2>
                    </div>

                    <div className="p-6 overflow-y-auto">
                        <form id="settings-form" onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex justify-center">
                                <ImageSelector
                                    image={image}
                                    onImageChange={setImage}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Username</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={handleUsernameChange}
                                        className={`flex-1 px-3 py-2 border rounded-md focus:outline-primary-500 ${isUsernameValid === false ? 'border-red-500' :
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

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                            className={`px-4 py-2 rounded-md cursor-pointer inline-flex items-center ${userSettings?.marksheetImage
                                                ? 'bg-gray-500 hover:bg-gray-600'
                                                : 'bg-primary-600 hover:bg-primary-700'
                                                } text-white`}
                                        >
                                            {isUploadingMarksheet ? (
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            ) : userSettings?.marksheetImage ? (
                                                'Uploaded'
                                            ) : (
                                                'Verify'
                                            )}
                                        </label>
                                    </div>
                                </div>
                                {userSettings?.marksheetImage && (
                                    <div className="mt-2">
                                        <a
                                            href={marksheetImage || "#"}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-primary-600 hover:text-primary-700"
                                        >
                                            View uploaded marksheet
                                        </a>
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="p-6 border-t mt-auto">
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                onClick={handleSubmit}
                                disabled={isLoading || (!!username && !isUsernameValid)}
                                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                            >
                                {isLoading ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
} 