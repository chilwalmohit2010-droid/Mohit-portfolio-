import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Check, AlertCircle, FileText, Image as ImageIcon, Video, Smartphone, Loader2, Trash2, Download } from 'lucide-react';
import { mediaStorage, StoredMediaFile } from '../../services/mediaStorage';

export interface MediaUploadResult {
  fileId: string;
  url: string;
  posterUrl?: string;
  fileName: string;
  size: number;
}

interface MediaUploaderProps {
  category: 'image' | 'video' | 'apk';
  currentValue?: string; // Existing URL or media ID (e.g. media_image_123)
  currentFileName?: string;
  onFileSelected: (result: MediaUploadResult) => void;
  onRemove?: () => void;
  label?: string;
  helperText?: string;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  category,
  currentValue,
  currentFileName,
  onFileSelected,
  onRemove,
  label,
  helperText
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resolvedFileName, setResolvedFileName] = useState<string | null>(currentFileName || null);
  const [resolvedSize, setResolvedSize] = useState<string | null>(null);
  const [storedFiles, setStoredFiles] = useState<StoredMediaFile[]>([]);
  const [showLibrary, setShowLibrary] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File accept string tailored for Android mobile document picker & desktop
  const getAcceptType = () => {
    switch (category) {
      case 'image':
        return 'image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp';
      case 'video':
        return 'video/mp4,video/webm,video/ogg,.mp4,.webm';
      case 'apk':
        return '.apk,application/vnd.android.package-archive,application/octet-stream';
    }
  };

  useEffect(() => {
    let active = true;

    if (currentValue) {
      if (currentValue.startsWith('media_')) {
        // Resolve stored item from IndexedDB
        mediaStorage.getFile(currentValue).then(file => {
          if (!active || !file) return;
          setResolvedFileName(file.name);
          setResolvedSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);

          if (category === 'video') {
            if (file.posterDataUrl || file.dataUrl) {
              setPreviewUrl(file.posterDataUrl || file.dataUrl || null);
            } else {
              setPreviewUrl(null);
            }
          } else if (category === 'image') {
            if (file.dataUrl) {
              setPreviewUrl(file.dataUrl);
            } else {
              mediaStorage.getFileUrl(currentValue).then(url => {
                if (active && url) setPreviewUrl(url);
              });
            }
          }
        });
      } else {
        setPreviewUrl(currentValue);
        setResolvedFileName(currentFileName || currentValue);
      }
    } else {
      setPreviewUrl(null);
      setResolvedFileName(null);
      setResolvedSize(null);
    }

    return () => {
      active = false;
    };
  }, [currentValue, category, currentFileName]);

  const loadLibrary = async () => {
    try {
      const files = await mediaStorage.listFiles(category);
      setStoredFiles(files);
      setShowLibrary(true);
    } catch (e) {
      setError(`Could not open media library: ${(e as Error).message}`);
    }
  };

  const handleDeleteFromLibrary = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await mediaStorage.deleteFile(id);
      setStoredFiles(prev => prev.filter(f => f.id !== id));
      if (currentValue === id && onRemove) {
        onRemove();
      }
    } catch (err) {
      setError(`Could not delete file: ${(err as Error).message}`);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);
    setProgress(10);

    try {
      // Validate APK extension for Android APK category
      if (category === 'apk') {
        const isApkExt = file.name.toLowerCase().endsWith('.apk');
        const isApkMime = file.type === 'application/vnd.android.package-archive' || file.type === 'application/octet-stream' || !file.type;
        if (!isApkExt && !isApkMime) {
          throw new Error(`The selected file "${file.name}" is not an Android APK. Please select an installation file ending in .apk`);
        }
      }

      // Validate image format
      if (category === 'image') {
        const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file.name);
        if (!isImage) {
          throw new Error('Please select an image file (JPG, PNG, or WebP).');
        }
      }

      // Validate video format
      if (category === 'video') {
        const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|ogg)$/i.test(file.name);
        if (!isVideo) {
          throw new Error('Please select a valid video file (MP4 or WebM).');
        }
      }

      // Persist binary into IndexedDB
      const stored = await mediaStorage.uploadFile(
        file,
        file.name,
        category,
        (p) => setProgress(p)
      );

      // Generate preview display
      let displayUrl: string | null = null;
      if (category === 'image') {
        displayUrl = stored.dataUrl || (await mediaStorage.getFileUrl(stored.id));
      } else if (category === 'video') {
        displayUrl = stored.posterDataUrl || stored.dataUrl || null;
      }

      setPreviewUrl(displayUrl);
      setResolvedFileName(stored.name);
      setResolvedSize(`${(stored.size / (1024 * 1024)).toFixed(1)} MB`);

      // Callback passing persistent fileId
      onFileSelected({
        fileId: stored.id,
        url: displayUrl || stored.id,
        posterUrl: stored.posterDataUrl || stored.dataUrl,
        fileName: stored.name,
        size: stored.size
      });
    } catch (err) {
      setError((err as Error).message || 'File upload failed. Please try again.');
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSelectFromLibrary = async (stored: StoredMediaFile) => {
    let displayUrl: string | null = null;
    if (category === 'image') {
      displayUrl = stored.dataUrl || (await mediaStorage.getFileUrl(stored.id));
    } else if (category === 'video') {
      displayUrl = stored.posterDataUrl || stored.dataUrl || null;
    }

    setPreviewUrl(displayUrl);
    setResolvedFileName(stored.name);
    setResolvedSize(`${(stored.size / (1024 * 1024)).toFixed(1)} MB`);
    setShowLibrary(false);

    onFileSelected({
      fileId: stored.id,
      url: displayUrl || stored.id,
      posterUrl: stored.posterDataUrl || stored.dataUrl,
      fileName: stored.name,
      size: stored.size
    });
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300">{label}</label>
          <button
            type="button"
            onClick={loadLibrary}
            className="text-[11px] text-teal-400 hover:underline cursor-pointer"
          >
            Browse Uploaded ({category}s)
          </button>
        </div>
      )}

      {error && (
        <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Current Preview or Upload Box */}
      {previewUrl || currentValue ? (
        <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            {category === 'image' && (
              <div className="w-14 h-14 rounded-lg bg-black overflow-hidden shrink-0 border border-white/10">
                <img
                  src={previewUrl || ''}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            {category === 'video' && (
              <div className="w-16 aspect-video rounded-lg bg-black overflow-hidden shrink-0 flex items-center justify-center border border-white/10">
                {previewUrl ? (
                  <img src={previewUrl} alt="Poster" className="w-full h-full object-cover" />
                ) : (
                  <Video className="w-5 h-5 text-teal-400" />
                )}
              </div>
            )}

            {category === 'apk' && (
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                <Smartphone className="w-6 h-6 stroke-[2]" />
              </div>
            )}

            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate max-w-xs">
                {resolvedFileName || (currentValue?.startsWith('media_') ? 'Persistent Stored File' : currentValue)}
              </p>
              <div className="flex items-center gap-2 text-[10px] text-teal-400">
                <span>Stored in IndexedDB</span>
                {resolvedSize && (
                  <>
                    <span>·</span>
                    <span className="text-slate-400 font-mono">{resolvedSize}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {category === 'apk' && currentValue && (
              <button
                type="button"
                onClick={() => mediaStorage.downloadFile(currentValue, resolvedFileName || 'app.apk')}
                className="p-1.5 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 text-xs cursor-pointer"
                title="Test Download APK"
              >
                <Download className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs cursor-pointer"
            >
              Replace
            </button>
            {onRemove && (
              <button
                type="button"
                onClick={() => {
                  setPreviewUrl(null);
                  setResolvedFileName(null);
                  setResolvedSize(null);
                  onRemove();
                }}
                className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 cursor-pointer"
                title="Remove"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Empty Upload Dropzone */
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed border-white/10 hover:border-teal-500/40 rounded-xl p-5 text-center cursor-pointer transition-colors bg-white/[0.02] hover:bg-white/[0.04] ${
            uploading ? 'pointer-events-none opacity-60' : ''
          }`}
        >
          {uploading ? (
            <div className="space-y-2">
              <Loader2 className="w-6 h-6 text-teal-400 animate-spin mx-auto" />
              <div className="text-xs text-slate-300 font-medium">Uploading {category}... {progress}%</div>
              <div className="w-48 h-1.5 bg-white/10 rounded-full mx-auto overflow-hidden">
                <div 
                  className="h-full bg-teal-400 rounded-full transition-all duration-200" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Upload className="w-6 h-6 text-teal-400/80 mx-auto" />
              <div className="text-xs font-medium text-slate-200">
                Click to select {category === 'apk' ? 'an APK package (.apk)' : category} from your phone/desktop
              </div>
              <p className="text-[11px] text-slate-500">
                {category === 'image' && 'Supports JPG, PNG, WebP up to 25MB'}
                {category === 'video' && 'Supports MP4, WebM up to 200MB (auto poster frame generation)'}
                {category === 'apk' && 'Supports Android .apk packages up to 250MB'}
              </p>
            </div>
          )}
        </div>
      )}

      {helperText && <p className="text-[11px] text-slate-500">{helperText}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept={getAcceptType()}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Stored Library Modal */}
      {showLibrary && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-[#0f141a] border border-white/10 p-5 space-y-4 max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Select Stored {category.toUpperCase()}
              </h4>
              <button
                type="button"
                onClick={() => setShowLibrary(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {storedFiles.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                No {category} files uploaded yet.
              </p>
            ) : (
              <div className="space-y-2">
                {storedFiles.map(file => (
                  <div
                    key={file.id}
                    onClick={() => handleSelectFromLibrary(file)}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {category === 'image' && file.dataUrl && (
                        <img src={file.dataUrl} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
                      )}
                      {category === 'video' && (file.posterDataUrl || file.dataUrl) && (
                        <img src={file.posterDataUrl || file.dataUrl} alt="" className="w-10 h-6 rounded object-cover shrink-0" />
                      )}
                      {category === 'apk' && (
                        <Smartphone className="w-5 h-5 text-teal-400 shrink-0" />
                      )}
                      <div className="truncate">
                        <div className="text-xs font-medium text-white truncate">{file.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB · {new Date(file.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-teal-400 font-semibold">Select</span>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteFromLibrary(e, file.id)}
                        className="p-1 hover:text-red-400 text-slate-500 rounded"
                        title="Delete from storage"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
