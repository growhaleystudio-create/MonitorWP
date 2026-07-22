import axios from 'axios';

export interface SystemVersionInfo {
  currentVersion: string;
  latestVersion: string;
  updateAvailable: boolean;
  releaseUrl: string;
  releaseNotes: string;
  checkedAt: string;
}

let cachedVersionInfo: SystemVersionInfo | null = null;
let lastCheckTime = 0;

const CURRENT_VERSION = '1.0.0';
const GITHUB_REPO = 'growhaleystudio/monitor-wp';

/**
 * Checks GitHub Releases API for the latest release of Growhaley Monitor.
 * Caches the result for 1 hour (3600000 ms) to respect API rate limits.
 */
export async function checkSystemUpdate(): Promise<SystemVersionInfo> {
  const now = Date.now();
  if (cachedVersionInfo && now - lastCheckTime < 3600000) {
    return cachedVersionInfo;
  }

  try {
    const response = await axios.get(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
      headers: {
        'User-Agent': 'Growhaley-Monitor-Server/1.0',
        Accept: 'application/vnd.github.v3+json',
      },
      timeout: 5000,
    });

    const latestTag = (response.data.tag_name || 'v1.0.0').replace(/^v/, '');
    const releaseUrl = response.data.html_url || `https://github.com/${GITHUB_REPO}/releases`;
    const releaseNotes = response.data.body || '';

    const updateAvailable = compareVersions(latestTag, CURRENT_VERSION) > 0;

    cachedVersionInfo = {
      currentVersion: CURRENT_VERSION,
      latestVersion: latestTag,
      updateAvailable,
      releaseUrl,
      releaseNotes,
      checkedAt: new Date().toISOString(),
    };
    lastCheckTime = now;

    return cachedVersionInfo;
  } catch (error) {
    return cachedVersionInfo || {
      currentVersion: CURRENT_VERSION,
      latestVersion: CURRENT_VERSION,
      updateAvailable: false,
      releaseUrl: `https://github.com/${GITHUB_REPO}`,
      releaseNotes: '',
      checkedAt: new Date().toISOString(),
    };
  }
}

function compareVersions(v1: string, v2: string): number {
  const p1 = v1.split('.').map((n) => parseInt(n, 10) || 0);
  const p2 = v2.split('.').map((n) => parseInt(n, 10) || 0);

  for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
    const val1 = p1[i] || 0;
    const val2 = p2[i] || 0;
    if (val1 > val2) return 1;
    if (val1 < val2) return -1;
  }
  return 0;
}
