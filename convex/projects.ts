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

export const update = mutation({
  args: {
    projectId: v.id("projects"),
    email: v.string(),
    title: v.string(),
    description: v.string(),
    projectLink: v.string(),
    deployLink: v.optional(v.string()),
    techStack: v.string(),
    projectImage: v.optional(v.union(v.id("_storage"), v.null())),
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

    // Get the existing project and verify ownership
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    if (project.userId !== user._id) {
      throw new Error("Unauthorized to update this project");
    }

    // Handle image deletion/update
    if (args.projectImage !== undefined && project.projectImage) {
      // If new image is null or different from existing image, delete the old one
      if (!args.projectImage || args.projectImage !== project.projectImage) {
        await ctx.storage.delete(project.projectImage);
      }
    }

    // Prepare update data
    const updateData: any = {
      projectName: args.title,
      projectDescription: args.description,
      projectLink: args.projectLink,
      deployLink: args.deployLink,
      techStack: args.techStack,
    };

    // Only update image if a new one is provided or explicitly set to null
    if (args.projectImage !== undefined) {
      updateData.projectImage = args.projectImage;
    }

    // Update the project with new data
    await ctx.db.patch(args.projectId, updateData);

    // Get the updated project
    const updatedProject = await ctx.db.get(args.projectId);
    if (!updatedProject) {
      throw new Error("Failed to get updated project");
    }

    // Get the image URL if it exists
    let imageUrl;
    if (updatedProject.projectImage) {
      imageUrl = await ctx.storage.getUrl(updatedProject.projectImage);
    }

    // Return the updated project data
    return {
      id: updatedProject._id,
      title: updatedProject.projectName,
      description: updatedProject.projectDescription,
      projectLink: updatedProject.projectLink,
      deployLink: updatedProject.deployLink,
      techStack: JSON.parse(updatedProject.techStack || "[]"),
      image: imageUrl,
    };
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

    // Get all projects for the user
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Sort projects by order before returning
    const projectsWithUrls = await Promise.all(
      projects
        .sort((a, b) => a.order - b.order)
        .map(async (project) => {
          let imageUrl;
          if (project.projectImage) {
            imageUrl = await ctx.storage.getUrl(project.projectImage);
          }

          return {
            id: project._id,
            title: project.projectName,
            description: project.projectDescription,
            projectLink: project.projectLink,
            deployLink: project.deployLink,
            techStack: JSON.parse(project.techStack || "[]"),
            image: imageUrl,
            order: project.order,
          };
        })
    );

    return projectsWithUrls;
  },
});

export const add = mutation({
  args: {
    email: v.string(),
    title: v.string(),
    description: v.string(),
    projectLink: v.string(),
    deployLink: v.optional(v.string()),
    techStack: v.array(v.string()),
    projectImage: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    // Get user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) throw new Error("User not found");

    // Get current highest order
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    
    const order = projects.length;

    // Insert new project
    const projectId = await ctx.db.insert("projects", {
      userId: user._id,
      order,
      projectName: args.title,
      projectDescription: args.description,
      projectLink: args.projectLink,
      deployLink: args.deployLink,
      techStack: JSON.stringify(args.techStack),
      projectImage: args.projectImage,
    });

    // Get the URL for the image if it exists
    let imageUrl;
    if (args.projectImage) {
      imageUrl = await ctx.storage.getUrl(args.projectImage);
    }

    return {
      id: projectId,
      title: args.title,
      description: args.description,
      projectLink: args.projectLink,
      deployLink: args.deployLink,
      techStack: args.techStack,
      image: imageUrl,
      order,
    };
  },
});

export const remove = mutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    // Get the project first
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // If project has an image, delete it from storage
    if (project.projectImage) {
      await ctx.storage.delete(project.projectImage);
    }

    // Delete the project
    await ctx.db.delete(args.projectId);

    return { success: true };
  },
});

export const reorder = mutation({
  args: {
    email: v.string(),
    updates: v.array(v.object({
      projectId: v.id("projects"),
      order: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Update all projects in a single transaction
    await Promise.all(
      args.updates.map(update => 
        ctx.db.patch(update.projectId, { order: update.order })
      )
    );

    return { success: true };
  },
}); 