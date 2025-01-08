import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // Table for platform profiles
    profiles: defineTable({
        email: v.string(),
        username: v.string(),
        platform: v.string(),  // Made required since each profile needs a platform
        order: v.number(),     // Made required for consistent ordering
    }).index("by_email", ["email"]),

    // Table for user settings/preferences
    userSettings: defineTable({
        email: v.string(),
        profileImage: v.optional(v.string()),
    }).index("by_email", ["email"]),
});