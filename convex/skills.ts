import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

interface SkillData {
  skills: { [key: string]: boolean };
  updatedAt: number;
}

// Add or update skills for a category
export const addSkills = mutation({
  args: {
    email: v.string(),
    category: v.string(),
    skills: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    console.log('Received update request:', {
      email: args.email,
      category: args.category,
      skills: args.skills
    });

    if (!args.email) {
      throw new Error("Email is required");
    }

    // Get user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      console.error(`User ${args.email} not found`);
      throw new Error(`User ${args.email} not found`);
    }

    // Validate skills array
    if (args.skills.length > 16) {
      console.error("Maximum 16 skills allowed per category");
      throw new Error("Maximum 16 skills allowed per category");
    }

    // Convert array to object format
    const skillsObject = {
      skills: args.skills.reduce((acc, skill) => {
        acc[skill.trim()] = true;
        return acc;
      }, {} as Record<string, boolean>),
      updatedAt: Date.now()
    };

    // Store as JSON string
    const skillsData = JSON.stringify(skillsObject);

    // Check if category exists
    const existingCategory = await ctx.db
      .query("skills")
      .withIndex("by_user_category", (q) => 
        q.eq("userId", user._id)
         .eq("category", args.category)
      )
      .first();

    console.log('Existing category:', existingCategory);

    try {
      // If no skills provided and category exists, delete it
      if (args.skills.length === 0) {
        if (existingCategory) {
          console.log('Deleting category due to empty skills');
          await ctx.db.delete(existingCategory._id);
          return { success: true, deleted: true };
        }
        return { success: false, reason: "No skills provided" };
      }

      if (existingCategory) {
        console.log('Updating existing category with new skills');
        // Replace existing skills with new ones
        await ctx.db.patch(existingCategory._id, { skillsData });
        return { 
          success: true, 
          updated: true, 
          skills: args.skills,
          category: args.category
        };
      } else {
        console.log('Creating new category with skills');
        // Create new category with skills
        await ctx.db.insert("skills", {
          userId: user._id,
          category: args.category,
          skillsData
        });
        return { 
          success: true, 
          created: true, 
          skills: args.skills,
          category: args.category
        };
      }
    } catch (error) {
      console.error('Error updating skills:', error);
      throw error;
    }
  },
});

// Get all skills for a user
export const getUserSkills = query({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (!user) {
      return [];
    }

    const categories = await ctx.db
      .query("skills")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return categories.map(category => {
      if (!category._id) {
        console.error('Category missing _id:', category);
      }
      const skillsData = category.skillsData ? JSON.parse(category.skillsData) : null;
      
      return {
        _id: category._id,
        category: category.category,
        skills: skillsData?.skills ? Object.keys(skillsData.skills) : []
      };
    });
  },
});

// Delete a skill category
export const deleteSkillCategory = mutation({
  args: {
    username: v.string(),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.username) {
      throw new Error("Username is required");
    }

    // First, get the user's ID from their username
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (!user) {
      throw new Error(`User ${args.username} not found`);
    }

    console.log('Deleting category:', {
      username: args.username,
      category: args.category
    });

    const existingCategory = await ctx.db
      .query("skills")
      .withIndex("by_user_category", (q) => 
        q.eq("userId", user._id)
         .eq("category", args.category)
      )
      .first();

    if (existingCategory) {
      console.log('Found category to delete:', existingCategory);
      await ctx.db.delete(existingCategory._id);
      return { success: true, deleted: true };
    }

    return { success: false, reason: "Category not found" };
  },
});

export const update = mutation({
  args: {
    email: v.string(),
    oldCategory: v.string(),
    newCategory: v.string(),
    skills: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Get user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Get the existing skill category
    const existingSkill = await ctx.db
      .query("skills")
      .withIndex("by_user_category", (q) => 
        q.eq("userId", user._id).eq("category", args.oldCategory)
      )
      .first();

    if (!existingSkill) {
      throw new Error("Skill category not found");
    }

    // Convert array to object format
    const skillsObject = {
      skills: args.skills.reduce((acc, skill) => {
        acc[skill.trim()] = true;
        return acc;
      }, {} as Record<string, boolean>),
      updatedAt: Date.now()
    };

    // Store as JSON string
    const skillsData = JSON.stringify(skillsObject);

    // Update the skill category
    await ctx.db.patch(existingSkill._id, {
      category: args.newCategory,
      skillsData
    });

    return {
      success: true,
      updated: true,
      category: args.newCategory,
      skills: args.skills,
    };
  },
}); 