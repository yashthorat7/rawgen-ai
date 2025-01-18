import { Doc, Id } from "./_generated/dataModel";

// Type for platform profiles
export interface ProfileDoc extends Doc<"profiles"> {
  username: string;
  platformName: string;
  platformUsername: string;
  platformCacheData?: string;
}

// Type for users
export interface UserDoc extends Doc<"users"> {
  email: string;
  username: string;
  profileImage?: Id<"_storage">;
  firstName?: string;
  lastName?: string;
  marksheetImage?: Id<"_storage">;
  isverified?: boolean;
  profileViews?: number;
  stars?: number;
  cgpa?: number;
}

// Type for skills
export interface SkillDoc extends Doc<"skills"> {
  username: string;
  category: string;
  skills: string[];
}

// Rest of the code...