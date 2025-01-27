import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const get = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("counters")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .first();
  },
});

export const initializeCounters = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("counters")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .first();

    if (!existing) {
      await ctx.db.insert("counters", {
        userId: args.userId,
        profileViews: 0,
        stars: 0,
      });
    }
  },
});

export const update = mutation({
  args: {
    userId: v.id("users"),
    profileViews: v.optional(v.number()),
    stars: v.optional(v.number()),
    socialLinks: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    
    const existing = await ctx.db
      .query("counters")
      .withIndex("by_user", q => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, updates);
    } else {
      await ctx.db.insert("counters", {
        userId,
        ...updates,
        profileViews: updates.profileViews ?? 0,
        stars: updates.stars ?? 0,
      });
    }
  },
});

export const incrementViews = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const counter = await ctx.db
      .query("counters")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .first();

    if (counter) {
      await ctx.db.patch(counter._id, {
        profileViews: (counter.profileViews || 0) + 1
      });
    } else {
      await ctx.db.insert("counters", {
        userId: args.userId,
        profileViews: 1
      });
    }
  },
});

export const addStar = mutation({
  args: {
    userId: v.id("users"),
    starredBy: v.string()
  },
  handler: async (ctx, args) => {
    // Get the user's stars
    const user = await ctx.db.get(args.userId);
    if (!user) return { success: false, reason: "User not found" };

    // Check if user has already starred
    const stars = user.stars || [];
    if (stars.includes(args.starredBy)) {
      return { success: false, reason: "Already starred" };
    }

    // Add the star
    await ctx.db.patch(args.userId, {
      stars: [...stars, args.starredBy]
    });

    return { success: true };
  }
}); 