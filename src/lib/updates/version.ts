import type { InstallableUpdatePlatform } from "./types";

const VERSION_PATTERN = /^v?(\d+)\.(\d+)\.(\d+)$/i;

export function normalizeVersion(version: string): string | null {
  const match = version.trim().match(VERSION_PATTERN);

  if (!match) {
    return null;
  }

  return `${Number(match[1])}.${Number(match[2])}.${Number(match[3])}`;
}

export function compareVersions(left: string, right: string): number {
  const normalizedLeft = normalizeVersion(left);
  const normalizedRight = normalizeVersion(right);

  if (!normalizedLeft || !normalizedRight) {
    throw new Error("Invalid version.");
  }

  const leftParts = normalizedLeft.split(".").map(Number);
  const rightParts = normalizedRight.split(".").map(Number);

  for (let index = 0; index < 3; index += 1) {
    if (leftParts[index] > rightParts[index]) {
      return 1;
    }

    if (leftParts[index] < rightParts[index]) {
      return -1;
    }
  }

  return 0;
}

export function extractPlatformVersion(
  tagName: string,
  platform: InstallableUpdatePlatform
): string | null {
  const prefix = `${platform}-`;

  if (!tagName.startsWith(prefix)) {
    return null;
  }

  return normalizeVersion(tagName.slice(prefix.length));
}
