import { mutation, query } from "./_generated/server";
import { getDefaultStatsData } from "../lib/utils";
import { extractEssentialPlatformData } from "../lib/extractors";

export const migrateProfilesToStatsData = mutation({
  handler: async (ctx) => {
    const profiles = await ctx.db.query("profiles").collect();
    let migrated = 0;
    let failed = 0;

    for (const profile of profiles) {
      try {
        if (profile.statsData) continue;

        const essentialData = await extractEssentialPlatformData(
          profile.platformName,
          profile.platformUsername
        );

        if (essentialData) {
          await ctx.db.patch(profile._id, {
            statsData: JSON.stringify(essentialData)
          });
          migrated++;
        } else {
          await ctx.db.patch(profile._id, {
            statsData: getDefaultStatsData(profile.platformName)
          });
          failed++;
        }
      } catch (error) {
        console.error(`Error migrating profile ${profile._id}:`, error);
        failed++;
        
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

export const updatePlatformDataWithUserId = mutation({
  handler: async (ctx) => {
    const platformDataEntries = await ctx.db.query("platformdata").collect();
    
    for (const entry of platformDataEntries) {
      const profile = await ctx.db.get(entry.profileId);
      
      if (profile) {
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