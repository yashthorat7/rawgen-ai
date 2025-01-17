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
    data: v.string(),
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

      // Insert the new profile with data
      const result = await ctx.db.insert("profiles", {
        email: args.email,
        platform: args.platform,
        username: args.username,
        order,
        data: args.data,
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

// Check if a profile exists for any user
export const checkProfileExists = query({
  args: {
    platform: v.string(),
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .filter((q) =>
        q.and(
          q.eq(q.field("platform"), args.platform),
          q.eq(q.field("username"), args.username)
        )
      )
      .first();

    if (!profile) {
      return { exists: false, email: null };
    }

    // Ensure email is a string and not undefined
    const email = typeof profile.email === 'string' ? profile.email : '';
    return { exists: true, email };
  },
});

// Update profile data
export const updateProfileData = mutation({
  args: {
    email: v.string(),
    platform: v.string(),
    username: v.string(),
    data: v.string(),
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
      await ctx.db.patch(profile._id, { data: args.data });
    }
  },
});

// Get user settings
export const getUserSettings = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const userSettings = await ctx.db
      .query("userSettings")
      .withIndex("by_email", q => q.eq("email", email))
      .first();

    return userSettings;
  }
});

// Check if username is available
export const checkUsernameAvailable = query({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    const existingUser = await ctx.db
      .query("userSettings")
      .withIndex("by_username", q => q.eq("username", username))
      .first();

    // If no one has this username, it's available
    if (!existingUser) return true;

    // Otherwise, return false as it's taken
    return false;
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
    const userSettings = await ctx.db
      .query("userSettings")
      .withIndex("by_email", q => q.eq("email", args.email))
      .first();

    if (userSettings) {
      // If there's an existing marksheet, delete it
      if (userSettings.marksheetImage) {
        await ctx.storage.delete(userSettings.marksheetImage);
      }
      await ctx.db.patch(userSettings._id, {
        marksheetImage: args.storageId,
        verified: false // Reset verification when new marksheet is uploaded
      });
    } else {
      await ctx.db.insert("userSettings", {
        email: args.email,
        marksheetImage: args.storageId,
        verified: false
      });
    }
  },
});

// Get marksheet image URL
export const getMarksheetImage = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const userSettings = await ctx.db
      .query("userSettings")
      .withIndex("by_email", q => q.eq("email", email))
      .first();

    if (userSettings?.marksheetImage) {
      const url = await ctx.storage.getUrl(userSettings.marksheetImage);
      return url;
    }
    return null;
  }
});

// Update user settings
export const updateUserSettings = mutation({
  args: {
    email: v.string(),
    username: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    cgpa: v.optional(v.number()),
    skills: v.optional(v.array(v.string())),
    hobbies: v.optional(v.array(v.string())),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingSettings = await ctx.db
      .query("userSettings")
      .withIndex("by_email", q => q.eq("email", args.email))
      .first();

    // If username is being updated, check if it's available
    if (args.username) {
      const existingUsername = await ctx.db
        .query("userSettings")
        .withIndex("by_username", q => q.eq("username", args.username))
        .first();

      if (existingUsername && existingUsername._id !== existingSettings?._id) {
        throw new Error("Username is already taken");
      }
    }

    // If CGPA is being updated and it's different from existing CGPA,
    // remove the marksheet and verification
    if (args.cgpa !== undefined && existingSettings &&
      args.cgpa !== existingSettings.cgpa &&
      existingSettings.marksheetImage) {
      await ctx.storage.delete(existingSettings.marksheetImage);
      await ctx.db.patch(existingSettings._id, {
        marksheetImage: undefined,
        verified: false
      });
    }

    const updates = {
      ...(args.username !== undefined && { username: args.username }),
      ...(args.firstName !== undefined && { firstName: args.firstName }),
      ...(args.lastName !== undefined && { lastName: args.lastName }),
      ...(args.cgpa !== undefined && { cgpa: args.cgpa }),
      ...(args.skills !== undefined && { skills: args.skills }),
      ...(args.hobbies !== undefined && { hobbies: args.hobbies }),
      ...(args.description !== undefined && { description: args.description }),
    };

    if (existingSettings) {
      await ctx.db.patch(existingSettings._id, updates);
    } else {
      await ctx.db.insert("userSettings", {
        email: args.email,
        ...updates
      });
    }
  },
});

// Add a skill
export const addSkill = mutation({
  args: {
    email: v.string(),
    skill: v.string(),
  },
  handler: async (ctx, args) => {
    const userSettings = await ctx.db
      .query("userSettings")
      .withIndex("by_email", q => q.eq("email", args.email))
      .first();

    if (userSettings) {
      const currentSkills = userSettings.skills || [];
      if (!currentSkills.includes(args.skill)) {
        await ctx.db.patch(userSettings._id, {
          skills: [...currentSkills, args.skill]
        });
      }
    } else {
      await ctx.db.insert("userSettings", {
        email: args.email,
        skills: [args.skill]
      });
    }
  },
});

// Remove a skill
export const removeSkill = mutation({
  args: {
    email: v.string(),
    skill: v.string(),
  },
  handler: async (ctx, args) => {
    const userSettings = await ctx.db
      .query("userSettings")
      .withIndex("by_email", q => q.eq("email", args.email))
      .first();

    if (userSettings?.skills) {
      await ctx.db.patch(userSettings._id, {
        skills: userSettings.skills.filter(s => s !== args.skill)
      });
    }
  },
});