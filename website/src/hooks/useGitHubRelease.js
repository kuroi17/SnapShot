import { useState, useEffect } from 'react';

const API = 'https://api.github.com/repos/kuroi17/SnapShot/releases';

function parseRelease(releases, prefixes) {
  const prefixesList = Array.isArray(prefixes) ? prefixes : [prefixes];
  let match = null;
  for (const prefix of prefixesList) {
    match = releases.find(r => r.tag_name.startsWith(prefix));
    if (match) break;
  }
  if (!match) return null;

  const exeAsset = match.assets?.find(a => a.name.endsWith('.exe'));
  const firstAsset = match.assets?.[0];

  return {
    version: match.tag_name,
    title: match.name || match.tag_name,
    publishedAt: new Date(match.published_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    downloadUrl: exeAsset ? exeAsset.browser_download_url : (firstAsset ? firstAsset.browser_download_url : null),
    fileSize: exeAsset
      ? (exeAsset.size / (1024 * 1024)).toFixed(1) + ' MB'
      : (firstAsset ? (firstAsset.size / (1024 * 1024)).toFixed(1) + ' MB' : null),
    notes: match.body || '',
  };
}

const FALLBACK_DESKTOP = {
  version: 'desktop-v1.0.0',
  publishedAt: 'July 2026',
  downloadUrl: 'https://github.com/kuroi17/SnapShot/releases',
  fileSize: '158 MB',
};

const FALLBACK_MOBILE = {
  version: 'mobile-v1.0.0',
  publishedAt: 'July 2026',
  downloadUrl: 'https://github.com/kuroi17/SnapShot/releases',
  fileSize: null,
};

export function useGitHubRelease() {
  const [desktopRelease, setDesktopRelease] = useState(null);
  const [mobileRelease, setMobileRelease] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchReleases() {
      try {
        const res = await fetch(API);
        if (!res.ok) throw new Error('Failed to fetch releases');
        const data = await res.json();
        if (cancelled) return;

        setDesktopRelease(parseRelease(data, ['desktop-v', 'v']) || FALLBACK_DESKTOP);
        setMobileRelease(parseRelease(data, 'mobile-v') || FALLBACK_MOBILE);
      } catch {
        if (cancelled) return;
        setError(true);
        setDesktopRelease(FALLBACK_DESKTOP);
        setMobileRelease(FALLBACK_MOBILE);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchReleases();
    return () => { cancelled = true; };
  }, []);

  return { desktopRelease, mobileRelease, loading, error };
}
