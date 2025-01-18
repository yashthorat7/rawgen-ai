import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        email: v.string(),
        username: v.string(),
        firstName: v.optional(v.string()),
        lastName: v.optional(v.string()),
        profileViews: v.optional(v.number()),
        stars: v.optional(v.number()),
        isverified: v.optional(v.boolean()),
        cgpa: v.optional(v.float64()),
        profileImage: v.optional(v.id("_storage")),
        marksheetImage: v.optional(v.id("_storage")),
    })
        .index("by_email", ["email"])
        .index("by_username", ["username"]),

    profiles: defineTable({
        username: v.string(),
        platformName: v.string(),
        platformUsername: v.string(),
        platformCacheData: v.optional(v.string()), // JSON data stored as string
        order: v.number(),
    })
        .index("by_username", ["username"])
        .index("by_platform", ["platformName", "platformUsername"]),

    skills: defineTable({
        username: v.string(),
        category: v.string(),
        skills: v.array(v.string()),
    })
        .index("by_username", ["username"])
        .index("by_category", ["category"]),
});