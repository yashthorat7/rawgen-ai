import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get profiles for a specific email
export const getProfiles = query({
  args: {
    email: v.string()
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("profiles")
      .filter((q) => q.eq(q.field("email"), args.email))
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

    // Update user settings with the new profile image
    const existingSettings = await ctx.db
      .query("userSettings")
      .withIndex("by_email", q => q.eq("email", email))
      .first();


    if (existingSettings) {
      // If old image exists, delete it
      if (existingSettings.profileImage) {
        await ctx.storage.delete(existingSettings.profileImage);
      }
      await ctx.db.patch(existingSettings._id, { profileImage: storageId });
    } else {
      await ctx.db.insert("userSettings", {
        email,
        profileImage: storageId
      });
    }

    return storageId;
  }
});

// Add a platform
export const addPlatform = mutation({
  args: {
    email: v.string(),
    platform: v.string(),
    username: v.string(),
    order: v.number(),
  },
  handler: async (ctx, args) => {

    try {
      // Check if this exact platform+username combination exists for this email
      const existing = await ctx.db
        .query("profiles")
        .withIndex("by_email_platform", (q) => 
          q.eq("email", args.email)
           .eq("platform", args.platform)
        )
        .filter((q) => q.eq(q.field("username"), args.username))
        .first();

      if (existing) {
        throw new Error(`Username ${args.username} already exists for platform ${args.platform}`);
      }

      // Get the latest order number for this email
      const latestProfile = await ctx.db
        .query("profiles")
        .withIndex("by_email", (q) => q.eq("email", args.email))
        .order("desc")
        .first();

      const order = latestProfile ? latestProfile.order + 1 : 1;

      // Insert the new profile
      const result = await ctx.db.insert("profiles", {
        email: args.email,
        platform: args.platform,
        username: args.username,
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
    platform: v.string(),
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .filter((q) => 
        q.and(
          q.eq(q.field("email"), args.email),
          q.eq(q.field("platform"), args.platform),
          q.eq(q.field("username"), args.username)
        )
      )
      .first();

    if (profile) {
      await ctx.db.delete(profile._id);
    }
  },
});

// Update platform order
export const updateOrder = mutation({
  args: {
    email: v.string(),
    updates: v.array(
      v.object({
        platform: v.string(),
        username: v.string(),
        order: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const profiles = await ctx.db
      .query("profiles")
      .filter((q) => q.eq(q.field("email"), args.email))
      .collect();

    for (const update of args.updates) {
      const profile = profiles.find(
        (p) => p.platform === update.platform && p.username === update.username
      );
      if (profile) {
        await ctx.db.patch(profile._id, { order: update.order });
      }
    }
  },
});

// Get user profile image
export const getUserProfileImage = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const userSettings = await ctx.db
      .query("userSettings")
      .withIndex("by_email", q => q.eq("email", email))
      .first();

    if (userSettings?.profileImage) {
      // Get the URL for the image
      const url = await ctx.storage.getUrl(userSettings.profileImage);
      return url;
    }
    return null;
  }
});