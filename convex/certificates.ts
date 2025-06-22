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
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (!user) return [];

    const certificates = await ctx.db
      .query("certificates")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

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
        }),
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

    const existingCertificates = await ctx.db
      .query("certificates")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const order = existingCertificates.length;

    const certificateId = await ctx.db.insert("certificates", {
      userId: user._id,
      certificateTitle: args.title,
      category: args.category,
      description: args.description,
      certificateImage: args.certificateImage,
      order,
    });

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

    const existingCertificate = await ctx.db.get(args.certificateId);
    if (!existingCertificate) throw new Error("Certificate not found");

    if (existingCertificate.userId !== user._id) {
      throw new Error("Unauthorized to update this certificate");
    }

    if (
      args.certificateImage &&
      existingCertificate.certificateImage &&
      args.certificateImage !== existingCertificate.certificateImage
    ) {
      await ctx.storage.delete(existingCertificate.certificateImage);
    }

    await ctx.db.patch(args.certificateId, {
      certificateTitle: args.title,
      category: args.category,
      description: args.description,
      certificateImage:
        args.certificateImage ?? existingCertificate.certificateImage,
    });

    let imageUrl = null;
    const imageId =
      args.certificateImage ?? existingCertificate.certificateImage;
    if (imageId) {
      imageUrl = await ctx.storage.getUrl(imageId);
    }

    return {
      id: args.certificateId,
      title: args.title,
      category: args.category,
      description: args.description,
      image: imageUrl,
      certificateImage: imageId,
      order: existingCertificate.order,
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

    if (certificate.certificateImage) {
      await ctx.storage.delete(certificate.certificateImage);
    }

    await ctx.db.delete(args.certificateId);
    return { success: true };
  },
});

export const reorder = mutation({
  args: {
    email: v.string(),
    updates: v.array(
      v.object({
        certificateId: v.id("certificates"),
        order: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) throw new Error("User not found");

    await Promise.all(
      args.updates.map((update) =>
        ctx.db.patch(update.certificateId, { order: update.order }),
      ),
    );

    return { success: true };
  },
});
