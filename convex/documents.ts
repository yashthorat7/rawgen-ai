import { Doc, Id } from "./_generated/dataModel";

// Type for platform profiles
export interface ProfileDoc extends Doc<"profiles"> {
  email: string;
  username: string;
  platform: string;  // Required field
  order: number;     // Required field
}

// Type for user settings
export interface UserSettingsDoc extends Doc<"userSettings"> {
  email: string;
  profileImage?: Id<"_storage">;
}

// Rest of the code...