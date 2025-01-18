import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Add skills to a category
export const addSkills = mutation({
  args: {
    email: v.string(),
    category: v.string(),
    skills: v.array(v.string()),
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

    // Check if category exists for this user
    const existingCategory = await ctx.db
      .query("skills")
      .withIndex("by_user_category", (q) => 
        q.eq("userId", user._id)
         .eq("category", args.category)
      )
      .first();

    if (existingCategory) {
      // Update existing category with new skills
      await ctx.db.patch(existingCategory._id, {
        skills: [...new Set([...existingCategory.skills, ...args.skills])]
      });
    } else {
      // Create new category with skills
      await ctx.db.insert("skills", {
        userId: user._id,
        category: args.category,
        skills: args.skills
      });
    }
  },
});

// Get all skills for a user
export const getUserSkills = query({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    // First, get the user's ID from their username
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (!user) {
      return []; // Return empty array if user not found
    }

    return await ctx.db
      .query("skills")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

// Delete a skill category
export const deleteSkillCategory = mutation({
  args: {
    username: v.string(),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    // First, get the user's ID from their username
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (!user) {
      throw new Error(`User ${args.username} not found`);
    }

    const existingCategory = await ctx.db
      .query("skills")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("category"), args.category))
      .first();

    if (existingCategory) {
      await ctx.db.delete(existingCategory._id);
    }
  },
}); 