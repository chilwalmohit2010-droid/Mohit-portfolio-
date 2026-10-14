import { useState, useEffect } from 'react';
import { mediaStorage } from '../services/mediaStorage';

/**
 * Hook to asynchronously resolve media IDs (e.g. media_image_123, media_video_123)
 * into valid displayable URLs, with synchronous passthrough for data:, http(s):, and relative paths.
 */
export function useMediaUrl(urlOrId?: string, fallback?: string): string | undefined {
  const [resolved, setResolved] = useState<string | undefined>(() => {
    if (!urlOrId) return fallback;
    if (
      urlOrId.startsWith('data:') ||
      urlOrId.startsWith('http://') ||
      urlOrId.startsWith('https://') ||
      urlOrId.startsWith('/')
    ) {
      return urlOrId;
    }
    return undefined; // Do not render raw media_ ID directly
  });

  useEffect(() => {
    let isMounted = true;

    if (!urlOrId) {
      setResolved(fallback);
      return;
    }

    if (
      urlOrId.startsWith('data:') ||
      urlOrId.startsWith('http://') ||
      urlOrId.startsWith('https://') ||
      urlOrId.startsWith('/')
    ) {
      setResolved(urlOrId);
      return;
    }

    if (urlOrId.startsWith('media_')) {
      mediaStorage.getFileUrl(urlOrId).then(async (url) => {
        if (!isMounted) return;
        if (url) {
          setResolved(url);
        } else {
          const thumb = await mediaStorage.getThumbnailUrl(urlOrId);
          if (isMounted) {
            setResolved(thumb || fallback);
          }
        }
      }).catch(async () => {
        if (!isMounted) return;
        try {
          const thumb = await mediaStorage.getThumbnailUrl(urlOrId);
          if (isMounted) setResolved(thumb || fallback);
        } catch {
          if (isMounted) setResolved(fallback);
        }
      });
    } else {
      setResolved(urlOrId);
    }

    return () => {
      isMounted = false;
    };
  }, [urlOrId, fallback]);

  return resolved;
}
