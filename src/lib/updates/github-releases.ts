import type { FetchImpl, InstallableUpdatePlatform, NormalizedRelease } from "./types";
import { extractPlatformVersion } from "./version";

export const GITHUB_RELEASES_ENDPOINT = "https://api.github.com/repos/fishellVvv/memoub/releases";

type GitHubReleaseAsset = {
  name?: unknown;
  browser_download_url?: unknown;
};

type GitHubRelease = {
  tag_name?: unknown;
  html_url?: unknown;
  draft?: unknown;
  prerelease?: unknown;
  assets?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toGitHubRelease(value: unknown): GitHubRelease | null {
  return isRecord(value) ? value : null;
}

function toGitHubReleaseAssets(value: unknown): GitHubReleaseAsset[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isRecord);
}

function getDefaultFetch(): FetchImpl {
  if (typeof globalThis.fetch !== "function") {
    throw new Error("Fetch is not available.");
  }

  return globalThis.fetch.bind(globalThis);
}

function getPreferredAssetUrl(
  assets: GitHubReleaseAsset[],
  platform: InstallableUpdatePlatform
): string | undefined {
  const allowedExtensions = platform === "android" ? [".apk"] : [".exe", ".msi"];
  const preferredAsset = assets.find((asset) => {
    if (typeof asset.name !== "string" || typeof asset.browser_download_url !== "string") {
      return false;
    }

    const assetName = asset.name.toLowerCase();
    return allowedExtensions.some((extension) => assetName.endsWith(extension));
  });

  return typeof preferredAsset?.browser_download_url === "string"
    ? preferredAsset.browser_download_url
    : undefined;
}

export function normalizeGitHubReleases(
  releases: unknown,
  platform: InstallableUpdatePlatform
): NormalizedRelease[] {
  if (!Array.isArray(releases)) {
    throw new Error("GitHub releases response is not an array.");
  }

  return releases.flatMap((releaseItem) => {
    const release = toGitHubRelease(releaseItem);

    if (!release) {
      return [];
    }

    if (release.draft === true || release.prerelease === true) {
      return [];
    }

    if (typeof release.tag_name !== "string" || typeof release.html_url !== "string") {
      return [];
    }

    const version = extractPlatformVersion(release.tag_name, platform);

    if (!version) {
      return [];
    }

    return [
      {
        platform,
        version,
        tagName: release.tag_name,
        releaseUrl: release.html_url,
        assetUrl: getPreferredAssetUrl(toGitHubReleaseAssets(release.assets), platform)
      }
    ];
  });
}

export async function fetchPlatformReleases(
  platform: InstallableUpdatePlatform,
  fetchImpl: FetchImpl = getDefaultFetch()
): Promise<NormalizedRelease[]> {
  const response = await fetchImpl(GITHUB_RELEASES_ENDPOINT);

  if (!response.ok) {
    throw new Error(`GitHub releases request failed with status ${response.status}.`);
  }

  return normalizeGitHubReleases(await response.json(), platform);
}
