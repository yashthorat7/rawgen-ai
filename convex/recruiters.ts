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
function formatPlatformData(platform: string, data: any, skills: any[]) {
  if (!data) return null;

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
        totalSolved: data.totalSolved || 0,
        easySolved: data.easySolved || 0,
        mediumSolved: data.mediumSolved || 0,
        hardSolved: data.hardSolved || 0,
        totalEasy: data.totalEasy || 0,
        totalMedium: data.totalMedium || 0,
        totalHard: data.totalHard || 0,
        ranking: data.ranking || 0,
        rank: data.ranking || 0,
        skills: formattedSkills
      };
    case 'codechef':
      return {
        currentRating: data.currentRating || 0,
        highestRating: data.highestRating || 0,
        globalRank: data.globalRank || 0,
        countryRank: data.countryRank || 0,
        stars: data.stars || 0,
        rank: data.globalRank || 0,
        skills: formattedSkills
      };
    case 'geeksforgeeks':
      return {
        codingScore: data.codingScore || 0,
        problemsSolved: data.problemsSolved || 0,
        monthlyCoding: data.monthlyCoding || 0,
        rank: data.rank || 0,
        skills: formattedSkills
      };
    case 'codeforces':
      return {
        rating: data.rating || 0,
        maxRating: data.maxRating || 0,
        rank: data.rank || 0,
        maxRank: data.maxRank || 0,
        contribution: data.contribution || 0,
        friendOfCount: data.friendOfCount || 0,
        skills: formattedSkills
      };
    default:
      return {
        ...data,
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
            // Return all skills instead of just the first one
            const userSkills = userData.skills || [];
            if (!userSkills.length) return baseUser;

            // Create an array of skill entries
            const skillEntries = userSkills.map(skill => {
              let skillsData: string[] = [];
              try {
                const parsedData = JSON.parse(skill.skillsData);
                skillsData = Object.keys(parsedData.skills || {});
              } catch (e) {
                console.error('Error parsing skills data:', e);
                skillsData = [];
              }

              // Apply skill filters
              if (skillFilters) {
                if (skillFilters.categories?.length && !skillFilters.categories.includes(skill.category)) {
                  return null;
                }

                if (skillFilters.minSkills && skillsData.length < skillFilters.minSkills) {
                  return null;
                }

                if (skillFilters.maxSkills && skillsData.length > skillFilters.maxSkills) {
                  return null;
                }

                if (skillFilters.searchTerms.length > 0) {
                  const hasMatchingSkills = skillFilters.searchTerms.some(term =>
                    skillsData.some(s => 
                      s.toLowerCase().includes(term.toLowerCase())
                    )
                  );
                  if (!hasMatchingSkills) return null;
                }
              }

              return {
                ...baseUser,
                email: user.email,
                isMarked,
                skillCategory: skill.category,
                skills: skillsData
              };
            }).filter(Boolean);

            return skillEntries;

          case "projects":
            // Return all projects instead of just the first one
            const userProjects = userData.projects || [];
            if (!userProjects.length) return baseUser;

            // Create an array of project entries
            const projectEntries = await Promise.all(userProjects.map(async project => {
              // Apply project filters
              if (projectFilters) {
                if (projectFilters.hasDeployment && !project.deployLink) return null;
                if (projectFilters.hasImage && !project.projectImage) return null;
                
                const techStack = JSON.parse(project.techStack || "[]");
                if (projectFilters.minTechStack && techStack.length < projectFilters.minTechStack) return null;
                
                if (projectFilters.techStack?.length) {
                  const hasMatchingTech = projectFilters.techStack.some(tech =>
                    techStack.some((t: string) => 
                      t.toLowerCase().includes(tech.toLowerCase())
                    )
                  );
                  if (!hasMatchingTech) return null;
                }
              }
              
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

            return projectEntries.filter(Boolean);

          case "platforms":
            const profile = userData.profiles?.[0];
            if (!profile) return baseUser;

            // Get user's skills
            const platformUserSkills = userData.skills || [];

            // Parse platform data
            let platformData = null;
            try {
              const rawData = profile.platformCacheData ? JSON.parse(profile.platformCacheData) : null;
              if (!rawData) return null;

              // Format platform data based on platform type
              const platform = profile.platformName.toLowerCase();
              switch (platform) {
                case 'leetcode':
                  platformData = {
                    totalSolved: rawData.totalSolved || 0,
                    easySolved: rawData.easySolved || 0,
                    mediumSolved: rawData.mediumSolved || 0,
                    hardSolved: rawData.hardSolved || 0,
                    totalEasy: rawData.totalEasy || 0,
                    totalMedium: rawData.totalMedium || 0,
                    totalHard: rawData.totalHard || 0,
                    ranking: rawData.ranking || 0,
                    rank: rawData.ranking || 0,
                    submitStats: rawData.submitStats || {
                      acSubmissionNum: [],
                      totalSubmissionNum: []
                    }
                  };
                  break;
                case 'codechef':
                  platformData = {
                    currentRating: rawData.currentRating || 0,
                    highestRating: rawData.highestRating || 0,
                    globalRank: rawData.globalRank || 0,
                    countryRank: rawData.countryRank || 0,
                    stars: rawData.stars || 0,
                    rank: rawData.globalRank || 0,
                    submissionStats: rawData.submissionStats || [],
                    totalContests: rawData.totalContests || 0,
                    countryName: rawData.countryName || ''
                  };
                  break;
                case 'geeksforgeeks':
                  platformData = {
                    codingScore: rawData.codingScore || 0,
                    problemsSolved: rawData.problemsSolved || 0,
                    monthlyCoding: rawData.monthlyCoding || 0,
                    rank: rawData.rank || 0,
                    totalProblems: rawData.totalProblems || 0,
                    schoolProblems: rawData.schoolProblems || 0,
                    basicProblems: rawData.basicProblems || 0,
                    easyProblems: rawData.easyProblems || 0,
                    mediumProblems: rawData.mediumProblems || 0,
                    hardProblems: rawData.hardProblems || 0
                  };
                  break;
                case 'codeforces':
                  platformData = {
                    rating: rawData.rating || 0,
                    maxRating: rawData.maxRating || 0,
                    rank: rawData.rank || 0,
                    maxRank: rawData.maxRank || 0,
                    contribution: rawData.contribution || 0,
                    friendOfCount: rawData.friendOfCount || 0
                  };
                  break;
                default:
                  platformData = rawData;
              }
            } catch (e) {
              console.error('Error parsing platform data:', e);
              return null;
            }

            // Calculate normalized rank based on platform type
            let normalizedRank = 0;
            try {
              const rawData = profile.platformCacheData ? JSON.parse(profile.platformCacheData) : null;
              if (!rawData) return null;

              const platform = profile.platformName.toLowerCase();
              switch (platform) {
                case 'leetcode':
                  // Lower ranking is better
                  normalizedRank = rawData.ranking || Infinity;
                  platformData = {
                    ...platformData,
                    normalizedRank,
                    displayMetric: `Rank: ${normalizedRank}`
                  };
                  break;
                case 'codechef':
                  // Higher rating is better, invert for consistent sorting
                  normalizedRank = -(rawData.currentRating || 0);
                  platformData = {
                    ...platformData,
                    normalizedRank,
                    displayMetric: `Rating: ${-normalizedRank}`
                  };
                  break;
                case 'codeforces':
                  // Higher rating is better, invert for consistent sorting
                  normalizedRank = -(rawData.rating || 0);
                  platformData = {
                    ...platformData,
                    normalizedRank,
                    displayMetric: `Rating: ${-normalizedRank}`
                  };
                  break;
                case 'geeksforgeeks':
                  // Higher coding score is better, invert for consistent sorting
                  normalizedRank = -(rawData.codingScore || 0);
                  platformData = {
                    ...platformData,
                    normalizedRank,
                    displayMetric: `Score: ${-normalizedRank}`
                  };
                  break;
              }
            } catch (e) {
              console.error('Error parsing platform data:', e);
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

          case "certificates":
            // Return all certificates instead of just the first one
            const userCerts = userData.certificates || [];
            if (!userCerts.length) return baseUser;

            // Create an array of certificate entries
            const certEntries = await Promise.all(userCerts.map(async cert => {
              // Apply certificate filters
              if (certificateFilters) {
                if (certificateFilters.categories?.length && 
                    !certificateFilters.categories.includes(cert.category)) {
                  return null;
                }

                if (certificateFilters.hasImage && !cert.certificateImage) {
                  return null;
                }

                if (certificateFilters.dateRange) {
                  const certDate = new Date(cert._creationTime);
                  if (certificateFilters.dateRange.start && 
                      certDate < new Date(certificateFilters.dateRange.start)) {
                    return null;
                  }
                  if (certificateFilters.dateRange.end && 
                      certDate > new Date(certificateFilters.dateRange.end)) {
                    return null;
                  }
                }
              }
              
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

            return certEntries.filter(Boolean);

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

    // Update project search logic
    if (tab === "projects") {
      const projectNameSearch = args.filters.projectFilters?.projectNameSearch?.toLowerCase();
      
      // Filter projects based on project name search
      if (projectNameSearch) {
        sortedUsers = sortedUsers.filter(user => {
          const projectTitle = user.projectTitle?.toLowerCase() || '';
          return projectTitle.includes(projectNameSearch);
        });
      }
    }

    // Update certificate search logic
    if (tab === "certificates") {
      const certificateSearch = args.filters.certificateFilters?.certificateSearch?.toLowerCase();
      const selectedCategories = args.filters.certificateFilters?.categories || [];
      
      // Filter certificates based on search and categories
      sortedUsers = sortedUsers.filter(user => {
        // Check if certificate title or description matches search
        if (certificateSearch) {
          const title = user.certificateTitle?.toLowerCase() || '';
          const description = user.certificateDescription?.toLowerCase() || '';
          const category = user.certificateCategory?.toLowerCase() || '';
          
          const matchesSearch = 
            title.includes(certificateSearch) ||
            description.includes(certificateSearch) ||
            category.includes(certificateSearch);
            
          if (!matchesSearch) return false;
        }
        
        // Check if certificate category matches selected categories
        if (selectedCategories.length > 0) {
          return selectedCategories.includes(user.certificateCategory || '');
        }
        
        return true;
      });
    }

    // Apply pagination
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedUsers = sortedUsers.slice(start, end);

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
          const rawData = profile.platformCacheData ? JSON.parse(profile.platformCacheData) : null;
          if (!rawData) return null;

          // Format platform data based on platform type
          const platform = profile.platformName.toLowerCase();
          switch (platform) {
            case 'leetcode':
              platformData = {
                totalSolved: rawData.totalSolved || 0,
                easySolved: rawData.easySolved || 0,
                mediumSolved: rawData.mediumSolved || 0,
                hardSolved: rawData.hardSolved || 0,
                totalEasy: rawData.totalEasy || 0,
                totalMedium: rawData.totalMedium || 0,
                totalHard: rawData.totalHard || 0,
                ranking: rawData.ranking || 0,
                rank: rawData.ranking || 0,
                submitStats: rawData.submitStats || {
                  acSubmissionNum: [],
                  totalSubmissionNum: []
                }
              };
              break;
            case 'codechef':
              platformData = {
                currentRating: rawData.currentRating || 0,
                highestRating: rawData.highestRating || 0,
                globalRank: rawData.globalRank || 0,
                countryRank: rawData.countryRank || 0,
                stars: rawData.stars || 0,
                rank: rawData.globalRank || 0,
                submissionStats: rawData.submissionStats || [],
                totalContests: rawData.totalContests || 0,
                countryName: rawData.countryName || ''
              };
              break;
            case 'geeksforgeeks':
              platformData = {
                codingScore: rawData.codingScore || 0,
                problemsSolved: rawData.problemsSolved || 0,
                monthlyCoding: rawData.monthlyCoding || 0,
                rank: rawData.rank || 0,
                totalProblems: rawData.totalProblems || 0,
                schoolProblems: rawData.schoolProblems || 0,
                basicProblems: rawData.basicProblems || 0,
                easyProblems: rawData.easyProblems || 0,
                mediumProblems: rawData.mediumProblems || 0,
                hardProblems: rawData.hardProblems || 0
              };
              break;
            case 'codeforces':
              platformData = {
                rating: rawData.rating || 0,
                maxRating: rawData.maxRating || 0,
                rank: rawData.rank || 0,
                maxRank: rawData.maxRank || 0,
                contribution: rawData.contribution || 0,
                friendOfCount: rawData.friendOfCount || 0
              };
              break;
            default:
              platformData = rawData;
          }
        } catch (e) {
          console.error('Error parsing platform data:', e);
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

    return {
      users: paginatedUsers,
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
