import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get profiles for a specific user
export const getProfiles = query({
  args: {
    email: v.string()
  },
  handler: async (ctx, args) => {
    // Get user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      return []; // Return empty array if user not found
    }

    return await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

// Generate upload URL for profile image
export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

// Save profile image
export const saveProfileImage = mutation({
  args: {
    email: v.string(),
    storageId: v.id("_storage")
  },
  handler: async (ctx, { email, storageId }) => {
    // Update user with the new profile image
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", q => q.eq("email", email))
      .first();

    if (existingUser) {
      // If old image exists, delete it
      if (existingUser.profileImage) {
        await ctx.storage.delete(existingUser.profileImage);
      }
      await ctx.db.patch(existingUser._id, { profileImage: storageId });
    }
    return storageId;
  }
});

// Add a platform
export const addPlatform = mutation({
  args: {
    email: v.string(),
    platformName: v.string(),
    platformUsername: v.string(),
    platformCacheData: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Get user by email
      const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.email))
        .first();

      if (!user) {
        throw new Error(`User ${args.email} not found`);
      }

      // Check if this exact platform+username combination exists
      const existing = await ctx.db
        .query("profiles")
        .withIndex("by_platform", (q) =>
          q.eq("platformName", args.platformName)
            .eq("platformUsername", args.platformUsername)
        )
        .first();

      if (existing) {
        throw new Error(`Username ${args.platformUsername} already exists for platform ${args.platformName}`);
      }

      // Get the current highest order for this user
      const userProfiles = await ctx.db
        .query("profiles")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();
      
      const order = userProfiles.length;

      // Insert the new profile with data
      const result = await ctx.db.insert("profiles", {
        userId: user._id,
        platformName: args.platformName,
        platformUsername: args.platformUsername,
        platformCacheData: args.platformCacheData,
        order,
      });

      return result;
    } catch (error) {
      console.error("Mutation: Error in addPlatform:", error);
      throw error;
    }
  },
});

// Delete a platform
export const deletePlatform = mutation({
  args: {
    email: v.string(),
    platformName: v.string(),
    platformUsername: v.string(),
  },
  handler: async (ctx, args) => {
    // Get user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error(`User ${args.email} not found`);
    }

    const profile = await ctx.db
      .query("profiles")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), user._id),
          q.eq(q.field("platformName"), args.platformName),
          q.eq(q.field("platformUsername"), args.platformUsername)
        )
      )
      .first();

    if (profile) {
      await ctx.db.delete(profile._id);
    }
  },
});

// Get user profile image
export const getUserProfileImage = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", q => q.eq("email", email))
      .first();

    if (user?.profileImage) {
      // Get the URL for the image
      const url = await ctx.storage.getUrl(user.profileImage);
      return url;
    }
    return null;
  }
});

// Check if a profile exists for any user
export const checkProfileExists = query({
  args: {
    platformName: v.string(),
    platformUsername: v.string(),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_platform", (q) =>
        q.eq("platformName", args.platformName)
          .eq("platformUsername", args.platformUsername)
      )
      .first();

    if (!profile) {
      return { exists: false, username: null };
    }

    // Get the username from the user record
    const user = await ctx.db.get(profile.userId);
    if (!user) {
      return { exists: false, username: null };
    }

    return { exists: true, username: user.username };
  },
});

// Update profile data
export const updateProfileData = mutation({
  args: {
    email: v.string(),
    platformName: v.string(),
    platformUsername: v.string(),
    platformCacheData: v.string(),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get user by email instead of username
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error(`User ${args.email} not found`);
    }

    const profile = await ctx.db
      .query("profiles")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), user._id),
          q.eq(q.field("platformName"), args.platformName),
          q.eq(q.field("platformUsername"), args.platformUsername)
        )
      )
      .first();

    if (profile) {
      const updates: any = { platformCacheData: args.platformCacheData };
      if (args.order !== undefined) {
        updates.order = args.order;
      }
      await ctx.db.patch(profile._id, updates);
    }
  },
});

// Get user info
export const getUser = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", q => q.eq("email", email))
      .first();

    return user;
  }
});

// Check if username is available
export const checkUsernameAvailable = query({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_username", q => q.eq("username", username))
      .first();

    // If no one has this username, it's available
    return !existingUser;
  },
});

// Generate upload URL for marksheet
export const generateMarksheetUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Save marksheet image
export const saveMarksheetImage = mutation({
  args: {
    email: v.string(),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", q => q.eq("email", args.email))
      .first();

    if (user) {
      // If there's an existing marksheet, delete it
      if (user.marksheetImage) {
        await ctx.storage.delete(user.marksheetImage);
      }
      await ctx.db.patch(user._id, {
        marksheetImage: args.storageId,
        isverified: false // Reset verification when new marksheet is uploaded
      });
    }
  },
});

// Get marksheet image URL
export const getMarksheetImage = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", q => q.eq("email", email))
      .first();

    if (user?.marksheetImage) {
      const url = await ctx.storage.getUrl(user.marksheetImage);
      return url;
    }
    return null;
  }
});

// Update user info
export const updateUser = mutation({
  args: {
    email: v.string(),
    username: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    isverified: v.optional(v.boolean()),
    cgpa: v.optional(v.float64()),
  },
  handler: async (ctx, args) => {
    const { email, username, ...updates } = args;
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", q => q.eq("email", email))
      .first();

    if (existingUser) {
      const completeUpdate = {
        firstName: undefined,
        lastName: undefined,
        isverified: undefined,
        cgpa: undefined,
        ...Object.fromEntries(
          Object.entries(updates).filter(([_, value]) => value !== undefined)
        ),
        username
      };

      await ctx.db.patch(existingUser._id, completeUpdate);
      return existingUser._id;
    } else {
      const validFields = Object.fromEntries(
        Object.entries(updates).filter(([_, value]) => value !== undefined)
      );

      const id = await ctx.db.insert("users", {
        email,
        username,
        ...validFields
      });
      return id;
    }
  },
});

// Update platform order
export const updateOrder = mutation({
  args: {
    email: v.string(),
    updates: v.array(v.object({
      platformName: v.string(),
      platformUsername: v.string(),
      order: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    // Get user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error(`User ${args.email} not found`);
    }

    for (const update of args.updates) {
      const profile = await ctx.db
        .query("profiles")
        .filter((q) =>
          q.and(
            q.eq(q.field("userId"), user._id),
            q.eq(q.field("platformName"), update.platformName),
            q.eq(q.field("platformUsername"), update.platformUsername)
          )
        )
        .first();

      if (profile) {
        await ctx.db.patch(profile._id, { order: update.order });
      }
    }
  },
});

// Add this query for getting marksheet image URL
export const getMarksheetImageUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// Add this query if it doesn't exist
export const getProfileImageUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// Create user if not exists
export const createUser = mutation({
  args: {
    email: v.string(),
    username: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", q => q.eq("email", args.email))
      .first();

    if (existingUser) {
      return existingUser._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      email: args.email,
      username: args.username,
      firstName: args.firstName,
      lastName: args.lastName,
      isverified: false
    });

    return userId;
  }
});

// Get user by username
export const getUserByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", q => q.eq("username", username))
      .first();

    if (!user) {
      return null;
    }

    // Get all profiles for this user
    const profiles = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return {
      ...user,
      profiles
    };
  }
});

export const checkUsernameExists = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", q => q.eq("username", args.username))
      .first();
    
    return Boolean(user);
  },
});

export const getUsernameFromEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    return user?.username;
  },
});

export const getUsernamesFromEmails = query({
  args: { emails: v.array(v.string()) },
  handler: async (ctx, args) => {
    const users = await Promise.all(
      args.emails.map(async (email) => {
        const user = await ctx.db
          .query("users")
          .withIndex("by_email", (q) => q.eq("email", email))
          .first();
        return { email, username: user?.username };
      })
    );
    return Object.fromEntries(users.map(u => [u.email, u.username]));
  },
});

export const searchUsers = query({
  args: { 
    query: v.string(),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const searchQuery = args.query.toLowerCase();
    const limit = args.limit || 10;

    if (!searchQuery) {
      return [];
    }

    const users = await ctx.db
      .query("users")
      .collect();

    // Filter users in memory
    const filteredUsers = users.filter(user => {
      const searchFields = [
        user.email?.toLowerCase(),
        user.username?.toLowerCase(),
        user.firstName?.toLowerCase(),
        user.lastName?.toLowerCase()
      ];

      return searchFields.some(field => 
        field && field.includes(searchQuery)
      );
    });

    return filteredUsers.slice(0, limit);
  },
});

export const getMultipleByEmail = query({
  args: { emails: v.array(v.string()) },
  handler: async (ctx, args) => {
    const users = await Promise.all(
      args.emails.map(async (email) => {
        const user = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("email"), email))
          .first();
        
        if (!user) return null;

        // Get user's skills
        const skills = await ctx.db
          .query("skills")
          .filter(q => q.eq(q.field("userId"), user._id))
          .collect();

        // Get user's projects
        const projects = await ctx.db
          .query("projects")
          .filter(q => q.eq(q.field("userId"), user._id))
          .collect();

        // Get user's profiles (platforms)
        const platforms = await ctx.db
          .query("profiles")
          .filter(q => q.eq(q.field("userId"), user._id))
          .collect();

        // Get user's certificates
        const certificates = await ctx.db
          .query("certificates")
          .filter(q => q.eq(q.field("userId"), user._id))
          .collect();

        return {
          ...user,
          skills,
          projects,
          platforms,
          certificates
        };
      })
    );

    // Filter out null values and return
    return users.filter((user): user is NonNullable<typeof user> => user !== null);
  },
});

// Update haslearned status for a user
export const updateHasLearned = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, { email }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", q => q.eq("email", email))
      .first();

    if (!user) {
      throw new Error(`User with email ${email} not found`);
    }

    // Update the user with haslearned set to true
    await ctx.db.patch(user._id, { haslearned: true });
    
    return true;
  }
});