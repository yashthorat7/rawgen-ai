import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { ConvexError } from "convex/values";
import { getUserByUsername } from "./users";
import { QueryCtx } from "./_generated/server";
import { FilterBuilder } from "convex/server";

function isValidPassword(password: string) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length < minLength) {
    return {
      isValid: false,
      message: "Password must be at least 8 characters long",
    };
  }
  if (!hasUpperCase || !hasLowerCase) {
    return {
      isValid: false,
      message: "Password must contain both uppercase and lowercase letters",
    };
  }
  if (!hasNumbers) {
    return {
      isValid: false,
      message: "Password must contain at least one number",
    };
  }
  if (!hasSpecialChar) {
    return {
      isValid: false,
      message: "Password must contain at least one special character",
    };
  }

  return { isValid: true, message: "" };
}

export const verify = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const recruiter = await ctx.db
      .query("recruiters")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (!recruiter) {
      return { success: false, message: "Email not found" };
    }

    if (recruiter.password !== args.password) {
      return { success: false, message: "Incorrect password" };
    }

    return {
      success: true,
      data: recruiter,
      message: "Login successful",
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.email)) {
      return { success: false, message: "Invalid email format" };
    }

    const passwordValidation = isValidPassword(args.password);
    if (!passwordValidation.isValid) {
      return { success: false, message: passwordValidation.message };
    }

    const existing = await ctx.db
      .query("recruiters")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (existing) {
      return { success: false, message: "Email already registered" };
    }

    try {
      const recruiterId = await ctx.db.insert("recruiters", {
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        password: args.password,
        markstar: args.markstar,
        isPermitted: args.isPermitted,
        ...(args.recruiterImage && {
          recruiterImage: args.recruiterImage as Id<"_storage">,
        }),
      });

      return {
        success: true,
        data: recruiterId,
        message: "Registration successful",
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to create account. Please try again.",
      };
    }
  },
});

async function getAllUserData(ctx: QueryCtx, username: string) {
  const user = await getUserByUsername(ctx, { username });
  if (!user) return null;

  const userId = user._id;

  const skills = await ctx.db
    .query("skills")
    .filter((q) => q.eq(q.field("userId"), userId))
    .collect();

  const projects = await ctx.db
    .query("projects")
    .filter((q) => q.eq(q.field("userId"), userId))
    .collect();

  const profiles = await ctx.db
    .query("profiles")
    .filter((q) => q.eq(q.field("userId"), userId))
    .collect();

  const certificates = await ctx.db
    .query("certificates")
    .filter((q) => q.eq(q.field("userId"), userId))
    .collect();

  const stars = user.madeStars?.length || 0;

  return {
    skills,
    projects,
    profiles,
    certificates,
    stars,
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

function formatPlatformData(platform: string, profile: any, skills: any[]) {
  if (!profile) return null;

  let stats: Record<string, any> = {};
  try {
    if (profile.statsData) {
      stats = JSON.parse(profile.statsData);
    }
  } catch (e) {
    console.error("Error parsing statsData:", e);
    return null;
  }

  const formattedSkills = skills.reduce((acc: string[], skill: any) => {
    try {
      const skillData = JSON.parse(skill.skillsData);
      return acc.concat(Array.isArray(skillData) ? skillData : []);
    } catch (e) {
      return acc;
    }
  }, []);

  switch (platform.toLowerCase()) {
    case "leetcode":
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
        skills: formattedSkills,
      };
    case "codechef":
      return {
        currentRating: stats.currentRating || 0,
        highestRating: stats.highestRating || 0,
        globalRank: stats.globalRank || 0,
        countryRank: stats.countryRank || 0,
        stars: stats.stars || 0,
        rank: stats.globalRank || 0,
        countryName: stats.countryName || "",
        totalContests: stats.totalContests || 0,
        skills: formattedSkills,
      };
    case "geeksforgeeks":
      return {
        codingScore: stats.codingScore || 0,
        problemsSolved: stats.problemsSolved || 0,
        monthlyCoding: stats.currentStreak || 0,
        currentStreak: stats.currentStreak || 0,
        rank: stats.rank || 0,
        easyProblems: stats.easyProblems || 0,
        mediumProblems: stats.mediumProblems || 0,
        hardProblems: stats.hardProblems || 0,
        skills: formattedSkills,
      };
    case "codeforces":
      return {
        rating: stats.rating || 0,
        maxRating: stats.maxRating || 0,
        rank: stats.rank || 0,
        maxRank: stats.maxRank || 0,
        contribution: stats.contribution || 0,
        friendOfCount: stats.friendOfCount || 0,
        skills: formattedSkills,
      };
    default:
      return {
        ...stats,
        skills: formattedSkills,
      };
  }
}

export type SearchFilters = {
  verified: boolean;
  sortBy:
    | "recent"
    | "stars"
    | "projects"
    | "skills"
    | "platforms"
    | "certificates";
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
        v.literal("certificates"),
      ),
      tab: v.union(
        v.literal("users"),
        v.literal("platforms"),
        v.literal("skills"),
        v.literal("projects"),
        v.literal("certificates"),
      ),
      platformFilters: v.optional(
        v.object({
          leetcode: v.optional(v.boolean()),
          codechef: v.optional(v.boolean()),
          codeforces: v.optional(v.boolean()),
          geeksforgeeks: v.optional(v.boolean()),
        }),
      ),
      skillFilters: v.optional(
        v.object({
          searchTerms: v.array(v.string()),
          categories: v.optional(v.array(v.string())),
          minSkills: v.optional(v.number()),
          maxSkills: v.optional(v.number()),
        }),
      ),
      projectFilters: v.optional(
        v.object({
          hasDeployment: v.optional(v.boolean()),
          hasImage: v.optional(v.boolean()),
          techStack: v.optional(v.array(v.string())),
          minTechStack: v.optional(v.number()),
          projectNameSearch: v.optional(v.string()),
        }),
      ),
      certificateFilters: v.optional(
        v.object({
          categories: v.optional(v.array(v.string())),
          hasImage: v.optional(v.boolean()),
          dateRange: v.optional(
            v.object({
              start: v.optional(v.string()),
              end: v.optional(v.string()),
            }),
          ),
          certificateSearch: v.optional(v.string()),
        }),
      ),
      userFilters: v.optional(
        v.object({
          hasProfileImage: v.optional(v.boolean()),
          isVerified: v.optional(v.boolean()),
          minStars: v.optional(v.number()),
          minProjects: v.optional(v.number()),
          minSkills: v.optional(v.number()),
          minPlatforms: v.optional(v.number()),
          minCertificates: v.optional(v.number()),
        }),
      ),
    }),
    page: v.number(),
    pageSize: v.number(),
    recruiterEmail: v.optional(v.string()),
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
      userFilters,
    } = filters;

    // Get marked emails for recruiter
    let markedEmails: string[] = [];
    if (recruiterEmail) {
      const recruiter = await ctx.db
        .query("recruiters")
        .filter((q) => q.eq(q.field("email"), recruiterEmail))
        .first();
      markedEmails = recruiter?.markstar || [];
    }

    // Optimize for specific tabs with their own data models
    if (tab === "skills") {
      // Get skills with pagination
      const allSkills = await ctx.db.query("skills").order("desc").collect();

      // Apply category filter if applicable
      let filteredSkills = allSkills;
      if (
        skillFilters &&
        skillFilters.categories &&
        skillFilters.categories.length > 0
      ) {
        filteredSkills = allSkills.filter((skill) =>
          skillFilters.categories!.includes(skill.category),
        );
      }

      // Apply pagination
      const totalCount = filteredSkills.length;
      const paginatedSkills = filteredSkills.slice(
        (page - 1) * pageSize,
        page * pageSize,
      );

      // Get user data for these skills
      const results = await Promise.all(
        paginatedSkills.map(async (skill) => {
          const user = await ctx.db.get(skill.userId);
          if (!user || (verified && !user.isverified)) return null;

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
            skills: skillsData,
          };
        }),
      );

      const filteredResults = results.filter(
        (result): result is NonNullable<typeof result> => result !== null,
      );

      return {
        users: filteredResults,
        total: totalCount,
      };
    }

    if (tab === "projects") {
      // Get projects
      const allProjects = await ctx.db
        .query("projects")
        .order("desc")
        .collect();

      // Apply filters
      let filteredProjects = allProjects;

      if (projectFilters) {
        filteredProjects = allProjects.filter((project) => {
          // Filter by deployment link if requested
          if (
            projectFilters.hasDeployment &&
            (!project.deployLink || project.deployLink === "")
          ) {
            return false;
          }

          // Filter by tech stack if requested
          if (projectFilters.techStack && projectFilters.techStack.length > 0) {
            const techStackMatches = projectFilters.techStack.some((tech) =>
              project.techStack.includes(tech),
            );
            if (!techStackMatches) return false;
          }

          // Filter by project name if requested
          if (
            projectFilters.projectNameSearch &&
            !project.projectName
              .toLowerCase()
              .includes(projectFilters.projectNameSearch.toLowerCase())
          ) {
            return false;
          }

          return true;
        });
      }

      // Apply pagination
      const totalCount = filteredProjects.length;
      const paginatedProjects = filteredProjects.slice(
        (page - 1) * pageSize,
        page * pageSize,
      );

      // Get user data for these projects
      const results = await Promise.all(
        paginatedProjects.map(async (project) => {
          const user = await ctx.db.get(project.userId);
          if (!user || (verified && !user.isverified)) return null;

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
            projectImageUrl,
          };
        }),
      );

      const filteredResults = results.filter(
        (result): result is NonNullable<typeof result> => result !== null,
      );

      return {
        users: filteredResults,
        total: totalCount,
      };
    }

    if (tab === "platforms") {
      // Get all platform profiles
      const allProfiles = await ctx.db
        .query("profiles")
        .order("desc")
        .collect();

      // Apply filters
      let filteredProfiles = allProfiles;

      // Apply platform type filter if specified
      if (
        platformFilters &&
        (platformFilters.leetcode ||
          platformFilters.codechef ||
          platformFilters.codeforces ||
          platformFilters.geeksforgeeks)
      ) {
        const platforms: string[] = [];
        if (platformFilters.leetcode) platforms.push("leetcode");
        if (platformFilters.codechef) platforms.push("codechef");
        if (platformFilters.codeforces) platforms.push("codeforces");
        if (platformFilters.geeksforgeeks) platforms.push("geeksforgeeks");

        filteredProfiles = allProfiles.filter((profile) =>
          platforms.includes(profile.platformName.toLowerCase()),
        );
      }

      // Apply search query if specified
      if (query) {
        const searchLower = query.toLowerCase();
        filteredProfiles = filteredProfiles.filter(
          (profile) =>
            profile.platformUsername.toLowerCase().includes(searchLower) ||
            profile.platformName.toLowerCase().includes(searchLower),
        );
      }

      // Apply pagination
      const totalCount = filteredProfiles.length;
      const paginatedProfiles = filteredProfiles.slice(
        (page - 1) * pageSize,
        page * pageSize,
      );

      // Get user data for these profiles
      const results = await Promise.all(
        paginatedProfiles.map(async (profile) => {
          const user = await ctx.db.get(profile.userId);
          if (!user || (verified && !user.isverified)) return null;

          const isMarked = markedEmails.includes(user.email);

          let platformData = null;
          try {
            platformData = formatPlatformData(
              profile.platformName.toLowerCase(),
              profile,
              [],
            );
          } catch (e) {
            return null;
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
            isMarked,
          };
        }),
      );

      const filteredResults = results.filter(
        (result): result is NonNullable<typeof result> => result !== null,
      );

      return {
        users: filteredResults,
        total: totalCount,
      };
    }

    if (tab === "certificates") {
      // Get all certificates
      const allCertificates = await ctx.db
        .query("certificates")
        .order("desc")
        .collect();

      // Apply filters
      let filteredCertificates = allCertificates;

      if (certificateFilters) {
        // Apply category filter if specified
        if (
          certificateFilters.categories &&
          certificateFilters.categories.length > 0
        ) {
          filteredCertificates = filteredCertificates.filter((cert) =>
            certificateFilters.categories!.includes(cert.category),
          );
        }

        // Apply search query if specified
        if (certificateFilters.certificateSearch) {
          filteredCertificates = filteredCertificates.filter((cert) =>
            cert.certificateTitle
              .toLowerCase()
              .includes(certificateFilters.certificateSearch!.toLowerCase()),
          );
        }
      }

      // Apply pagination
      const totalCount = filteredCertificates.length;
      const paginatedCertificates = filteredCertificates.slice(
        (page - 1) * pageSize,
        page * pageSize,
      );

      // Get user data for these certificates
      const results = await Promise.all(
        paginatedCertificates.map(async (cert) => {
          const user = await ctx.db.get(cert.userId);
          if (!user || (verified && !user.isverified)) return null;

          const isMarked = markedEmails.includes(user.email);

          let certificateImageUrl;
          if (cert.certificateImage) {
            certificateImageUrl = await ctx.storage.getUrl(
              cert.certificateImage,
            );
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
            certificateImageUrl,
          };
        }),
      );

      const filteredResults = results.filter(
        (result): result is NonNullable<typeof result> => result !== null,
      );

      return {
        users: filteredResults,
        total: totalCount,
      };
    }

    // Default tab (users)
    // Get all users first with basic filtering
    let allUsers = await ctx.db.query("users").collect();

    // Apply filters in memory
    let filteredUsers = allUsers;

    // Apply verified filter
    if (verified) {
      filteredUsers = filteredUsers.filter((user) => user.isverified);
    }

    // Apply profile image filter
    if (userFilters?.hasProfileImage) {
      filteredUsers = filteredUsers.filter((user) => user.profileImage != null);
    }

    // Apply search query
    if (query) {
      const searchLower = query.toLowerCase();
      filteredUsers = filteredUsers.filter((user) => {
        const username = user.username.toLowerCase();
        const firstName = (user.firstName || "").toLowerCase();
        const lastName = (user.lastName || "").toLowerCase();

        return (
          username.includes(searchLower) ||
          firstName.includes(searchLower) ||
          lastName.includes(searchLower)
        );
      });
    }

    // Get total count before pagination
    const totalUsers = filteredUsers.length;

    // Apply pagination - get more than needed to account for filters
    const paginatedUsers = filteredUsers.slice(
      (page - 1) * pageSize,
      (page - 1) * pageSize + pageSize * 2,
    );

    // Now enrich only the necessary users with their data
    const usersWithData = await Promise.all(
      paginatedUsers.map(async (user) => {
        const userData = await getAllUserData(ctx, user.username);
        if (!userData) return null;

        const isMarked = markedEmails.includes(user.email);

        // Apply additional user filters if specified
        if (userFilters) {
          if (
            userFilters.minStars &&
            (userData.stars || 0) < userFilters.minStars
          )
            return null;
          if (
            userFilters.minProjects &&
            (userData.projects?.length || 0) < userFilters.minProjects
          )
            return null;
          if (
            userFilters.minSkills &&
            (userData.skills?.length || 0) < userFilters.minSkills
          )
            return null;
          if (
            userFilters.minPlatforms &&
            (userData.profiles?.length || 0) < userFilters.minPlatforms
          )
            return null;
          if (
            userFilters.minCertificates &&
            (userData.certificates?.length || 0) < userFilters.minCertificates
          )
            return null;
        }

        return {
          ...user,
          isMarked,
          skillCount: userData.skills?.length || 0,
          projectCount: userData.projects?.length || 0,
          platformCount: userData.profiles?.length || 0,
          certificateCount: userData.certificates?.length || 0,
          starCount: userData.stars || 0,
        };
      }),
    );

    // Filter out null values and sort
    const validUsers = usersWithData.filter(
      (user): user is UserWithData => user !== null,
    );
    let sortedUsers = [...validUsers];

    // Sort users according to the specified criteria
    switch (sortBy) {
      case "stars":
        sortedUsers.sort((a, b) => (b.starCount || 0) - (a.starCount || 0));
        break;
      case "projects":
        sortedUsers.sort(
          (a, b) => (b.projectCount || 0) - (a.projectCount || 0),
        );
        break;
      case "skills":
        sortedUsers.sort((a, b) => (b.skillCount || 0) - (a.skillCount || 0));
        break;
      case "platforms":
        sortedUsers.sort(
          (a, b) => (b.platformCount || 0) - (a.platformCount || 0),
        );
        break;
      case "certificates":
        sortedUsers.sort(
          (a, b) => (b.certificateCount || 0) - (a.certificateCount || 0),
        );
        break;
      case "recent":
      default:
        sortedUsers.sort((a, b) => b._creationTime - a._creationTime);
    }

    // Take only pageSize items
    const finalUsers = sortedUsers.slice(0, pageSize);

    return {
      users: finalUsers,
      total: totalUsers,
    };
  },
});

export const getAvailableFilters = query({
  handler: async (ctx) => {
    const skillsData = await ctx.db.query("skills").collect();

    const filters = {
      skills: new Set<string>(),
      maxExperience: 0,
    };

    skillsData.forEach((skill) => {
      try {
        const data = JSON.parse(skill.skillsData);
        data.forEach((s: any) => filters.skills.add(s.name));
      } catch (e) {}
    });

    return {
      skills: Array.from(filters.skills),
      maxExperience: 10,
    };
  },
});

export const toggleMarkstar = mutation({
  args: {
    recruiterEmail: v.string(),
    userEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const recruiter = await ctx.db
      .query("recruiters")
      .filter((q) => q.eq(q.field("email"), args.recruiterEmail))
      .first();

    if (!recruiter) {
      return { success: false, message: "Recruiter not found" };
    }

    const currentMarkstar = recruiter.markstar || [];

    const isMarked = currentMarkstar.includes(args.userEmail);

    let newMarkstar;
    if (isMarked) {
      newMarkstar = currentMarkstar.filter((email) => email !== args.userEmail);
    } else {
      newMarkstar = [...currentMarkstar, args.userEmail];
    }

    await ctx.db.patch(recruiter._id, {
      markstar: newMarkstar,
    });

    return {
      success: true,
      action: isMarked ? "unmarked" : "marked",
      message: `Successfully ${isMarked ? "unmarked" : "marked"} the profile`,
    };
  },
});

export const getMarksheetImageUrl = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (!user || !user.marksheetImage) {
      return null;
    }

    const url = await ctx.storage.getUrl(user.marksheetImage);
    return url;
  },
});
