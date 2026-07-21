import { useState, useEffect } from 'react';

export function useGitHubRelease() {
  const [release, setRelease] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchLatestRelease() {
      try {
        const res = await fetch('https://api.github.com/repos/kuroi17/SnapShot/releases/latest');
        if (!res.ok) throw new Error('Release not found');
        const data = await res.json();

        const exeAsset = data.assets?.find(a => a.name.endsWith('.exe')) || data.assets?.[0];

        if (cancelled) return;

        setRelease({
          version: data.tag_name || 'v1.0.0',
          title: data.name || 'SnapShot Release',
          publishedAt: new Date(data.published_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          downloadUrl: exeAsset
            ? exeAsset.browser_download_url
            : 'https://github.com/kuroi17/SnapShot/releases',
          fileSize: exeAsset
            ? (exeAsset.size / (1024 * 1024)).toFixed(1) + ' MB'
            : '158 MB',
          notes: data.body || '',
        });
      } catch {
        if (cancelled) return;
        setError(true);
        setRelease({
          version: 'v1.0.0',
          downloadUrl: 'https://github.com/kuroi17/SnapShot/releases',
          fileSize: '158 MB',
          publishedAt: 'July 2026',
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchLatestRelease();

    return () => { cancelled = true; };
  }, []);

  return { release, loading, error };
}
