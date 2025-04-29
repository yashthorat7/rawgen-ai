import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getProfiles = query({
  args: {
    email: v.string()
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      return [];
    }

    return await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const saveProfileImage = mutation({
  args: {
    email: v.string(),
    storageId: v.id("_storage")
  },
  handler: async (ctx, { email, storageId }) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", q => q.eq("email", email))
      .first();

    if (existingUser) {
      if (existingUser.profileImage) {
        await ctx.storage.delete(existingUser.profileImage);
      }
      await ctx.db.patch(existingUser._id, { profileImage: storageId });
    }
    return storageId;
  }
});

export const addPlatform = mutation({
  args: {
    email: v.string(),
    platformName: v.string(),
    platformUsername: v.string(),
    statsData: v.string(),
    fullData: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.email))
        .first();

      if (!user) {
        throw new Error(`User ${args.email} not found`);
      }

      const existingPlatform = await ctx.db
        .query("profiles")
        .filter((q) =>
          q.and(
            q.eq(q.field("userId"), user._id),
            q.eq(q.field("platformName"), args.platformName),
            q.eq(q.field("platformUsername"), args.platformUsername)
          )
        )
        .first();

      if (existingPlatform) {
        throw new Error(`Platform ${args.platformName} with username ${args.platformUsername} already exists for user ${args.email}`);
      }

      const platformsCount = await ctx.db
        .query("profiles")
        .filter((q) => q.eq(q.field("userId"), user._id))
        .collect();

      const order = platformsCount.length;

      const profileId = await ctx.db.insert("profiles", {
        userId: user._id,
        platformName: args.platformName,
        platformUsername: args.platformUsername,
        statsData: args.statsData,
        order,
      });

      if (args.fullData) {
        await ctx.db.insert("platformdata", {
          profileId,
          userId: user._id,
          fullData: args.fullData,
          lastUpdated: Date.now(),
        });
      }

      return profileId;
    } catch (error) {
      console.error("Mutation: Error in addPlatform:", error);
      throw error;
    }
  },
});

export const getPlatformData = query({
  args: {
    profileId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("platformdata")
      .withIndex("by_profile", (q) => q.eq("profileId", args.profileId))
      .first();
  },
});

export const deletePlatform = mutation({
  args: {
    email: v.string(),
    platformName: v.string(),
    platformUsername: v.string(),
  },
  handler: async (ctx, args) => {
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
      const platformData = await ctx.db
        .query("platformdata")
        .withIndex("by_profile", (q) => q.eq("profileId", profile._id))
        .first();
      
      if (platformData) {
        await ctx.db.delete(platformData._id);
      }
      
      await ctx.db.delete(profile._id);
    }
  },
});

export const getUserProfileImage = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", q => q.eq("email", email))
      .first();

    if (user?.profileImage) {
      const url = await ctx.storage.getUrl(user.profileImage);
      return url;
    }
    return null;
  }
});

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

    const user = await ctx.db.get(profile.userId);
    if (!user) {
      return { exists: false, username: null };
    }

    return { exists: true, username: user.username };
  },
});

export const updateProfileData = mutation({
  args: {
    email: v.string(),
    platformName: v.string(),
    platformUsername: v.string(),
    statsData: v.string(),
    fullData: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
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
      const updates: any = { statsData: args.statsData };
      if (args.order !== undefined) {
        updates.order = args.order;
      }
      await ctx.db.patch(profile._id, updates);

      if (args.fullData) {
        const existingPlatformData = await ctx.db
          .query("platformdata")
          .withIndex("by_profile", (q) => q.eq("profileId", profile._id))
          .first();

        if (existingPlatformData) {
          await ctx.db.patch(existingPlatformData._id, {
            fullData: args.fullData,
            lastUpdated: Date.now(),
          });
        } else {
          const platformDataId = await ctx.db.insert("platformdata", {
            profileId: profile._id,
            userId: user._id,
            fullData: args.fullData,
            lastUpdated: Date.now(),
          });
        }
      }
    }
  },
});

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

export const checkUsernameAvailable = query({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_username", q => q.eq("username", username))
      .first();

    return !existingUser;
  },
});

export const generateMarksheetUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

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
      if (user.marksheetImage) {
        await ctx.storage.delete(user.marksheetImage);
      }
      await ctx.db.patch(user._id, {
        marksheetImage: args.storageId,
        isverified: false
      });
    }
  },
});

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

export const getMarksheetImageUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const getProfileImageUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const createUser = mutation({
  args: {
    email: v.string(),
    username: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", q => q.eq("email", args.email))
      .first();

    if (existingUser) {
      return existingUser._id;
    }

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

        const skills = await ctx.db
          .query("skills")
          .filter(q => q.eq(q.field("userId"), user._id))
          .collect();

        const projects = await ctx.db
          .query("projects")
          .filter(q => q.eq(q.field("userId"), user._id))
          .collect();

        const platforms = await ctx.db
          .query("profiles")
          .filter(q => q.eq(q.field("userId"), user._id))
          .collect();

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

    return users.filter((user): user is NonNullable<typeof user> => user !== null);
  },
});

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

    await ctx.db.patch(user._id, { haslearned: true });
    
    return true;
  }
});

export const getFullPlatformDataByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", q => q.eq("username", args.username))
      .first();
    
    if (!user) {
      return null;
    }

    const profiles = await ctx.db
      .query("profiles")
      .withIndex("by_user", q => q.eq("userId", user._id))
      .collect();

    if (profiles.length === 0) {
      return null;
    }

    const fullDataArray = await Promise.all(
      profiles.map(async profile => {
        const platformData = await ctx.db
          .query("platformdata")
          .withIndex("by_profile", q => q.eq("profileId", profile._id))
          .first();

        if (!platformData) {
          return null;
        }

        return {
          platformName: profile.platformName,
          platformUsername: profile.platformUsername,
          fullData: platformData.fullData,
        };
      })
    );

    const result: {
      leetcode: Record<string, any>;
      codechef: Record<string, any>;
      geeksforgeeks: Record<string, any>;
      codeforces: Record<string, any>;
    } = {
      leetcode: {},
      codechef: {},
      geeksforgeeks: {},
      codeforces: {},
    };

    for (const item of fullDataArray) {
      if (item === null) continue;
      
      try {
        const data = JSON.parse(item.fullData);
        
        switch (item.platformName) {
          case 'leetcode':
            result.leetcode[item.platformUsername] = data;
            break;
          case 'codechef':
            result.codechef[item.platformUsername] = data;
            break;
          case 'geeksforgeeks':
            result.geeksforgeeks[item.platformUsername] = data;
            break;
          case 'codeforces':
            result.codeforces[item.platformUsername] = data;
            break;
        }
      } catch (error) {
        console.error(`Error parsing fullData for ${item.platformName}/${item.platformUsername}:`, error);
      }
    }

    return result;
  }
});

export const getAllPlatformData = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      return [];
    }

    const profiles = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    if (profiles.length === 0) {
      return [];
    }

    const platformDataPromises = profiles.map(async (profile) => {
      const platformData = await ctx.db
        .query("platformdata")
        .withIndex("by_profile", (q) => q.eq("profileId", profile._id))
        .first();
      
      if (!platformData) {
        return null;
      }
      
      return platformData;
    });

    const allPlatformData = await Promise.all(platformDataPromises);
    return allPlatformData.filter(data => data !== null);
  }
});

export const getPlatformDataByUserId = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("platformdata")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const getPlatformDataByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      return [];
    }

    return await ctx.db
      .query("platformdata")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});