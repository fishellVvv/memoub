import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const releaseAssetsDir = path.join(repoRoot, "release-assets");
const packageJsonPath = path.join(repoRoot, "package.json");
const androidBuildGradlePath = path.join(
  repoRoot,
  "android",
  "app",
  "build.gradle",
);

function parseAndroidVersionName(buildGradleContent) {
  const versionNameMatch = buildGradleContent.match(/versionName\s+"([^"]+)"/);
  if (!versionNameMatch) {
    throw new Error("No pude encontrar versionName en android/app/build.gradle.");
  }

  return versionNameMatch[1].trim();
}

async function ensureFileExists(filePath, label) {
  try {
    await fs.access(filePath);
  } catch {
    throw new Error(`No encuentro ${label} en ${path.relative(repoRoot, filePath)}.`);
  }
}

async function clearPreviousArtifacts(directory) {
  try {
    const entries = await fs.readdir(directory);
    await Promise.all(
      entries
        .filter((entry) => entry.startsWith("memoub-"))
        .map((entry) => fs.unlink(path.join(directory, entry))),
    );
  } catch {
    // If the folder doesn't exist yet, there is nothing to clean.
  }
}

async function main() {
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf8"));
  const windowsVersion = String(packageJson.version).trim();
  const androidBuildGradle = await fs.readFile(androidBuildGradlePath, "utf8");
  const androidVersion = parseAndroidVersionName(androidBuildGradle);

  const androidSource = path.join(
    repoRoot,
    "android",
    "app",
    "build",
    "outputs",
    "apk",
    "release",
    "app-release.apk",
  );
  const windowsSource = path.join(
    repoRoot,
    "src-tauri",
    "target",
    "release",
    "bundle",
    "nsis",
    `memoub_${windowsVersion}_x64-setup.exe`,
  );

  await ensureFileExists(androidSource, "la APK release de Android");
  await ensureFileExists(windowsSource, "el instalador release de Windows");

  await fs.mkdir(releaseAssetsDir, { recursive: true });
  await clearPreviousArtifacts(releaseAssetsDir);

  const androidTarget = path.join(
    releaseAssetsDir,
    `memoub-android-v${androidVersion}.apk`,
  );
  const windowsTarget = path.join(
    releaseAssetsDir,
    `memoub-windows-v${windowsVersion}-x64-setup.exe`,
  );

  await fs.copyFile(androidSource, androidTarget);
  await fs.copyFile(windowsSource, windowsTarget);

  console.log("Artefactos preparados en release-assets:");
  console.log(`- ${path.relative(repoRoot, androidTarget)}`);
  console.log(`- ${path.relative(repoRoot, windowsTarget)}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
