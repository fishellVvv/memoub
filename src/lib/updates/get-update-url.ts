import type { UpdateCheckResult } from "./types";

export function getUpdateUrl(result: UpdateCheckResult): string | null {
  if (result.status !== "available") {
    return null;
  }

  return result.latestRelease.assetUrl ?? result.latestRelease.releaseUrl;
}
