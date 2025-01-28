import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        email: v.string(),
        username: v.string(),
        firstName: v.optional(v.string()),
        lastName: v.optional(v.string()),
        isverified: v.optional(v.boolean()),
        cgpa: v.optional(v.float64()),
        profileImage: v.optional(v.id("_storage")),
        marksheetImage: v.optional(v.id("_storage")),
        madeStars: v.optional(v.array(v.string())),
    })
        .index("by_email", ["email"])
        .index("by_username", ["username"]),

    counters: defineTable({
        userId: v.id("users"),
        profileViews: v.optional(v.number()),
        gotStars: v.optional(v.array(v.string())),
        socialLinks: v.optional(v.string()),
    })
        .index("by_user", ["userId"]),

    profiles: defineTable({
        userId: v.id("users"),  // Reference to users table by ID
        platformName: v.string(),
        platformUsername: v.string(),
        platformCacheData: v.optional(v.string()), // JSON data stored as string
        order: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_platform", ["platformName", "platformUsername"]),

    skills: defineTable({
        userId: v.id("users"),
        category: v.string(),
        skillsData: v.string(), // JSON string containing skills data
        order: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_user_category", ["userId", "category"])
        .index("by_order", ["order"]),

    projects: defineTable({
        userId: v.id("users"),
        order: v.number(),
        projectName: v.string(),
        projectDescription: v.string(),
        projectLink: v.string(),
        deployLink: v.optional(v.string()),
        techStack: v.string(), // JSON stringified array
        projectImage: v.optional(v.id("_storage")),
    })
        .index("by_user", ["userId"])
        .index("by_order", ["order"]),

    certificates: defineTable({
        userId: v.id("users"),
        order: v.number(),
        certificateTitle: v.string(),
        category: v.string(),
        description: v.string(),
        certificateImage: v.optional(v.id("_storage")),
    })
        .index("by_user", ["userId"])
        .index("by_order", ["order"]),
});