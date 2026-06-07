import { fetchPlatformReleases } from "./github-releases";
import type {
  FetchImpl,
  InstallableUpdatePlatform,
  NormalizedRelease,
  UpdateCheckResult,
  UpdatePlatform
} from "./types";
import { compareVersions, normalizeVersion } from "./version";

type CheckForUpdatesOptions = {
  platform: UpdatePlatform;
  currentVersion: string;
  fetchImpl?: FetchImpl;
};

function selectLatestRelease(releases: NormalizedRelease[]): NormalizedRelease | undefined {
  return releases.reduce<NormalizedRelease | undefined>((latestRelease, release) => {
    if (!latestRelease || compareVersions(release.version, latestRelease.version) > 0) {
      return release;
    }

    return latestRelease;
  }, undefined);
}

export async function checkForUpdates({
  platform,
  currentVersion,
  fetchImpl
}: CheckForUpdatesOptions): Promise<UpdateCheckResult> {
  if (platform === "web") {
    return {
      status: "unsupported",
      platform,
      currentVersion
    };
  }

  const installablePlatform: InstallableUpdatePlatform = platform;

  try {
    const normalizedCurrentVersion = normalizeVersion(currentVersion);

    if (!normalizedCurrentVersion) {
      throw new Error("Current version is invalid.");
    }

    const releases = await fetchPlatformReleases(installablePlatform, fetchImpl);
    const latestRelease = selectLatestRelease(releases);

    if (latestRelease && compareVersions(latestRelease.version, normalizedCurrentVersion) > 0) {
      return {
        status: "available",
        platform: installablePlatform,
        currentVersion: normalizedCurrentVersion,
        latestRelease
      };
    }

    return {
      status: "up-to-date",
      platform: installablePlatform,
      currentVersion: normalizedCurrentVersion,
      latestRelease
    };
  } catch (error) {
    return {
      status: "error",
      platform,
      currentVersion,
      error: error instanceof Error ? error.message : "Unknown update check error."
    };
  }
}
