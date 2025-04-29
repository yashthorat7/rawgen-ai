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
  stars?: string[];
  cgpa?: number;
}

// Type for skills
export interface SkillDoc extends Doc<"skills"> {
  username: string;
  category: string;
  skills: string[];
}

// Type for counters
export interface CounterDoc extends Doc<"counters"> {
  userId: Id<"users">;
  profileViews?: number;
  stars?: number;
  socialLinks?: string;
}

// Type for profiles
export interface ProfileDoc extends Doc<"profiles"> {
  userId: Id<"users">;
  platformName: string;
  platformUsername: string;
  platformCacheData?: string;
  order: number;
}

// Type for projects
export interface ProjectDoc extends Doc<"projects"> {
  userId: Id<"users">;
  order: number;
  projectName: string;
  projectDescription: string;
  projectLink: string;
  deployLink?: string;
  techStack: string;
  projectImage?: Id<"_storage">;
}

// Type for certificates
export interface CertificateDoc extends Doc<"certificates"> {
  userId: Id<"users">;
  order: number;
  certificateTitle: string;
  category: string;
  description: string;
  certificateImage?: Id<"_storage">;
}