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
        gotStars: [],
      });
    }
  },
});

export const update = mutation({
  args: {
    userId: v.id("users"),
    profileViews: v.optional(v.number()),
    gotStars: v.optional(v.array(v.string())),
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
        gotStars: updates.gotStars ?? []
      });
    }
  },
});

export const incrementViews = mutation({
  args: { 
    userId: v.id("users")
  },
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
        profileViews: 1,
        gotStars: []
      });
    }

    return { success: true };
  },
});

export const toggleStar = mutation({
  args: {
    targetUsername: v.string(),
    starrerUserId: v.id("users")
  },
  handler: async (ctx, args) => {
    const targetUser = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.targetUsername))
      .first();
    const starrerUser = await ctx.db.get(args.starrerUserId);
    
    if (!targetUser || !starrerUser) {
      return { success: false, reason: "User not found" };
    }

    if (targetUser._id === args.starrerUserId || targetUser.email === starrerUser.email) {
      return { success: false, reason: "Cannot star your own profile" };
    }

    const targetCounter = await ctx.db
      .query("counters")
      .withIndex("by_user", q => q.eq("userId", targetUser._id))
      .first();

    if (!targetCounter) {
      await ctx.db.insert("counters", {
        userId: targetUser._id,
        profileViews: 0,
        gotStars: [starrerUser.email]
      });
      await ctx.db.patch(args.starrerUserId, {
        madeStars: Array.from(new Set([...(starrerUser.madeStars || []), targetUser.email]))
      });
      return { success: true, action: "starred" };
    }

    const starrerMadeStars = starrerUser.madeStars || [];
    const targetGotStars = targetCounter.gotStars || [];

    const isStarred = targetGotStars.includes(starrerUser.email);

    if (isStarred) {
      await ctx.db.patch(targetCounter._id, {
        gotStars: targetGotStars.filter(email => email !== starrerUser.email)
      });

      await ctx.db.patch(args.starrerUserId, {
        madeStars: starrerMadeStars.filter(email => email !== targetUser.email)
      });

      return { success: true, action: "unstarred" };
    } else {
      await ctx.db.patch(targetCounter._id, {
        gotStars: Array.from(new Set([...targetGotStars, starrerUser.email]))
      });

      await ctx.db.patch(args.starrerUserId, {
        madeStars: Array.from(new Set([...starrerMadeStars, targetUser.email]))
      });

      return { success: true, action: "starred" };
    }
  }
});

export const getUserByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();
    
    return user;
  },
}); 