/**
 * Persistent Media Storage Service using Browser IndexedDB
 * 
 * Supports genuine persistent storage for:
 * 1. Image uploads (JPEG, PNG, WebP) from phone gallery/desktop
 * 2. Direct Video uploads (MP4, WebM) with automatic poster frame generation
 * 3. Direct APK uploads (Android package files) with real binary download
 * 
 * Data survives page reloads, browser restarts, and offline sessions.
 */

const DB_NAME = 'mohit_portfolio_media_db_v2';
const DB_VERSION = 2;
const STORE_NAME = 'media_blobs';

export interface StoredMediaFile {
  id: string;
  name: string;
  type: string;
  size: number;
  category: 'image' | 'video' | 'apk' | 'document';
  blob?: Blob;
  arrayBuffer?: ArrayBuffer;
  createdAt: string;
  dataUrl?: string; // For images: base64 preview; For videos: poster frame thumbnail
  posterDataUrl?: string; // Explicit video poster thumbnail
}

class MediaStorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private urlCache = new Map<string, string>();
  private videoUrlCache = new Map<string, string>();

  /**
   * Get or initialize IndexedDB connection with complete error recovery and version management
   */
  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        this.dbPromise = null;
        return reject(new Error('IndexedDB is not supported in this browser environment.'));
      }

      let hasTimedOut = false;
      const timeoutId = setTimeout(() => {
        hasTimedOut = true;
        this.dbPromise = null;
        reject(new Error('Database open request timed out. Please check if another tab has a locked database.'));
      }, 10000);

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onblocked = () => {
        console.warn('IndexedDB upgrade blocked by another open tab.');
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => {
        if (hasTimedOut) return;
        clearTimeout(timeoutId);
        const db = request.result;

        // Auto-close on version change to avoid blocking future upgrades
        db.onversionchange = () => {
          db.close();
          this.dbPromise = null;
        };

        db.onclose = () => {
          this.dbPromise = null;
        };

        resolve(db);
      };

      request.onerror = () => {
        if (hasTimedOut) return;
        clearTimeout(timeoutId);
        this.dbPromise = null;
        reject(request.error || new Error('Could not open IndexedDB storage.'));
      };
    });

    return this.dbPromise;
  }

  /**
   * Save a genuine binary file (Image, Video, or APK) into persistent IndexedDB storage
   */
  async uploadFile(
    file: File | Blob,
    fileName: string,
    category: 'image' | 'video' | 'apk' | 'document',
    onProgress?: (percent: number) => void
  ): Promise<StoredMediaFile> {
    const id = `media_${category}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Category size limits (in bytes)
    const maxSizes = {
      image: 25 * 1024 * 1024, // 25MB
      video: 200 * 1024 * 1024, // 200MB
      apk: 250 * 1024 * 1024, // 250MB
      document: 50 * 1024 * 1024
    };

    if (file.size > maxSizes[category]) {
      const limitMb = Math.round(maxSizes[category] / (1024 * 1024));
      throw new Error(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the maximum allowed ${limitMb}MB limit for ${category} files.`);
    }

    if (onProgress) onProgress(15);

    // Read binary data into memory to detach from temporary OS content URI (crucial on mobile Android)
    let arrayBuffer: ArrayBuffer;
    try {
      arrayBuffer = await file.arrayBuffer();
    } catch (e) {
      throw new Error(`Failed to read file binary from device: ${(e as Error).message}`);
    }

    if (onProgress) onProgress(40);

    // Standardize MIME type
    let mimeType = file.type;
    if (!mimeType) {
      if (category === 'apk') mimeType = 'application/vnd.android.package-archive';
      else if (category === 'video') mimeType = 'video/mp4';
      else if (category === 'image') mimeType = 'image/jpeg';
      else mimeType = 'application/octet-stream';
    }

    // Clean standalone blob free of OS temporary file handles
    const cleanBlob = new Blob([arrayBuffer], { type: mimeType });

    let dataUrl: string | undefined = undefined;
    let posterDataUrl: string | undefined = undefined;

    // For images, generate base64 dataUrl preview for instant UI loading
    if (category === 'image') {
      try {
        dataUrl = await this.blobToDataUrl(cleanBlob);
      } catch (e) {
        console.warn('Could not generate image dataUrl preview', e);
      }
    }

    // For videos, generate high-quality poster frame thumbnail
    if (category === 'video' && typeof window !== 'undefined') {
      try {
        posterDataUrl = await this.extractVideoFrame(cleanBlob);
        dataUrl = posterDataUrl;
      } catch (e) {
        console.warn('Could not generate video poster frame', e);
      }
    }

    if (onProgress) onProgress(75);

    // Construct stored media item without duplicating memory:
    // Store cleanBlob; if DataCloneError occurs during write, fallback to storing arrayBuffer.
    const storedItem: StoredMediaFile = {
      id,
      name: fileName,
      type: mimeType,
      size: file.size,
      category,
      blob: cleanBlob,
      createdAt: new Date().toISOString(),
      dataUrl,
      posterDataUrl
    };

    const db = await this.getDB();

    await new Promise<void>((resolve, reject) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);

        let putSuccess = false;

        const handlePut = () => {
          try {
            const req = store.put(storedItem);
            req.onsuccess = () => {
              putSuccess = true;
            };
            req.onerror = (e) => {
              console.warn('IndexedDB put error on Blob, trying ArrayBuffer fallback:', e);
              // Fallback to storing ArrayBuffer if raw Blob failed
              const fallbackItem: StoredMediaFile = {
                ...storedItem,
                blob: undefined,
                arrayBuffer
              };
              const retryReq = store.put(fallbackItem);
              retryReq.onsuccess = () => {
                putSuccess = true;
              };
              retryReq.onerror = () => {
                reject(retryReq.error || new Error('Failed to save file to browser storage.'));
              };
            };
          } catch (syncErr) {
            // DataCloneError fallback
            console.warn('Synchronous put failed, storing ArrayBuffer:', syncErr);
            const fallbackItem: StoredMediaFile = {
              ...storedItem,
              blob: undefined,
              arrayBuffer
            };
            const req = store.put(fallbackItem);
            req.onsuccess = () => {
              putSuccess = true;
            };
            req.onerror = () => {
              reject(req.error || syncErr);
            };
          }
        };

        handlePut();

        tx.oncomplete = () => {
          if (putSuccess) {
            resolve();
          } else {
            resolve();
          }
        };

        tx.onerror = () => {
          const err = tx.error;
          if (err && err.name === 'QuotaExceededError') {
            reject(new Error('Browser storage quota exceeded. Please free up device storage or delete older media.'));
          } else {
            reject(err || new Error('Database transaction error while storing file.'));
          }
        };

        tx.onabort = () => {
          reject(tx.error || new Error('Database transaction was aborted.'));
        };
      } catch (err) {
        reject(err);
      }
    });

    if (onProgress) onProgress(100);

    return storedItem;
  }

  /**
   * Retrieve a file record by ID from IndexedDB
   */
  async getFile(id: string): Promise<StoredMediaFile | null> {
    if (!id) return null;

    try {
      const db = await this.getDB();
      return new Promise<StoredMediaFile | null>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(id);

        req.onsuccess = () => {
          const result = req.result as StoredMediaFile | undefined;
          if (!result) {
            resolve(null);
            return;
          }

          // Ensure result has a working Blob
          if (!result.blob && result.arrayBuffer) {
            result.blob = new Blob([result.arrayBuffer], {
              type: result.type || 'application/octet-stream'
            });
          }

          resolve(result);
        };

        req.onerror = () => {
          reject(req.error || new Error('Error retrieving file from database.'));
        };
      });
    } catch (e) {
      console.error(`Error fetching file "${id}" from IndexedDB:`, e);
      return null;
    }
  }

  /**
   * Get an active URL for images or documents
   */
  async getFileUrl(id: string): Promise<string | null> {
    if (!id) return null;

    // Passthrough for external / data / relative URLs
    if (id.startsWith('http://') || id.startsWith('https://') || id.startsWith('data:') || id.startsWith('/')) {
      return id;
    }

    if (this.urlCache.has(id)) {
      return this.urlCache.get(id)!;
    }

    const file = await this.getFile(id);
    if (!file) return null;

    // For videos, getFileUrl should return the actual video stream URL, not the poster!
    if (file.category === 'video') {
      return this.getVideoUrl(id);
    }

    // For images, if dataUrl is available, return it for immediate rendering
    if (file.category === 'image' && file.dataUrl) {
      this.urlCache.set(id, file.dataUrl);
      return file.dataUrl;
    }

    // Otherwise create a Blob URL from the stored binary
    let blob = file.blob;
    if (!blob && file.arrayBuffer) {
      blob = new Blob([file.arrayBuffer], { type: file.type || 'application/octet-stream' });
    }

    if (!blob) return null;

    const url = URL.createObjectURL(blob);
    this.urlCache.set(id, url);
    return url;
  }

  /**
   * Get video stream URL for HTML5 <video> playback
   */
  async getVideoUrl(id: string): Promise<string | null> {
    if (!id) return null;

    if (id.startsWith('http://') || id.startsWith('https://') || id.startsWith('/')) {
      return id;
    }

    if (this.videoUrlCache.has(id)) {
      return this.videoUrlCache.get(id)!;
    }

    const file = await this.getFile(id);
    if (!file) return null;

    let blob = file.blob;
    if (!blob && file.arrayBuffer) {
      blob = new Blob([file.arrayBuffer], { type: file.type || 'video/mp4' });
    }

    if (!blob) return null;

    const url = URL.createObjectURL(blob);
    this.videoUrlCache.set(id, url);
    return url;
  }

  /**
   * Get thumbnail / poster URL for video cards or image previews
   */
  async getThumbnailUrl(id: string): Promise<string | null> {
    if (!id) return null;

    if (id.startsWith('http://') || id.startsWith('https://') || id.startsWith('data:') || id.startsWith('/')) {
      return id;
    }

    const file = await this.getFile(id);
    if (!file) return null;

    if (file.posterDataUrl) {
      return file.posterDataUrl;
    }

    if (file.dataUrl) {
      return file.dataUrl;
    }

    // If image has no dataUrl, return file URL
    if (file.category === 'image') {
      return this.getFileUrl(id);
    }

    return null;
  }

  /**
   * Trigger native browser download of an APK or other stored binary file
   */
  async downloadFile(id: string, customFileName?: string): Promise<boolean> {
    const file = await this.getFile(id);
    if (!file) {
      throw new Error(`File (ID: ${id}) was not found in browser storage. Please re-upload the file in the Admin Dashboard.`);
    }

    let blob = file.blob;
    if (!blob && file.arrayBuffer) {
      blob = new Blob([file.arrayBuffer], {
        type: file.type || 'application/vnd.android.package-archive'
      });
    }

    if (!blob || blob.size === 0) {
      throw new Error('File binary data is missing or empty.');
    }

    // Standardize APK filename
    let downloadName = customFileName || file.name || 'app-release.apk';
    if (file.category === 'apk' && !downloadName.toLowerCase().endsWith('.apk')) {
      downloadName += '.apk';
    }

    // Force Android Package MIME type so Android Package Installer activates
    const finalBlob = file.category === 'apk' 
      ? new Blob([blob], { type: 'application/vnd.android.package-archive' })
      : blob;

    const blobUrl = URL.createObjectURL(finalBlob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = downloadName;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      try {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      } catch {
        // Ignored
      }
    }, 60000); // 60 seconds buffer for mobile download manager to initiate

    return true;
  }

  /**
   * Delete a file from IndexedDB and revoke any associated cached URLs
   */
  async deleteFile(id: string): Promise<boolean> {
    const db = await this.getDB();

    if (this.urlCache.has(id)) {
      const url = this.urlCache.get(id)!;
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
      this.urlCache.delete(id);
    }

    if (this.videoUrlCache.has(id)) {
      const vUrl = this.videoUrlCache.get(id)!;
      if (vUrl.startsWith('blob:')) {
        URL.revokeObjectURL(vUrl);
      }
      this.videoUrlCache.delete(id);
    }

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error || new Error('Could not delete file.'));
    });
  }

  /**
   * List all stored media files
   */
  async listFiles(category?: 'image' | 'video' | 'apk' | 'document'): Promise<StoredMediaFile[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();

        req.onsuccess = () => {
          const all: StoredMediaFile[] = req.result || [];
          if (category) {
            resolve(all.filter(f => f.category === category));
          } else {
            resolve(all);
          }
        };

        req.onerror = () => reject(req.error || new Error('Failed to list files.'));
      });
    } catch {
      return [];
    }
  }

  private blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to encode image to data URL.'));
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Extract video poster frame thumbnail on client side using HTML5 Video + Canvas
   */
  private extractVideoFrame(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;

      const url = URL.createObjectURL(blob);
      video.src = url;

      let resolved = false;

      const cleanup = () => {
        URL.revokeObjectURL(url);
      };

      video.onloadeddata = () => {
        try {
          video.currentTime = Math.min(1.0, video.duration > 2 ? 1.0 : (video.duration / 2 || 0.1));
        } catch {
          // Seek fallback
        }
      };

      video.onseeked = () => {
        if (resolved) return;
        try {
          const canvas = document.createElement('canvas');
          const width = Math.min(720, video.videoWidth || 640);
          const height = Math.min(480, video.videoHeight || 360);
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            resolved = true;
            cleanup();
            resolve(dataUrl);
            return;
          }
        } catch (e) {
          console.warn('Canvas video frame extraction failed:', e);
        }
        cleanup();
        reject(new Error('Failed to extract video poster frame.'));
      };

      video.onerror = () => {
        cleanup();
        reject(new Error('Could not load video metadata for poster frame extraction.'));
      };

      // 5 second fallback timeout for video extraction
      setTimeout(() => {
        if (!resolved) {
          cleanup();
          reject(new Error('Video poster extraction timed out.'));
        }
      }, 5000);
    });
  }
}

export const mediaStorage = new MediaStorageService();
