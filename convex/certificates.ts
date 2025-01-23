import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const storeImage = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return { success: true };
  },
});

export const get = query({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    // Get user by username
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (!user) return [];

    // Get all certificates and sort by order
    const certificates = await ctx.db
      .query("certificates")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Get storage URLs and map data
    const certificatesWithUrls = await Promise.all(
      certificates
        .sort((a, b) => a.order - b.order)
        .map(async (certificate) => {
          let imageUrl = null;
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
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) throw new Error("User not found");

    // Get current highest order
    const certificates = await ctx.db
      .query("certificates")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    
    const order = certificates.length;

    // Insert new certificate
    const certificateId = await ctx.db.insert("certificates", {
      userId: user._id,
      certificateTitle: args.title,
      category: args.category,
      description: args.description,
      certificateImage: args.certificateImage,
      order,
    });

    // Get image URL if exists
    let imageUrl = null;
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

export const update = mutation({
  args: {
    certificateId: v.id("certificates"),
    email: v.string(),
    title: v.string(),
    category: v.string(),
    description: v.string(),
    certificateImage: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) throw new Error("User not found");

    // Get existing certificate to preserve order
    const existingCertificate = await ctx.db.get(args.certificateId);
    if (!existingCertificate) throw new Error("Certificate not found");

    // Update certificate
    await ctx.db.patch(args.certificateId, {
      certificateTitle: args.title,
      category: args.category,
      description: args.description,
      certificateImage: args.certificateImage,
      order: existingCertificate.order,
    });

    // Get image URL if exists
    let imageUrl = null;
    if (args.certificateImage) {
      imageUrl = await ctx.storage.getUrl(args.certificateImage);
    }

    return {
      id: args.certificateId,
      title: args.title,
      category: args.category,
      description: args.description,
      image: imageUrl,
      order: existingCertificate.order,
    };
  },
});

export const reorder = mutation({
  args: {
    email: v.string(),
    updates: v.array(v.object({
      certificateId: v.id("certificates"),
      order: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) throw new Error("User not found");

    // Update all certificates in parallel
    await Promise.all(
      args.updates.map(update => 
        ctx.db.patch(update.certificateId, { order: update.order })
      )
    );

    return { success: true };
  },
});

export const remove = mutation({
  args: {
    certificateId: v.id("certificates"),
  },
  handler: async (ctx, args) => {
    const certificate = await ctx.db.get(args.certificateId);
    if (!certificate) {
      return { success: false, error: "Certificate not found" };
    }

    await ctx.db.delete(args.certificateId);
    return { success: true };
  },
}); 