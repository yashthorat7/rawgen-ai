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
    profileViews: v.optional(v.number()),
    stars: v.optional(v.number()),
    isverified: v.optional(v.boolean()),
    cgpa: v.optional(v.float64()),
    github: v.optional(v.string()),
    linkedin: v.optional(v.string()),
    twitter: v.optional(v.string()),
    website: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { email, username, ...updates } = args;
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", q => q.eq("email", email))
      .first();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        username,
        ...updates
      });
    } else {
      await ctx.db.insert("users", {
        email,
        username,
        ...updates
      });
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