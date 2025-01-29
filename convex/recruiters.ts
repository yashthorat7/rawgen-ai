import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { ConvexError } from "convex/values";

// Password validation function
function isValidPassword(password: string) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
        return { isValid: false, message: "Password must be at least 8 characters long" };
    }
    if (!hasUpperCase || !hasLowerCase) {
        return { isValid: false, message: "Password must contain both uppercase and lowercase letters" };
    }
    if (!hasNumbers) {
        return { isValid: false, message: "Password must contain at least one number" };
    }
    if (!hasSpecialChar) {
        return { isValid: false, message: "Password must contain at least one special character" };
    }

    return { isValid: true, message: "" };
}

export const verify = mutation({
    args: {
        email: v.string(),
        password: v.string(),
    },
    handler: async (ctx, args) => {
        // First check if email exists
        const recruiter = await ctx.db
            .query("recruiters")
            .filter((q) => q.eq(q.field("email"), args.email))
            .first();

        if (!recruiter) {
            return { success: false, message: "Email not found" };
        }

        // Then check password
        if (recruiter.password !== args.password) {
            return { success: false, message: "Incorrect password" };
        }

        return { 
            success: true, 
            data: recruiter,
            message: "Login successful" 
        };
    },
});

export const getByEmail = query({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const recruiter = await ctx.db
            .query("recruiters")
            .filter((q) => q.eq(q.field("email"), args.email))
            .first();
        return recruiter;
    },
});

export const create = mutation({
    args: {
        email: v.string(),
        firstName: v.string(),
        lastName: v.string(),
        password: v.string(),
        markstar: v.array(v.string()),
        isPermitted: v.boolean(),
        recruiterImage: v.optional(v.union(v.string(), v.null())),
    },
    handler: async (ctx, args) => {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(args.email)) {
            return { success: false, message: "Invalid email format" };
        }

        // Validate password
        const passwordValidation = isValidPassword(args.password);
        if (!passwordValidation.isValid) {
            return { success: false, message: passwordValidation.message };
        }

        // Check if recruiter already exists
        const existing = await ctx.db
            .query("recruiters")
            .filter((q) => q.eq(q.field("email"), args.email))
            .first();

        if (existing) {
            return { success: false, message: "Email already registered" };
        }

        try {
            // Create new recruiter
            const recruiterId = await ctx.db.insert("recruiters", {
                email: args.email,
                firstName: args.firstName,
                lastName: args.lastName,
                password: args.password,
                markstar: args.markstar,
                isPermitted: args.isPermitted,
                ...(args.recruiterImage && { recruiterImage: args.recruiterImage as Id<"_storage"> }),
            });

            return { 
                success: true, 
                data: recruiterId,
                message: "Registration successful" 
            };
        } catch (error) {
            return { 
                success: false, 
                message: "Failed to create account. Please try again." 
            };
        }
    },
}); 
