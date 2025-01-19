import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  handler: async (ctx) => {
    return [
      { 
        id: "1", 
        title: "Demo Project", 
        description: "This is a demo project",
        projectLink: "https://github.com",
        deployLink: "https://demo.com",
        techStack: ["React", "Node.js"],
      }
    ];
  },
});

export const add = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    techStack: v.array(v.string()),
    projectLink: v.optional(v.string()),
    deployLink: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return {
      id: Date.now().toString(),
      ...args
    };
  },
});

export const remove = mutation({
  args: {
    id: v.string(),
  },
  handler: async (ctx, args) => {
    return { success: true };
  },
}); 