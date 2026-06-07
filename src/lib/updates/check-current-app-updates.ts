import { getUpdatePlatform } from "../app-platform";
import { getCurrentAppVersion } from "../app-version";
import { checkForUpdates } from "./update-checker";
import type { UpdateCheckResult } from "./types";

export async function checkCurrentAppUpdates(): Promise<UpdateCheckResult> {
  const platform = getUpdatePlatform();
  const currentVersion = await getCurrentAppVersion(platform);

  return checkForUpdates({
    platform,
    currentVersion
  });
}
