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
    if (!args.email) {
      throw new Error("Email is required");
    }

    // Get user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error(`User ${args.email} not found`);
    }

    // Validate skills array
    if (args.skills.length > 16) {
      throw new Error("Maximum 16 skills allowed per category");
    }

    // Get current highest order
    const existingSkills = await ctx.db
      .query("skills")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    
    const order = existingSkills.length;

    // Convert array to object format
    const skillsObject = {
      skills: args.skills.reduce((acc, skill) => {
        acc[skill.trim()] = true;
        return acc;
      }, {} as Record<string, boolean>),
      updatedAt: Date.now()
    };

    const skillsData = JSON.stringify(skillsObject);

    // Check if category exists
    const existingCategory = await ctx.db
      .query("skills")
      .withIndex("by_user_category", (q) => 
        q.eq("userId", user._id)
         .eq("category", args.category)
      )
      .first();

    try {
      if (args.skills.length === 0) {
        if (existingCategory) {
          await ctx.db.delete(existingCategory._id);
          // Reorder remaining skills
          const remainingSkills = await ctx.db
            .query("skills")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .collect();
          
          for (let i = 0; i < remainingSkills.length; i++) {
            await ctx.db.patch(remainingSkills[i]._id, { order: i });
          }
          return { success: true, deleted: true };
        }
        return { success: false, reason: "No skills provided" };
      }

      if (existingCategory) {
        await ctx.db.patch(existingCategory._id, { skillsData });
        return { success: true, updated: true };
      } else {
        await ctx.db.insert("skills", {
          userId: user._id,
          category: args.category,
          skillsData,
          order
        });
        return { success: true, created: true };
      }
    } catch (error) {
      throw error;
    }
  },
});

// Add new mutation for reordering skills
export const reorderSkills = mutation({
  args: {
    email: v.string(),
    updates: v.array(v.object({
      category: v.string(),
      order: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    for (const update of args.updates) {
      const skill = await ctx.db
        .query("skills")
        .withIndex("by_user_category", (q) => 
          q.eq("userId", user._id)
           .eq("category", update.category)
        )
        .first();

      if (skill) {
        await ctx.db.patch(skill._id, { order: update.order });
      }
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

    // Sort by order before mapping
    return categories
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map(category => {
        if (!category._id) {
          console.error('Category missing _id:', category);
        }
        const skillsData = category.skillsData ? JSON.parse(category.skillsData) : null;
        
        return {
          _id: category._id,
          category: category.category,
          skills: skillsData?.skills ? Object.keys(skillsData.skills) : [],
          order: category.order
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

    const existingCategory = await ctx.db
      .query("skills")
      .withIndex("by_user_category", (q) => 
        q.eq("userId", user._id)
         .eq("category", args.category)
      )
      .first();

    if (!existingCategory) {
      return { success: false, reason: "Category not found" };
    }

    // Delete the category
    await ctx.db.delete(existingCategory._id);

    // Reorder remaining skills
    const remainingSkills = await ctx.db
      .query("skills")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    
    for (let i = 0; i < remainingSkills.length; i++) {
      await ctx.db.patch(remainingSkills[i]._id, { order: i });
    }

    return { success: true };
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

export const getAllSkills = query({
  args: {},
  handler: async (ctx) => {
    const skillCategories = await ctx.db
      .query("skills")
      .collect();

    // Extract all unique skills from all categories
    const uniqueSkills = new Set<string>();
    skillCategories.forEach(category => {
      try {
        const skills = JSON.parse(category.skillsData);
        if (Array.isArray(skills)) {
          skills.forEach(skill => uniqueSkills.add(skill));
        }
      } catch {
        // Skip invalid JSON
      }
    });

    return Array.from(uniqueSkills).sort();
  }
}); 