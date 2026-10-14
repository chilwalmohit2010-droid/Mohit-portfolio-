import React, { useState } from 'react';
import { AppItem, CustomMediaBlock } from '../types/portfolio';
import { Download, Smartphone, ExternalLink, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { sanitizeUrl, isValidHttpUrl } from '../utils/urlHelper';
import { mediaStorage } from '../services/mediaStorage';
import { useMediaUrl } from '../utils/useMediaUrl';
import { MediaBlockRenderer } from './MediaBlockRenderer';

interface AppsSectionProps {
  apps: AppItem[];
  headingOverride?: string;
  onOpenAdmin?: () => void;
  mediaBlocks?: CustomMediaBlock[];
  isEditable?: boolean;
  selectedBlockId?: string;
  onSelectBlock?: (id: string) => void;
  onDeleteBlock?: (id: string) => void;
}

const AppCard: React.FC<{
  app: AppItem;
  onDownloadApk: (app: AppItem) => void;
  isDownloading: boolean;
}> = ({ app, onDownloadApk, isDownloading }) => {
  const iconUrl = useMediaUrl(app.iconUrl);
  const [iconError, setIconError] = useState(false);

  React.useEffect(() => {
    setIconError(false);
  }, [iconUrl]);

  const hasDirectApk = Boolean(app.apkFileId);
  const hasUrlApk = Boolean(app.apkUrl && isValidHttpUrl(app.apkUrl));
  const canDownload = hasDirectApk || hasUrlApk;
  const hasDemoUrl = Boolean(app.demoUrl && isValidHttpUrl(app.demoUrl));

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1217]/70 hover:border-teal-500/30 transition-all duration-300 p-6 sm:p-7 flex flex-col justify-between space-y-6 shadow-lg">
      <div className="space-y-4">
        {/* Top Row: App Icon & Status Badge */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#141b22] border border-white/10 flex items-center justify-center text-teal-400 shadow-md overflow-hidden shrink-0">
              {iconUrl && !iconError ? (
                <img
                  src={iconUrl}
                  alt={app.name}
                  onError={() => setIconError(true)}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <Smartphone className="w-6 h-6 stroke-[2]" />
              )}
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                {app.name}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span className="font-mono">{app.version || 'v1.0.0'}</span>
                {app.fileSize && (
                  <>
                    <span>·</span>
                    <span>{app.fileSize}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Status indicator */}
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              app.status === 'Available'
                ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                : app.status === 'Updated'
                ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                : 'bg-white/5 text-slate-400 border border-white/10'
            }`}
          >
            {app.status}
          </span>
        </div>

        {/* App Description */}
        <p className="text-slate-300 text-sm leading-relaxed">
          {app.description}
        </p>

        {/* Release Notes */}
        {app.releaseNotes && (
          <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 space-y-1">
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Release Notes
            </span>
            <p className="text-xs text-slate-400 leading-normal">
              {app.releaseNotes}
            </p>
          </div>
        )}
      </div>

      {/* Actions Area */}
      <div className="pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
        {hasDirectApk ? (
          <button
            onClick={() => onDownloadApk(app)}
            disabled={isDownloading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-400 text-slate-950 font-semibold text-xs sm:text-sm hover:bg-teal-300 transition-colors shadow-[0_0_15px_rgba(45,212,191,0.2)] cursor-pointer disabled:opacity-50"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Preparing APK...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download APK (Package)</span>
              </>
            )}
          </button>
        ) : hasUrlApk ? (
          <a
            href={sanitizeUrl(app.apkUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-400 text-slate-950 font-semibold text-xs sm:text-sm hover:bg-teal-300 transition-colors shadow-[0_0_15px_rgba(45,212,191,0.2)]"
          >
            <Download className="w-4 h-4" />
            <span>Download APK</span>
          </a>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-xs font-medium cursor-not-allowed">
            <Download className="w-4 h-4 text-slate-500" />
            <span>Coming Soon</span>
          </div>
        )}

        {hasDemoUrl && (
          <a
            href={sanitizeUrl(app.demoUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-400 transition-colors"
          >
            <span>Web Demo</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}

        {!canDownload && (
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Direct APK download will be available upon verified release.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const AppsSection: React.FC<AppsSectionProps> = ({ 
  apps, 
  headingOverride,
  onOpenAdmin,
  mediaBlocks,
  isEditable,
  selectedBlockId,
  onSelectBlock,
  onDeleteBlock
}) => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const appBlocks = (mediaBlocks || []).filter(b => b.section === 'apps');

  const handleDownloadDirectApk = async (app: AppItem) => {
    if (!app.apkFileId) return;
    setDownloadError(null);
    setDownloadSuccess(null);
    try {
      setDownloadingId(app.id);
      const safeFilename = app.apkFileName || `${app.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${app.version}.apk`;
      await mediaStorage.downloadFile(app.apkFileId, safeFilename);
      setDownloadSuccess(`Downloading ${safeFilename}`);
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (e) {
      setDownloadError((e as Error).message);
      setTimeout(() => setDownloadError(null), 6000);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <section id="apps" className="py-20 sm:py-24 border-t border-white/5 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="mb-10 sm:mb-12 space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400" />
            <span className="text-xs font-bold tracking-[0.2em] text-teal-400 uppercase">
              ANDROID & MOBILE APPLICATIONS
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
            {headingOverride || 'Apps & APK Releases'}
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl">
            Custom utility and productivity Android tools built with Kotlin, modern architecture, and fluid performance.
          </p>
        </div>

        {/* Download Toast Notification */}
        {downloadSuccess && (
          <div className="mb-6 p-3 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{downloadSuccess} — check your browser / device downloads.</span>
          </div>
        )}

        {downloadError && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{downloadError}</span>
          </div>
        )}

        {/* Apps Grid */}
        {apps.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-[#0d1217]/60 p-12 text-center max-w-lg mx-auto space-y-4">
            <Smartphone className="w-10 h-10 text-teal-400/50 mx-auto" />
            <h3 className="text-lg font-semibold text-white">No Apps Published Yet</h3>
            <p className="text-sm text-slate-400">
              Future mobile applications and APK releases can be managed through the Admin Dashboard.
            </p>
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400 hover:bg-teal-500/20 text-xs font-medium cursor-pointer"
              >
                Manage Apps
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-7">
            {apps.map((app) => (
              <AppCard
                key={app.id}
                app={app}
                onDownloadApk={handleDownloadDirectApk}
                isDownloading={downloadingId === app.id}
              />
            ))}
          </div>
        )}

        {/* Custom Section Media Blocks */}
        {appBlocks.length > 0 && (
          <div className="mt-12 space-y-6">
            {appBlocks.map(block => (
              <MediaBlockRenderer
                key={block.id}
                block={block}
                isEditable={isEditable}
                isSelected={selectedBlockId === block.id}
                onSelect={() => onSelectBlock && onSelectBlock(block.id)}
                onDelete={() => onDeleteBlock && onDeleteBlock(block.id)}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
