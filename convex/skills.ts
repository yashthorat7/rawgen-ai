import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Add skills to a category
export const addSkills = mutation({
  args: {
    username: v.string(),
    category: v.string(),
    skills: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const { username, category, skills } = args;

    // Check if category already exists for this user
    const existingCategory = await ctx.db
      .query("skills")
      .withIndex("by_username", (q) => q.eq("username", username))
      .filter((q) => q.eq(q.field("category"), category))
      .first();

    if (existingCategory) {
      // Update existing category
      await ctx.db.patch(existingCategory._id, {
        skills: skills,
      });
      return existingCategory._id;
    } else {
      // Create new category
      const id = await ctx.db.insert("skills", {
        username,
        category,
        skills,
      });
      return id;
    }
  },
});

// Get all skills for a user
export const getUserSkills = query({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("skills")
      .withIndex("by_username", (q) => q.eq("username", args.username))
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
    const existingCategory = await ctx.db
      .query("skills")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .filter((q) => q.eq(q.field("category"), args.category))
      .first();

    if (existingCategory) {
      await ctx.db.delete(existingCategory._id);
    }
  },
}); 