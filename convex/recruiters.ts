import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { ConvexError } from "convex/values";
import { getUserByUsername } from "./users";
import { QueryCtx } from "./_generated/server";
import { FilterBuilder } from "convex/server";

// Password validation function
function isValidPassword(password: string) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
        return { isValid: false, message: "Password must be at least 8 characters long" };
    }
    if (!hasUpperCase || !hasLowerCase) {
        return { isValid: false, message: "Password must contain both uppercase and lowercase letters" };
    }
    if (!hasNumbers) {
        return { isValid: false, message: "Password must contain at least one number" };
    }
    if (!hasSpecialChar) {
        return { isValid: false, message: "Password must contain at least one special character" };
    }

    return { isValid: true, message: "" };
}

export const verify = mutation({
    args: {
        email: v.string(),
        password: v.string(),
    },
    handler: async (ctx, args) => {
        // First check if email exists
        const recruiter = await ctx.db
            .query("recruiters")
            .filter((q) => q.eq(q.field("email"), args.email))
            .first();

        if (!recruiter) {
            return { success: false, message: "Email not found" };
        }

        // Then check password
        if (recruiter.password !== args.password) {
            return { success: false, message: "Incorrect password" };
        }

        return { 
            success: true, 
            data: recruiter,
            message: "Login successful" 
        };
    },
});

export const getByEmail = query({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const recruiter = await ctx.db
            .query("recruiters")
            .filter((q) => q.eq(q.field("email"), args.email))
            .first();
        return recruiter;
    },
});

export const create = mutation({
    args: {
        email: v.string(),
        firstName: v.string(),
        lastName: v.string(),
        password: v.string(),
        markstar: v.array(v.string()),
        isPermitted: v.boolean(),
        recruiterImage: v.optional(v.union(v.string(), v.null())),
    },
    handler: async (ctx, args) => {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(args.email)) {
            return { success: false, message: "Invalid email format" };
        }

        // Validate password
        const passwordValidation = isValidPassword(args.password);
        if (!passwordValidation.isValid) {
            return { success: false, message: passwordValidation.message };
        }

        // Check if recruiter already exists
        const existing = await ctx.db
            .query("recruiters")
            .filter((q) => q.eq(q.field("email"), args.email))
            .first();

        if (existing) {
            return { success: false, message: "Email already registered" };
        }

        try {
            // Create new recruiter
            const recruiterId = await ctx.db.insert("recruiters", {
                email: args.email,
                firstName: args.firstName,
                lastName: args.lastName,
                password: args.password,
                markstar: args.markstar,
                isPermitted: args.isPermitted,
                ...(args.recruiterImage && { recruiterImage: args.recruiterImage as Id<"_storage"> }),
            });

            return { 
                success: true, 
                data: recruiterId,
                message: "Registration successful" 
            };
        } catch (error) {
            return { 
                success: false, 
                message: "Failed to create account. Please try again." 
            };
        }
    },
});

// Helper function to get all user data
async function getAllUserData(ctx: QueryCtx, username: string) {
  const user = await getUserByUsername(ctx, { username });
  if (!user) return null;

  const userId = user._id;

  // Get skills
  const skills = await ctx.db
    .query("skills")
    .filter(q => q.eq(q.field("userId"), userId))
    .collect();

  // Get projects
  const projects = await ctx.db
    .query("projects")
    .filter(q => q.eq(q.field("userId"), userId))
    .collect();

  // Get profiles
  const profiles = await ctx.db
    .query("profiles")
    .filter(q => q.eq(q.field("userId"), userId))
    .collect();

  // Get certificates
  const certificates = await ctx.db
    .query("certificates")
    .filter(q => q.eq(q.field("userId"), userId))
    .collect();

  // Get stars
  const stars = user.madeStars?.length || 0;

  return {
    skills,
    projects,
    profiles,
    certificates,
    stars
  };
}

interface PlatformData {
  rank?: number;
  [key: string]: any;
}

interface UserWithData {
  _id: Id<"users">;
  _creationTime: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isverified?: boolean;
  skillCount: number;
  projectCount: number;
  platformCount: number;
  certificateCount: number;
  starCount: number;
  // Tab-specific data
  skillCategory?: string;
  skills?: any[];
  projectId?: Id<"projects">;
  projectTitle?: string;
  projectDescription?: string;
  projectLink?: string;
  deployLink?: string;
  techStack?: string;
  projectImageUrl?: string;
  platform?: string;
  platformUsername?: string;
  platformData?: PlatformData;
  certificateId?: Id<"certificates">;
  certificateTitle?: string;
  certificateCategory?: string;
  certificateDescription?: string;
  certificateImageUrl?: string;
  isMarked: boolean;
}

// Helper function to format platform data based on platform type
function formatPlatformData(platform: string, profile: any, skills: any[]) {
  if (!profile) return null;

  // Parse statsData (small JSON containing only essential metrics)
  let stats: Record<string, any> = {};
  try {
    if (profile.statsData) {
      stats = JSON.parse(profile.statsData);
    }
  } catch (e) {
    console.error('Error parsing statsData:', e);
    return null;
  }

  // Format skills array
  const formattedSkills = skills.reduce((acc: string[], skill: any) => {
    try {
      const skillData = JSON.parse(skill.skillsData);
      return acc.concat(Array.isArray(skillData) ? skillData : []);
    } catch (e) {
      return acc;
    }
  }, []);

  switch (platform.toLowerCase()) {
    case 'leetcode':
      return {
        totalSolved: stats.totalSolved || 0,
        easySolved: stats.easySolved || 0,
        mediumSolved: stats.mediumSolved || 0,
        hardSolved: stats.hardSolved || 0,
        totalEasy: stats.totalEasy || 0,
        totalMedium: stats.totalMedium || 0,
        totalHard: stats.totalHard || 0,
        ranking: stats.ranking || 0,
        rank: stats.ranking || 0,
        skills: formattedSkills
      };
    case 'codechef':
      return {
        currentRating: stats.currentRating || 0,
        highestRating: stats.highestRating || 0,
        globalRank: stats.globalRank || 0,
        countryRank: stats.countryRank || 0,
        stars: stats.stars || 0,
        rank: stats.globalRank || 0,
        countryName: stats.countryName || '',
        totalContests: stats.totalContests || 0,
        skills: formattedSkills
      };
    case 'geeksforgeeks':
      return {
        codingScore: stats.codingScore || 0,
        problemsSolved: stats.problemsSolved || 0,
        monthlyCoding: stats.currentStreak || 0,
        currentStreak: stats.currentStreak || 0,
        rank: stats.rank || 0,
        easyProblems: stats.easyProblems || 0,
        mediumProblems: stats.mediumProblems || 0,
        hardProblems: stats.hardProblems || 0,
        skills: formattedSkills
      };
    case 'codeforces':
      return {
        rating: stats.rating || 0,
        maxRating: stats.maxRating || 0,
        rank: stats.rank || 0,
        maxRank: stats.maxRank || 0,
        contribution: stats.contribution || 0,
        friendOfCount: stats.friendOfCount || 0,
        skills: formattedSkills
      };
    default:
      return {
        ...stats,
        skills: formattedSkills
      };
  }
}

// Update the SearchFilters type
export type SearchFilters = {
  verified: boolean;
  sortBy: "recent" | "stars" | "projects" | "skills" | "platforms" | "certificates";
  tab: "users" | "platforms" | "skills" | "projects" | "certificates";
  platforms?: {
    leetcode: boolean;
    codechef: boolean;
    codeforces: boolean;
    geeksforgeeks: boolean;
  };
  searchTerms?: string[];
  techStack?: string[];
  hasDeployment?: boolean;
  categories?: string[];
};

export const searchUsers = query({
  args: {
    query: v.string(),
    filters: v.object({
      verified: v.boolean(),
      sortBy: v.union(
        v.literal("recent"),
        v.literal("stars"),
        v.literal("projects"),
        v.literal("skills"),
        v.literal("platforms"),
        v.literal("certificates")
      ),
      tab: v.union(
        v.literal("users"),
        v.literal("platforms"),
        v.literal("skills"),
        v.literal("projects"),
        v.literal("certificates")
      ),
      platformFilters: v.optional(v.object({
        leetcode: v.optional(v.boolean()),
        codechef: v.optional(v.boolean()),
        codeforces: v.optional(v.boolean()),
        geeksforgeeks: v.optional(v.boolean())
      })),
      skillFilters: v.optional(v.object({
        searchTerms: v.array(v.string()),
        categories: v.optional(v.array(v.string())),
        minSkills: v.optional(v.number()),
        maxSkills: v.optional(v.number())
      })),
      projectFilters: v.optional(v.object({
        hasDeployment: v.optional(v.boolean()),
        hasImage: v.optional(v.boolean()),
        techStack: v.optional(v.array(v.string())),
        minTechStack: v.optional(v.number()),
        projectNameSearch: v.optional(v.string())
      })),
      certificateFilters: v.optional(v.object({
        categories: v.optional(v.array(v.string())),
        hasImage: v.optional(v.boolean()),
        dateRange: v.optional(v.object({
          start: v.optional(v.string()),
          end: v.optional(v.string())
        })),
        certificateSearch: v.optional(v.string())
      })),
      userFilters: v.optional(v.object({
        hasProfileImage: v.optional(v.boolean()),
        isVerified: v.optional(v.boolean()),
        minStars: v.optional(v.number()),
        minProjects: v.optional(v.number()),
        minSkills: v.optional(v.number()),
        minPlatforms: v.optional(v.number()),
        minCertificates: v.optional(v.number())
      })),
    }),
    page: v.number(),
    pageSize: v.number(),
    recruiterEmail: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const { query, filters, page, pageSize, recruiterEmail } = args;
    const { 
      verified, 
      sortBy, 
      tab, 
      platformFilters, 
      skillFilters,
      projectFilters,
      certificateFilters,
      userFilters
    } = filters;

    // Get recruiter's markstar list if recruiterEmail is provided
    let markedEmails: string[] = [];
    if (recruiterEmail) {
      const recruiter = await ctx.db
        .query("recruiters")
        .filter(q => q.eq(q.field("email"), recruiterEmail))
        .first();
      markedEmails = recruiter?.markstar || [];
    }

    // Get all users first
    let users = await ctx.db
      .query("users")
      .collect();

    // Filter by search query if provided
    if (query) {
      users = users.filter(user => {
        const searchStr = `${user.username} ${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
        return searchStr.includes(query.toLowerCase());
      });
    }

    // Filter by verified status if required
    if (verified) {
      users = users.filter(user => user.isverified);
    }

    // Get additional data for each user and add isMarked status
    const usersWithData = await Promise.all(
      users.map(async user => {
        const userData = await getAllUserData(ctx, user.username);
        if (!userData) return null;

        // Add isMarked status to user data
        const isMarked = markedEmails.includes(user.email);

        // Base user data
        const baseUser = {
          ...user,
          isMarked: isMarked,
          skillCount: userData.skills?.length || 0,
          projectCount: userData.projects?.length || 0,
          platformCount: userData.profiles?.length || 0,
          certificateCount: userData.certificates?.length || 0,
          starCount: userData.stars || 0
        };

        // Apply user-specific filters
        if (tab === "users" && userFilters) {
          if (userFilters.hasProfileImage && !user.profileImage) return null;
          if (userFilters.isVerified && !user.isverified) return null;
          if (userFilters.minStars && baseUser.starCount < userFilters.minStars) return null;
          if (userFilters.minProjects && baseUser.projectCount < userFilters.minProjects) return null;
          if (userFilters.minSkills && baseUser.skillCount < userFilters.minSkills) return null;
          if (userFilters.minPlatforms && baseUser.platformCount < userFilters.minPlatforms) return null;
          if (userFilters.minCertificates && baseUser.certificateCount < userFilters.minCertificates) return null;
        }

        // Add tab-specific data
        switch (tab) {
          case "skills":
            // Return all skills for the user
            const userSkills = userData.skills || [];
            if (!userSkills.length) return null;

            // Create an array of skill entries with ALL skills
            const skillEntries = userSkills.map(skill => {
              let skillsData: string[] = [];
              try {
                const parsedData = JSON.parse(skill.skillsData);
                skillsData = Object.keys(parsedData.skills || {});
              } catch (e) {
                skillsData = [];
              }

              return {
                ...baseUser,
                email: user.email,
                isMarked,
                skillCategory: skill.category,
                skills: skillsData
              };
            });

            return skillEntries;

          case "projects":
            // Return all projects for the user
            const userProjects = userData.projects || [];
            if (!userProjects.length) return null;

            // Create an array of project entries with ALL projects
            const projectEntries = await Promise.all(userProjects.map(async project => {
              let projectImageUrl;
              if (project.projectImage) {
                projectImageUrl = await ctx.storage.getUrl(project.projectImage);
              }
              
              return {
                ...baseUser,
                email: user.email,
                isMarked,
                projectId: project._id,
                projectTitle: project.projectName,
                projectDescription: project.projectDescription,
                projectLink: project.projectLink,
                deployLink: project.deployLink,
                techStack: project.techStack,
                projectImageUrl
              };
            }));

            return projectEntries;

          case "certificates":
            // Return all certificates for the user
            const userCerts = userData.certificates || [];
            if (!userCerts.length) return null;

            // Create an array of certificate entries with ALL certificates
            const certEntries = await Promise.all(userCerts.map(async cert => {
              let certificateImageUrl;
              if (cert.certificateImage) {
                certificateImageUrl = await ctx.storage.getUrl(cert.certificateImage);
              }
              
              return {
                ...baseUser,
                email: user.email,
                isMarked,
                certificateId: cert._id,
                certificateTitle: cert.certificateTitle,
                certificateCategory: cert.category,
                certificateDescription: cert.description,
                certificateImageUrl
              };
            }));

            return certEntries;

          case "platforms":
            const profile = userData.profiles?.[0];
            if (!profile) return baseUser;

            // Get user's skills
            const platformUserSkills = userData.skills || [];

            // Parse platform data
            let platformData = null;
            try {
              platformData = formatPlatformData(profile.platformName.toLowerCase(), profile, []);
            } catch (e) {
              console.error('Error parsing platform data:', e);
              return null;
            }

            // Calculate normalized rank based on platform type
            let normalizedRank = 0;
            try {
              const platform = profile.platformName.toLowerCase();
              
              // Parse statsData
              let stats: Record<string, any> = {};
              try {
                if (profile.statsData) {
                  stats = JSON.parse(profile.statsData);
                }
              } catch (e) {
                console.error('Error parsing statsData for rank calculation:', e);
                return null;
              }
              
              switch (platform) {
                case 'leetcode':
                  // Lower ranking is better
                  normalizedRank = stats.ranking || Infinity;
                  platformData = {
                    ...platformData,
                    normalizedRank,
                    displayMetric: `Rank: ${normalizedRank}`
                  };
                  break;
                case 'codechef':
                  // Higher rating is better, invert for consistent sorting
                  normalizedRank = -(stats.currentRating || 0);
                  platformData = {
                    ...platformData,
                    normalizedRank,
                    displayMetric: `Rating: ${-normalizedRank}`
                  };
                  break;
                case 'codeforces':
                  // Higher rating is better, invert for consistent sorting
                  normalizedRank = -(stats.rating || 0);
                  platformData = {
                    ...platformData,
                    normalizedRank,
                    displayMetric: `Rating: ${-normalizedRank}`
                  };
                  break;
                case 'geeksforgeeks':
                  // Higher coding score is better, invert for consistent sorting
                  normalizedRank = -(stats.codingScore || 0);
                  platformData = {
                    ...platformData,
                    normalizedRank,
                    displayMetric: `Score: ${-normalizedRank}`
                  };
                  break;
              }
            } catch (e) {
              console.error('Error calculating normalized rank:', e);
              return null;
            }

            // Apply platform filters
            if (platformFilters) {
              const platform = profile.platformName.toLowerCase();
              
              // Filter by platform type
              const { leetcode, codechef, codeforces, geeksforgeeks } = platformFilters;
              const shouldShow = (
                (!leetcode && !codechef && !codeforces && !geeksforgeeks) || // Show all if none selected
                (leetcode && platform === "leetcode") ||
                (codechef && platform === "codechef") ||
                (codeforces && platform === "codeforces") ||
                (geeksforgeeks && platform === "geeksforgeeks")
              );
              
              if (!shouldShow) return null;
            }

            // Apply search query
            if (query) {
              const searchLower = query.toLowerCase();
              const matchesUsername = profile.platformUsername.toLowerCase().includes(searchLower);
              const matchesPlatform = profile.platformName.toLowerCase().includes(searchLower);

              if (!matchesUsername && !matchesPlatform) return null;
            }

            return {
              _id: profile._id,
              _creationTime: profile._creationTime,
              platform: profile.platformName,
              platformUsername: profile.platformUsername,
              platformData: {
                ...platformData,
                normalizedRank
              },
              userId: profile.userId,
              username: user.username,
              email: user.email,
              isMarked,
            };

          default:
            return baseUser;
        }
      })
    );

    // Filter out null values and sort users
    const filteredUsers = usersWithData.filter((user): user is UserWithData => user !== null);
    let sortedUsers = [...filteredUsers];

    // Sort users based on selected option
    switch (sortBy) {
      case "stars":
        sortedUsers.sort((a, b) => (b.starCount || 0) - (a.starCount || 0));
        break;
      case "projects":
        sortedUsers.sort((a, b) => (b.projectCount || 0) - (a.projectCount || 0));
        break;
      case "skills":
        sortedUsers.sort((a, b) => (b.skillCount || 0) - (a.skillCount || 0));
        break;
      case "platforms":
        sortedUsers.sort((a, b) => (b.platformCount || 0) - (a.platformCount || 0));
        break;
      case "certificates":
        sortedUsers.sort((a, b) => (b.certificateCount || 0) - (a.certificateCount || 0));
        break;
      case "recent":
      default:
        sortedUsers.sort((a, b) => {
          const dateA = new Date(a._creationTime || 0);
          const dateB = new Date(b._creationTime || 0);
          return dateB.getTime() - dateA.getTime();
        });
    }

    // Handle different tabs
    if (tab === "skills") {
      // Get all skills from all users
      const allSkills = await ctx.db
        .query("skills")
        .collect();

      // Process all skills
      const results = await Promise.all(allSkills.map(async skill => {
        // Get user data
        const user = await ctx.db.get(skill.userId);
        if (!user || (verified && !user.isverified)) return null;

        // Check if user is marked
        const isMarked = markedEmails.includes(user.email);

        let skillsData: string[] = [];
        try {
          const parsedData = JSON.parse(skill.skillsData);
          skillsData = Object.keys(parsedData.skills || {});
        } catch (e) {
          skillsData = [];
        }

        return {
          _id: skill._id,
          _creationTime: skill._creationTime,
          email: user.email,
          username: user.username,
          isMarked,
          skillCategory: skill.category,
          skills: skillsData
        };
      }));

      // Filter out null results
      let filteredResults = results.filter((result): result is NonNullable<typeof result> => result !== null);

      // Sort by creation time (most recent first)
      filteredResults.sort((a, b) => b._creationTime - a._creationTime);

      // Apply pagination
      const paginatedResults = filteredResults.slice(
        (page - 1) * pageSize,
        page * pageSize
      );

      return {
        users: paginatedResults,
        total: filteredResults.length
      };
    }

    if (tab === "projects") {
      // Get all projects from all users
      const allProjects = await ctx.db
        .query("projects")
        .collect();

      // Process all projects
      const results = await Promise.all(allProjects.map(async project => {
        // Get user data
        const user = await ctx.db.get(project.userId);
        if (!user || (verified && !user.isverified)) return null;

        // Check if user is marked
        const isMarked = markedEmails.includes(user.email);

        let projectImageUrl;
        if (project.projectImage) {
          projectImageUrl = await ctx.storage.getUrl(project.projectImage);
        }

        return {
          _id: project._id,
          _creationTime: project._creationTime,
          email: user.email,
          username: user.username,
          isMarked,
          projectId: project._id,
          projectTitle: project.projectName,
          projectDescription: project.projectDescription,
          projectLink: project.projectLink,
          deployLink: project.deployLink,
          techStack: project.techStack,
          projectImageUrl
        };
      }));

      // Filter out null results
      let filteredResults = results.filter((result): result is NonNullable<typeof result> => result !== null);

      // Sort by creation time (most recent first)
      filteredResults.sort((a, b) => b._creationTime - a._creationTime);

      // Apply pagination
      const paginatedResults = filteredResults.slice(
        (page - 1) * pageSize,
        page * pageSize
      );

      return {
        users: paginatedResults,
        total: filteredResults.length
      };
    }

    if (tab === "certificates") {
      // Get all certificates from all users
      const allCertificates = await ctx.db
        .query("certificates")
        .collect();

      // Process all certificates
      const results = await Promise.all(allCertificates.map(async cert => {
        // Get user data
        const user = await ctx.db.get(cert.userId);
        if (!user || (verified && !user.isverified)) return null;

        // Check if user is marked
        const isMarked = markedEmails.includes(user.email);

        let certificateImageUrl;
        if (cert.certificateImage) {
          certificateImageUrl = await ctx.storage.getUrl(cert.certificateImage);
        }

        return {
          _id: cert._id,
          _creationTime: cert._creationTime,
          email: user.email,
          username: user.username,
          isMarked,
          certificateId: cert._id,
          certificateTitle: cert.certificateTitle,
          certificateCategory: cert.category,
          certificateDescription: cert.description,
          certificateImageUrl
        };
      }));

      // Filter out null results
      let filteredResults = results.filter((result): result is NonNullable<typeof result> => result !== null);

      // Sort by creation time (most recent first)
      filteredResults.sort((a, b) => b._creationTime - a._creationTime);

      // Apply pagination
      const paginatedResults = filteredResults.slice(
        (page - 1) * pageSize,
        page * pageSize
      );

      return {
        users: paginatedResults,
        total: filteredResults.length
      };
    }

    // Update platform filtering logic
    if (tab === "platforms") {
      // Get all platform profiles
      const platformProfiles = await ctx.db
        .query("profiles")
        .collect();

      // Process platform profiles
      const results = await Promise.all(platformProfiles.map(async profile => {
        // Get user data
        const user = await ctx.db.get(profile.userId);
        if (!user || (verified && !user.isverified)) return null;

        // Check if user is marked
        const isMarked = markedEmails.includes(user.email);

        // Parse platform data
        let platformData = null;
        try {
          platformData = formatPlatformData(profile.platformName.toLowerCase(), profile, []);
        } catch (e) {
          return null;
        }

        // Apply platform filters
        if (platformFilters) {
          const platform = profile.platformName.toLowerCase();
          
          // Filter by platform type
          const { leetcode, codechef, codeforces, geeksforgeeks } = platformFilters;
          const shouldShow = (
            (!leetcode && !codechef && !codeforces && !geeksforgeeks) || // Show all if none selected
            (leetcode && platform === "leetcode") ||
            (codechef && platform === "codechef") ||
            (codeforces && platform === "codeforces") ||
            (geeksforgeeks && platform === "geeksforgeeks")
          );
          
          if (!shouldShow) return null;
        }

        // Apply search query
        if (query) {
          const searchLower = query.toLowerCase();
          const matchesUsername = profile.platformUsername.toLowerCase().includes(searchLower);
          const matchesPlatform = profile.platformName.toLowerCase().includes(searchLower);

          if (!matchesUsername && !matchesPlatform) return null;
        }

        return {
          _id: profile._id,
          _creationTime: profile._creationTime,
          platform: profile.platformName,
          platformUsername: profile.platformUsername,
          platformData,
          userId: profile.userId,
          username: user.username,
          email: user.email,
          isMarked
        };
      }));

      // Filter out null results
      let filteredResults = results.filter((result): result is NonNullable<typeof result> => result !== null);

      // Sort by creation time (most recent first)
      filteredResults.sort((a, b) => b._creationTime - a._creationTime);

      // Apply pagination
      const paginatedResults = filteredResults.slice(
        (page - 1) * pageSize,
        page * pageSize
      );

      return {
        users: paginatedResults,
        total: filteredResults.length
      };
    }

    // For users tab, use the existing logic
    return {
      users: sortedUsers.slice((page - 1) * pageSize, page * pageSize),
      total: sortedUsers.length
    };
  }
});

export const getAvailableFilters = query({
  handler: async (ctx) => {
    // Get all skills from the skills table
    const skillsData = await ctx.db.query("skills").collect();
    
    const filters = {
      skills: new Set<string>(),
      maxExperience: 0
    };

    // Extract unique skills from skillsData
    skillsData.forEach(skill => {
      try {
        const data = JSON.parse(skill.skillsData);
        data.forEach((s: any) => filters.skills.add(s.name));
      } catch (e) {
        // Skip invalid JSON
      }
    });

    return {
      skills: Array.from(filters.skills),
      maxExperience: 10 // Default max experience
    };
  }
});

export const toggleMarkstar = mutation({
  args: {
    recruiterEmail: v.string(),
    userEmail: v.string(),
  },
  handler: async (ctx, args) => {
    // Get recruiter
    const recruiter = await ctx.db
      .query("recruiters")
      .filter((q) => q.eq(q.field("email"), args.recruiterEmail))
      .first();

    if (!recruiter) {
      return { success: false, message: "Recruiter not found" };
    }

    // Get current markstar array
    const currentMarkstar = recruiter.markstar || [];
    
    // Check if user is already marked
    const isMarked = currentMarkstar.includes(args.userEmail);
    
    // Toggle the mark
    let newMarkstar;
    if (isMarked) {
      newMarkstar = currentMarkstar.filter(email => email !== args.userEmail);
    } else {
      newMarkstar = [...currentMarkstar, args.userEmail];
    }

    // Update recruiter
    await ctx.db.patch(recruiter._id, {
      markstar: newMarkstar
    });

    return { 
      success: true, 
      action: isMarked ? "unmarked" : "marked",
      message: `Successfully ${isMarked ? "unmarked" : "marked"} the profile`
    };
  }
});

export const getMarksheetImageUrl = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    // Get user by username
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (!user || !user.marksheetImage) {
      return null;
    }

    // Get the URL for the marksheet image
    const url = await ctx.storage.getUrl(user.marksheetImage);
    return url;
  },
}); 
