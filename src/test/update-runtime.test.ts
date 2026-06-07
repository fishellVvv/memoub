import { describe, expect, it } from "vitest";
import { FALLBACK_APP_VERSION, getCurrentAppVersion } from "../lib/app-version";
import { isSafeExternalUrl } from "../lib/external-url";
import { getUpdateUrl } from "../lib/updates/get-update-url";
import type { NormalizedRelease, UpdateCheckResult } from "../lib/updates/types";

const availableResult = (overrides: Partial<NormalizedRelease> = {}) =>
  ({
    status: "available",
    platform: "android",
    currentVersion: "1.0.1",
    latestRelease: {
      platform: "android",
      version: "1.1.0",
      tagName: "android-v1.1.0",
      releaseUrl: "https://github.com/fishellVvv/memoub/releases/tag/android-v1.1.0",
      ...overrides
    }
  }) satisfies UpdateCheckResult;

describe("getUpdateUrl", () => {
  it("returns null when no update is available", () => {
    expect(
      getUpdateUrl({
        status: "up-to-date",
        platform: "android",
        currentVersion: "1.1.0"
      })
    ).toBeNull();
  });

  it("prefers asset URL over release URL", () => {
    expect(
      getUpdateUrl(
        availableResult({
          assetUrl: "https://github.com/fishellVvv/memoub/releases/download/android-v1.1.0/app.apk"
        })
      )
    ).toBe("https://github.com/fishellVvv/memoub/releases/download/android-v1.1.0/app.apk");
  });

  it("falls back to release URL when there is no asset URL", () => {
    expect(getUpdateUrl(availableResult())).toBe(
      "https://github.com/fishellVvv/memoub/releases/tag/android-v1.1.0"
    );
  });
});

describe("external URL validation", () => {
  it("accepts valid https URLs", () => {
    expect(isSafeExternalUrl("https://github.com/fishellVvv/memoub/releases")).toBe(true);
  });

  it("rejects empty, http, javascript, and trimmed-mutating URLs", () => {
    expect(isSafeExternalUrl("")).toBe(false);
    expect(isSafeExternalUrl("http://github.com/fishellVvv/memoub/releases")).toBe(false);
    expect(isSafeExternalUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeExternalUrl(" https://github.com/fishellVvv/memoub/releases")).toBe(false);
  });
});

describe("getCurrentAppVersion", () => {
  it("uses the controlled fallback for web", async () => {
    await expect(getCurrentAppVersion("web")).resolves.toBe(FALLBACK_APP_VERSION);
  });
});
