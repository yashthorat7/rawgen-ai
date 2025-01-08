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
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .collect();
  },
});

// Add a platform
export const addPlatform = mutation({
  args: {
    email: v.string(),
    username: v.string(),
    platform: v.string(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if platform already exists for this email
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_email", q => q.eq("email", args.email))
      .filter(q => 
        q.eq(q.field("platform"), args.platform) && 
        q.eq(q.field("username"), args.username)
      )
      .first();

    if (existing) return null;

    return await ctx.db.insert("profiles", args);
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
      .withIndex("by_email", q => q.eq("email", args.email))
      .filter(q => 
        q.eq(q.field("platform"), args.platform) && 
        q.eq(q.field("username"), args.username)
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
    updates: v.array(v.object({
      platform: v.string(),
      username: v.string(),
      order: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const profiles = await ctx.db
      .query("profiles")
      .withIndex("by_email", q => q.eq("email", args.email))
      .collect();

    for (const update of args.updates) {
      const profile = profiles.find(p => 
        p.platform === update.platform && 
        p.username === update.username
      );
      if (profile) {
        await ctx.db.patch(profile._id, { order: update.order });
      }
    }
  },
});