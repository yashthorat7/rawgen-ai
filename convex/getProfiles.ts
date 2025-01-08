import { query } from "./_generated/server";

export const getProfiles = query(async ({ db }) => {
  return await db
    .query("profiles")
    .collect();
}); 