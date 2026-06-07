export type UpdatePlatform = "android" | "windows" | "web";

export type InstallableUpdatePlatform = Exclude<UpdatePlatform, "web">;

export type UpdateCheckStatus = "available" | "up-to-date" | "unsupported" | "error";

export type FetchImpl = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export type NormalizedRelease = {
  platform: InstallableUpdatePlatform;
  version: string;
  tagName: string;
  releaseUrl: string;
  assetUrl?: string;
};

export type UpdateCheckResult =
  | {
      status: "available";
      platform: InstallableUpdatePlatform;
      currentVersion: string;
      latestRelease: NormalizedRelease;
    }
  | {
      status: "up-to-date";
      platform: InstallableUpdatePlatform;
      currentVersion: string;
      latestRelease?: NormalizedRelease;
    }
  | {
      status: "unsupported";
      platform: "web";
      currentVersion: string;
    }
  | {
      status: "error";
      platform: UpdatePlatform;
      currentVersion: string;
      error: string;
    };
