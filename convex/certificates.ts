import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveImage = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return { storageId: args.storageId };
  },
});

export const get = query({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    console.log('Getting certificates for username:', args.username);

    // Get user by username
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (!user) {
      console.log('User not found');
      return [];
    }

    // Get all certificates for the user
    const certificates = await ctx.db
      .query("certificates")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Get storage URLs for all certificates with images
    const certificatesWithUrls = await Promise.all(
      certificates.map(async (certificate) => {
        let imageUrl;
        if (certificate.certificateImage) {
          imageUrl = await ctx.storage.getUrl(certificate.certificateImage);
        }

        return {
          id: certificate._id,
          title: certificate.certificateTitle,
          category: certificate.category,
          description: certificate.description,
          image: imageUrl,
          order: certificate.order,
        };
      })
    );

    return certificatesWithUrls;
  },
});

export const add = mutation({
  args: {
    email: v.string(),
    title: v.string(),
    category: v.string(),
    description: v.string(),
    certificateImage: v.optional(v.id("_storage")),
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

    // Get current highest order
    const certificates = await ctx.db
      .query("certificates")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    
    const order = certificates.length;

    // Insert new certificate
    const certificateId = await ctx.db.insert("certificates", {
      userId: user._id,
      order,
      certificateTitle: args.title,
      category: args.category,
      description: args.description,
      certificateImage: args.certificateImage,
    });

    // Get the URL for the image if it exists
    let imageUrl;
    if (args.certificateImage) {
      imageUrl = await ctx.storage.getUrl(args.certificateImage);
    }

    return {
      id: certificateId,
      title: args.title,
      category: args.category,
      description: args.description,
      image: imageUrl,
      order,
    };
  },
});

export const remove = mutation({
  args: {
    certificateId: v.id("certificates"),
  },
  handler: async (ctx, args) => {
    const certificate = await ctx.db.get(args.certificateId);
    if (!certificate) {
      throw new Error("Certificate not found");
    }

    await ctx.db.delete(args.certificateId);
    return { success: true };
  },
}); 