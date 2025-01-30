import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { ConvexError } from "convex/values";

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

export const searchUsers = query({
  args: {
    query: v.string(),
    filters: v.object({
      skills: v.optional(v.array(v.string())),
    }),
    sort: v.optional(v.union(
      v.literal("skills"),
      v.literal("name"),
      v.literal("recent")
    )),
    sortDirection: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get all users and filter in memory for simplicity
    const users = await ctx.db.query("users").collect();
    
    // Filter users based on search query
    let filteredUsers = users;
    if (args.query) {
      const searchTerm = args.query.toLowerCase().trim();
      
      // First try exact username match
      const exactMatches = filteredUsers.filter(user => 
        user.username.toLowerCase() === searchTerm
      );

      // Then try starts with
      const startsWithMatches = filteredUsers.filter(user => 
        user.username.toLowerCase().startsWith(searchTerm) &&
        !exactMatches.find(m => m._id === user._id)
      );

      // Finally try includes
      const includesMatches = filteredUsers.filter(user => 
        user.username.toLowerCase().includes(searchTerm) &&
        !exactMatches.find(m => m._id === user._id) &&
        !startsWithMatches.find(m => m._id === user._id)
      );

      // Combine all matches in priority order
      filteredUsers = [...exactMatches, ...startsWithMatches, ...includesMatches];
    }

    // Get related data for filtering
    const userSkills = await ctx.db
      .query("skills")
      .filter(q => q.eq(q.field("category"), "technical"))
      .collect();

    const skillsMap = new Map();
    userSkills.forEach(skill => {
      try {
        const data = JSON.parse(skill.skillsData);
        skillsMap.set(skill.userId, data);
      } catch (e) {
        // Skip invalid JSON
      }
    });

    // Apply skills filter
    if (args.filters.skills?.length) {
      filteredUsers = filteredUsers.filter(user => {
        const userSkillData = skillsMap.get(user._id);
        if (!userSkillData) return false;
        return args.filters.skills!.some(skill => 
          userSkillData.some((s: any) => 
            s.name.toLowerCase().includes(skill.toLowerCase())
          )
        );
      });
    }

    // Apply sorting
    const direction = args.sortDirection === "asc" ? 1 : -1;
    if (args.sort) {
      switch (args.sort) {
        case "name":
          filteredUsers.sort((a, b) => 
            direction * (a.username.localeCompare(b.username))
          );
          break;
        case "recent":
          filteredUsers.sort((a, b) => 
            direction * (b._creationTime - a._creationTime)
          );
          break;
        case "skills":
          filteredUsers.sort((a, b) => {
            const aSkills = skillsMap.get(a._id)?.length || 0;
            const bSkills = skillsMap.get(b._id)?.length || 0;
            return direction * (bSkills - aSkills);
          });
          break;
      }
    } else {
      // Default sort by recent
      filteredUsers.sort((a, b) => b._creationTime - a._creationTime);
    }

    // Handle pagination
    const page = args.page || 1;
    const pageSize = args.pageSize || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      users: filteredUsers.slice(start, end),
      pagination: {
        total: filteredUsers.length,
        page,
        pageSize,
        totalPages: Math.ceil(filteredUsers.length / pageSize)
      }
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
