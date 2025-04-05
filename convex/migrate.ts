import { mutation, query } from "./_generated/server";
import { getDefaultStatsData } from "../lib/utils";
import { extractEssentialPlatformData } from "../lib/extractors";

// Migration function to update existing profiles with statsData
export const migrateProfilesToStatsData = mutation({
  handler: async (ctx) => {
    // Get all profiles
    const profiles = await ctx.db.query("profiles").collect();
    let migrated = 0;
    let failed = 0;

    // Process each profile
    for (const profile of profiles) {
      try {
        // If statsData already exists, skip
        if (profile.statsData) continue;

        // Try to extract fresh data for the profile
        const essentialData = await extractEssentialPlatformData(
          profile.platformName,
          profile.platformUsername
        );

        if (essentialData) {
          // Update profile with fresh data
          await ctx.db.patch(profile._id, {
            statsData: JSON.stringify(essentialData)
          });
          migrated++;
        } else {
          // Use default data if extraction fails
          await ctx.db.patch(profile._id, {
            statsData: getDefaultStatsData(profile.platformName)
          });
          failed++;
        }
      } catch (error) {
        console.error(`Error migrating profile ${profile._id}:`, error);
        failed++;
        
        // Still update with default data to ensure schema compliance
        try {
          await ctx.db.patch(profile._id, {
            statsData: getDefaultStatsData(profile.platformName)
          });
        } catch (e) {
          console.error(`Failed to update profile ${profile._id} with default data:`, e);
        }
      }
    }

    return {
      total: profiles.length,
      migrated,
      failed
    };
  }
});

// Check migration status
export const checkMigrationStatus = query({
  handler: async (ctx) => {
    const profiles = await ctx.db.query("profiles").collect();
    const withStatsData = profiles.filter(p => p.statsData).length;
    
    return {
      total: profiles.length,
      withStatsData,
      needsMigration: profiles.length - withStatsData
    };
  }
});

// Add migration to set userId in platformdata table
export const updatePlatformDataWithUserId = mutation({
  handler: async (ctx) => {
    // Get all platformdata entries
    const platformDataEntries = await ctx.db.query("platformdata").collect();
    
    // For each entry, find the related profile and add the userId
    for (const entry of platformDataEntries) {
      // Get the profile
      const profile = await ctx.db.get(entry.profileId);
      
      if (profile) {
        // Update the platformdata entry
        await ctx.db.patch(entry._id, {
          userId: profile.userId,
          lastUpdated: entry.lastUpdated || Date.now()
        });
      }
    }
    
    return {
      entriesUpdated: platformDataEntries.length
    };
  }
}); 