import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  handler: async (ctx) => {
    return [
      { id: "1", title: "Demo Project 1", description: "This is a demo project" },
      { id: "2", title: "Demo Project 2", description: "Another demo project" },
    ];
  },
});

export const add = mutation({
  args: {
    title: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    return {
      id: Date.now().toString(),
      title: args.title,
      description: args.description,
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