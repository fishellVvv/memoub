import { describe, expect, it, vi } from "vitest";
import { GITHUB_RELEASES_ENDPOINT, fetchPlatformReleases } from "../lib/updates/github-releases";
import { checkForUpdates } from "../lib/updates/update-checker";
import { compareVersions, extractPlatformVersion, normalizeVersion } from "../lib/updates/version";

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: async () => body
  } as Response;
}

const release = (overrides: Record<string, unknown>) => ({
  tag_name: "android-v1.1.0",
  html_url: "https://github.com/fishellVvv/memoub/releases/tag/android-v1.1.0",
  draft: false,
  prerelease: false,
  assets: [],
  ...overrides
});

describe("update version helpers", () => {
  it("normalizes versions with a leading v", () => {
    expect(normalizeVersion("v1.1.0")).toBe("1.1.0");
  });

  it("compares simple semver versions", () => {
    expect(compareVersions("1.1.0", "1.0.3")).toBeGreaterThan(0);
    expect(compareVersions("1.10.0", "1.9.9")).toBeGreaterThan(0);
    expect(compareVersions("2.0.0", "1.99.99")).toBeGreaterThan(0);
    expect(compareVersions("1.1.0", "1.1.0")).toBe(0);
  });

  it("extracts versions from platform tags", () => {
    expect(extractPlatformVersion("android-v1.1.0", "android")).toBe("1.1.0");
    expect(extractPlatformVersion("windows-v1.1.0", "windows")).toBe("1.1.0");
    expect(extractPlatformVersion("web-v1.1.0", "android")).toBeNull();
    expect(extractPlatformVersion("android-next", "android")).toBeNull();
  });
});

describe("github release normalization", () => {
  it("filters Android releases and selects APK assets case-insensitively", async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse([
        release({
          tag_name: "android-v1.1.0",
          assets: [
            {
              name: "memoub-android-v1.1.0.APK",
              browser_download_url: "https://example.com/memoub.apk"
            }
          ]
        }),
        release({
          tag_name: "windows-v1.1.0",
          html_url: "https://github.com/fishellVvv/memoub/releases/tag/windows-v1.1.0"
        })
      ])
    );

    const releases = await fetchPlatformReleases("android", fetchImpl);

    expect(fetchImpl).toHaveBeenCalledWith(GITHUB_RELEASES_ENDPOINT);
    expect(releases).toEqual([
      {
        platform: "android",
        version: "1.1.0",
        tagName: "android-v1.1.0",
        releaseUrl: "https://github.com/fishellVvv/memoub/releases/tag/android-v1.1.0",
        assetUrl: "https://example.com/memoub.apk"
      }
    ]);
  });

  it("filters Windows releases and selects EXE or MSI assets case-insensitively", async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse([
        release({
          tag_name: "windows-v1.1.0",
          html_url: "https://github.com/fishellVvv/memoub/releases/tag/windows-v1.1.0",
          assets: [
            {
              name: "memoub-windows-v1.1.0-x64-setup.EXE",
              browser_download_url: "https://example.com/memoub.exe"
            }
          ]
        }),
        release({
          tag_name: "android-v1.1.0"
        })
      ])
    );

    const releases = await fetchPlatformReleases("windows", fetchImpl);

    expect(releases).toEqual([
      {
        platform: "windows",
        version: "1.1.0",
        tagName: "windows-v1.1.0",
        releaseUrl: "https://github.com/fishellVvv/memoub/releases/tag/windows-v1.1.0",
        assetUrl: "https://example.com/memoub.exe"
      }
    ]);
  });

  it("ignores drafts, prereleases, and invalid tags without failing", async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse([
        release({ draft: true }),
        release({ prerelease: true }),
        release({ tag_name: "android-next" }),
        release({ tag_name: "android-v1.1.0" })
      ])
    );

    const releases = await fetchPlatformReleases("android", fetchImpl);

    expect(releases.map((item) => item.version)).toEqual(["1.1.0"]);
  });

  it("keeps release URL when no expected asset exists", async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse([
        release({
          tag_name: "android-v1.1.0",
          assets: [
            {
              name: "memoub-notes.txt",
              browser_download_url: "https://example.com/notes.txt"
            }
          ]
        })
      ])
    );

    const releases = await fetchPlatformReleases("android", fetchImpl);

    expect(releases).toEqual([
      {
        platform: "android",
        version: "1.1.0",
        tagName: "android-v1.1.0",
        releaseUrl: "https://github.com/fishellVvv/memoub/releases/tag/android-v1.1.0",
        assetUrl: undefined
      }
    ]);
  });

  it("treats non-ok responses as errors", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ message: "rate limited" }, false, 403));

    await expect(fetchPlatformReleases("android", fetchImpl)).rejects.toThrow(
      "GitHub releases request failed with status 403."
    );
  });
});

describe("checkForUpdates", () => {
  it("selects the latest release by semver instead of response order", async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse([
        release({ tag_name: "android-v1.9.9" }),
        release({ tag_name: "android-v1.10.0" }),
        release({ tag_name: "android-v1.2.0" })
      ])
    );

    const result = await checkForUpdates({
      platform: "android",
      currentVersion: "1.0.0",
      fetchImpl
    });

    expect(result.status).toBe("available");
    expect(result.status === "available" ? result.latestRelease.version : null).toBe("1.10.0");
  });

  it("detects an Android update from 1.0.1 to 1.1.0", async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse([
        release({
          tag_name: "android-v1.1.0",
          assets: [
            {
              name: "memoub-android-v1.1.0.apk",
              browser_download_url: "https://example.com/memoub.apk"
            }
          ]
        })
      ])
    );

    const result = await checkForUpdates({
      platform: "android",
      currentVersion: "1.0.1",
      fetchImpl
    });

    expect(result).toMatchObject({
      status: "available",
      platform: "android",
      currentVersion: "1.0.1",
      latestRelease: {
        version: "1.1.0",
        assetUrl: "https://example.com/memoub.apk"
      }
    });
  });

  it("detects a Windows update from 1.0.3 to 1.1.0", async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse([
        release({
          tag_name: "windows-v1.1.0",
          html_url: "https://github.com/fishellVvv/memoub/releases/tag/windows-v1.1.0",
          assets: [
            {
              name: "memoub-windows-v1.1.0-x64-setup.msi",
              browser_download_url: "https://example.com/memoub.msi"
            }
          ]
        })
      ])
    );

    const result = await checkForUpdates({
      platform: "windows",
      currentVersion: "1.0.3",
      fetchImpl
    });

    expect(result).toMatchObject({
      status: "available",
      platform: "windows",
      currentVersion: "1.0.3",
      latestRelease: {
        version: "1.1.0",
        assetUrl: "https://example.com/memoub.msi"
      }
    });
  });

  it("returns up-to-date when the latest release is the same version", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse([release({ tag_name: "android-v1.1.0" })]));

    const result = await checkForUpdates({
      platform: "android",
      currentVersion: "1.1.0",
      fetchImpl
    });

    expect(result.status).toBe("up-to-date");
  });

  it("returns unsupported for web without calling fetch", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse([]));

    const result = await checkForUpdates({
      platform: "web",
      currentVersion: "1.0.3",
      fetchImpl
    });

    expect(result).toEqual({
      status: "unsupported",
      platform: "web",
      currentVersion: "1.0.3"
    });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("returns error when fetch fails", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error("network down");
    });

    const result = await checkForUpdates({
      platform: "android",
      currentVersion: "1.0.1",
      fetchImpl
    });

    expect(result).toEqual({
      status: "error",
      platform: "android",
      currentVersion: "1.0.1",
      error: "network down"
    });
  });
});
