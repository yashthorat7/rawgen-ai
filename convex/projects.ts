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
    console.log('Getting projects for username:', args.username);

    // Get user by username
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (!user) {
      console.log('User not found');
      return [];
    }

    console.log('Found user:', user._id);

    // Get all projects for the user
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    console.log('Found projects:', projects);

    // Get storage URLs for all projects with images
    const projectsWithUrls = await Promise.all(
      projects.map(async (project) => {
        let imageUrl;
        console.log('Project image data:', project.projectImage);
        if (project.projectImage) {
          imageUrl = await ctx.storage.getUrl(project.projectImage);
          console.log('Generated image URL:', imageUrl);
        }

        return {
          id: project._id,
          title: project.projectName,
          description: project.projectDescription,
          projectLink: project.projectLink,
          deployLink: project.deployLink,
          techStack: JSON.parse(project.techStack),
          image: imageUrl,
          order: project.order,
        };
      })
    );

    console.log('Projects with URLs:', projectsWithUrls);
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
    console.log('Adding project:', args);

    // Get user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      console.log('User not found:', args.email);
      throw new Error("User not found");
    }

    console.log('Found user:', user._id);

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

    console.log('Project added:', projectId);

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
    // Get the project
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Delete the project
    await ctx.db.delete(args.projectId);

    // Return success without any circular references
    return { success: true };
  },
}); 