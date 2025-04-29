import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

interface SkillData {
  skills: { [key: string]: boolean };
  updatedAt: number;
}

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

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error(`User ${args.email} not found`);
    }

    if (args.skills.length > 16) {
      throw new Error("Maximum 16 skills allowed per category");
    }

    const existingSkills = await ctx.db
      .query("skills")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    
    const order = existingSkills.length;

    const skillsObject = {
      skills: args.skills.reduce((acc, skill) => {
        acc[skill.trim()] = true;
        return acc;
      }, {} as Record<string, boolean>),
      updatedAt: Date.now()
    };

    const skillsData = JSON.stringify(skillsObject);

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

export const deleteSkillCategory = mutation({
  args: {
    username: v.string(),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.username) {
      throw new Error("Username is required");
    }

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

    await ctx.db.delete(existingCategory._id);

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
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const existingSkill = await ctx.db
      .query("skills")
      .withIndex("by_user_category", (q) => 
        q.eq("userId", user._id).eq("category", args.oldCategory)
      )
      .first();

    if (!existingSkill) {
      throw new Error("Skill category not found");
    }

    const skillsObject = {
      skills: args.skills.reduce((acc, skill) => {
        acc[skill.trim()] = true;
        return acc;
      }, {} as Record<string, boolean>),
      updatedAt: Date.now()
    };

    const skillsData = JSON.stringify(skillsObject);

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

    const uniqueSkills = new Set<string>();
    skillCategories.forEach(category => {
      try {
        const skills = JSON.parse(category.skillsData);
        if (Array.isArray(skills)) {
          skills.forEach(skill => uniqueSkills.add(skill));
        }
      } catch {
      }
    });

    return Array.from(uniqueSkills).sort();
  }
});