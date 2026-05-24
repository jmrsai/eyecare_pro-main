const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");
const fs = require("fs");

const config = getDefaultConfig(__dirname);

// Register .tflite extension for asset bundling
config.resolver.assetExts.push("tflite");

/**
 * UNIVERSAL FIX: Auto-detect and resolve ANY package that ships TypeScript
 * source in its `main` or `react-native` field (src/*.ts) without
 * pre-compiling it — a systemic issue with many Expo/RN packages.
 *
 * Affected packages found so far:
 *   react-native-reanimated, react-native-gesture-handler,
 *   react-native-screens, expo-modules-core
 *
 * Strategy: intercept package-level imports, check if main/react-native
 * field starts with "src/", and if so redirect to the compiled lib/ entry.
 */

const resolvedPkgCache = new Map();

function findCompiledEntry(pkgDir, pkg) {
  const candidates = [
    // CommonJS (most reliable for Metro)
    path.join(pkgDir, "lib", "commonjs", "index.js"),
    // ESM
    path.join(pkgDir, "lib", "module", "index.js"),
    // lib root
    path.join(pkgDir, "lib", "index.js"),
    // main if it doesn't point to src/
    pkg["main"] && !String(pkg["main"]).startsWith("src/")
      ? path.join(pkgDir, pkg["main"])
      : null,
  ].filter(Boolean);

  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

const originalResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Only intercept package-level imports (not relative/absolute paths)
  if (!moduleName.startsWith(".") && !moduleName.startsWith("/")) {
    try {
      // Determine the top-level package name
      const parts = moduleName.split("/");
      const pkgName = parts[0].startsWith("@") ? parts[0] + "/" + parts[1] : parts[0];

      let pkgPath;
      if (resolvedPkgCache.has(pkgName + ":path")) {
        pkgPath = resolvedPkgCache.get(pkgName + ":path");
      } else {
        pkgPath = require.resolve(pkgName + "/package.json", {
          paths: [path.dirname(context.originModulePath), __dirname],
        });
        resolvedPkgCache.set(pkgName + ":path", pkgPath);
      }

      if (!pkgPath) throw new Error("no pkg path");

      const pkgDir = path.dirname(pkgPath);

      let pkg;
      if (resolvedPkgCache.has(pkgName + ":pkg")) {
        pkg = resolvedPkgCache.get(pkgName + ":pkg");
      } else {
        pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
        resolvedPkgCache.set(pkgName + ":pkg", pkg);
      }

      // Check if react-native or main field points to uncompiled src/
      const rnField = typeof pkg["react-native"] === "string" ? pkg["react-native"] : null;
      const mainField = typeof pkg["main"] === "string" ? pkg["main"] : null;
      const isBroken =
        (rnField && rnField.startsWith("src/")) ||
        (mainField && mainField.startsWith("src/"));

      if (isBroken) {
        const cacheKey = pkgName + ":compiled";
        let compiledEntry;
        if (resolvedPkgCache.has(cacheKey)) {
          compiledEntry = resolvedPkgCache.get(cacheKey);
        } else {
          compiledEntry = findCompiledEntry(pkgDir, pkg);
          resolvedPkgCache.set(cacheKey, compiledEntry);
        }

        if (compiledEntry) {
          // Sub-path import (e.g. 'react-native-screens/native')
          if (parts.length > (pkgName.includes("/") ? 2 : 1)) {
            const subPath = parts.slice(pkgName.includes("/") ? 2 : 1).join("/");
            const sub = path.join(pkgDir, "lib", "commonjs", subPath + ".js");
            if (fs.existsSync(sub)) return { type: "sourceFile", filePath: sub };
          }
          return { type: "sourceFile", filePath: compiledEntry };
        }
      }
    } catch (_) {
      // Package not found — fall through to default
    }
  }

  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./styles/global.css" });
