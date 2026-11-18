import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import packageInfo from '../../package.json';

let cachedVersion: string = '';

/**
 * Automatically resolves the latest version code for the application:
 * 1. Checks NEXT_PUBLIC_APP_VERSION env var
 * 2. Checks latest Git commit message (e.g. "Initial Testing 3.0.1.10" -> "3.0.1.10")
 * 3. Checks latest Git tag
 * 4. Falls back to package.json version
 */
export function getAppVersion(): string {
  if (cachedVersion) {
    return cachedVersion;
  }

  // 1. Environment variable override
  if (process.env.NEXT_PUBLIC_APP_VERSION) {
    cachedVersion = process.env.NEXT_PUBLIC_APP_VERSION.trim().replace(/^v/, '');
    return cachedVersion;
  }

  // 2. Check latest Git commit message
  try {
    const gitLog = execSync('git log -1 --pretty=%B', {
      encoding: 'utf8',
      timeout: 1000,
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim();

    const match = gitLog.match(/\b\d+\.\d+\.\d+(?:\.\d+)?\b/);
    if (match && match[0]) {
      cachedVersion = match[0];
      return cachedVersion;
    }
  } catch {
    // Git unavailable in container or runtime
  }

  // 3. Check latest Git tag
  try {
    const gitTag = execSync('git describe --tags --abbrev=0', {
      encoding: 'utf8',
      timeout: 1000,
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim().replace(/^v/, '');

    if (gitTag) {
      cachedVersion = gitTag;
      return cachedVersion;
    }
  } catch {
    // Ignore git tag failure
  }

  // 4. Read directly from package.json
  try {
    const pkgPath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      if (pkg?.version && typeof pkg.version === 'string') {
        cachedVersion = pkg.version;
        return cachedVersion;
      }
    }
  } catch {
    // Ignore file read failure
  }

  cachedVersion = (packageInfo as { version?: string })?.version || '3.0.1.10';
  return cachedVersion;
}
