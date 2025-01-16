import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    profiles: defineTable({
        email: v.string(),
        platform: v.string(),
        username: v.string(),
        order: v.number(),
        data: v.optional(v.string()),
    })
        .index("by_email", ["email"])
        .index("by_email_platform", ["email", "platform"])
        .index("by_platform_username", ["platform", "username"]),

    userSettings: defineTable({
        email: v.string(),
        profileImage: v.optional(v.id("_storage")),
    }).index("by_email", ["email"]),

    documents: defineTable({
        title: v.string(),
        url: v.string(),
    }),
});