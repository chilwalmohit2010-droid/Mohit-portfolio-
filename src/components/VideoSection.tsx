import React, { useState, useEffect } from 'react';
import { VideoItem, CustomMediaBlock } from '../types/portfolio';
import { Play, ExternalLink, X, Film, Video as VideoIcon, Loader2 } from 'lucide-react';
import { getYouTubeEmbedUrl, getYouTubeThumbnail, sanitizeUrl } from '../utils/urlHelper';
import { mediaStorage } from '../services/mediaStorage';
import { MediaBlockRenderer } from './MediaBlockRenderer';

interface VideoSectionProps {
  videos: VideoItem[];
  headingOverride?: string;
  onOpenAdmin?: () => void;
  mediaBlocks?: CustomMediaBlock[];
  isEditable?: boolean;
  selectedBlockId?: string;
  onSelectBlock?: (id: string) => void;
  onDeleteBlock?: (id: string) => void;
}

export const VideoSection: React.FC<VideoSectionProps> = ({ 
  videos, 
  headingOverride,
  onOpenAdmin,
  mediaBlocks,
  isEditable,
  selectedBlockId,
  onSelectBlock,
  onDeleteBlock
}) => {
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [activeVideoDirectUrl, setActiveVideoDirectUrl] = useState<string | null>(null);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [thumbnailUrls, setThumbnailUrls] = useState<Record<string, string>>({});

  const videoBlocks = (mediaBlocks || []).filter(b => b.section === 'videos');

  // Resolve direct video thumbnails and poster frames
  useEffect(() => {
    let active = true;

    videos.forEach(async (vid) => {
      const targetId = vid.thumbnailUrl || (vid.videoType === 'direct' ? vid.directFileId : null);
      if (targetId) {
        if (targetId.startsWith('data:') || targetId.startsWith('http://') || targetId.startsWith('https://')) {
          if (active) setThumbnailUrls(prev => ({ ...prev, [vid.id]: targetId }));
        } else if (targetId.startsWith('media_')) {
          const thumb = await mediaStorage.getThumbnailUrl(targetId);
          if (active && thumb) {
            setThumbnailUrls(prev => ({ ...prev, [vid.id]: thumb }));
          }
        }
      }
    });

    return () => {
      active = false;
    };
  }, [videos]);

  const handleOpenVideo = async (vid: VideoItem) => {
    setActiveVideo(vid);
    if (vid.videoType === 'direct' && vid.directFileId) {
      setLoadingVideo(true);
      try {
        const url = await mediaStorage.getVideoUrl(vid.directFileId);
        setActiveVideoDirectUrl(url || (vid.videoUrl.startsWith('blob:') ? null : vid.videoUrl));
      } catch (e) {
        console.error('Failed to resolve video stream:', e);
      } finally {
        setLoadingVideo(false);
      }
    } else {
      setActiveVideoDirectUrl(null);
    }
  };

  const handleCloseVideo = () => {
    setActiveVideo(null);
    setActiveVideoDirectUrl(null);
  };

  return (
    <section id="videos" className="py-20 sm:py-24 border-t border-white/5 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="mb-10 sm:mb-12 space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400" />
            <span className="text-xs font-bold tracking-[0.2em] text-teal-400 uppercase">
              CINEMATIC & MOTION WORK
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
            {headingOverride || 'Video Editing Showcases'}
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl">
            High-impact edits, pacing, motion design, and storytelling tailored for creators and brands.
          </p>
        </div>

        {/* Video Grid or Coming Soon State */}
        {videos.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-[#0d1217]/60 p-12 text-center max-w-lg mx-auto space-y-4">
            <Film className="w-10 h-10 text-teal-400/50 mx-auto" />
            <h3 className="text-lg font-semibold text-white">Videos Coming Soon</h3>
            <p className="text-sm text-slate-400">
              New video showcases and editing breakdowns are being prepared.
            </p>
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400 hover:bg-teal-500/20 text-xs font-medium cursor-pointer"
              >
                Add Videos
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            {videos.map((vid) => {
              const youtubeThumb = vid.videoType === 'youtube' ? getYouTubeThumbnail(vid.videoUrl) : null;
              const customThumb = thumbnailUrls[vid.id] || (vid.thumbnailUrl?.startsWith('data:') ? vid.thumbnailUrl : null);
              const thumb = customThumb || youtubeThumb;

              return (
                <div
                  key={vid.id}
                  className="group rounded-2xl border border-white/10 bg-[#0d1217]/70 hover:border-teal-500/30 transition-all duration-300 overflow-hidden flex flex-col shadow-lg"
                >
                  {/* Thumbnail & Play Overlay */}
                  <div 
                    onClick={() => handleOpenVideo(vid)}
                    className="relative aspect-video bg-black/40 overflow-hidden cursor-pointer"
                  >
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={vid.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-[#0e161c]">
                        {vid.videoType === 'direct' ? (
                          <VideoIcon className="w-12 h-12 text-teal-400/60" />
                        ) : (
                          <Film className="w-12 h-12 text-slate-600" />
                        )}
                      </div>
                    )}

                    {/* Gradient Scrim */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Play Button Icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-teal-400 text-slate-950 flex items-center justify-center shadow-[0_0_25px_rgba(45,212,191,0.5)] transform group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 fill-slate-950 ml-0.5" />
                      </div>
                    </div>

                    {/* Tag / Category Badge */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase bg-black/70 border border-white/10 text-teal-300 backdrop-blur-md">
                        {vid.videoType === 'direct' ? 'Uploaded Video' : (vid.category || 'SHOWCASE')}
                      </span>
                      {vid.duration && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono text-slate-300 bg-black/60">
                          {vid.duration}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content details */}
                  <div className="p-5 sm:p-6 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-teal-300 transition-colors line-clamp-1">
                        {vid.title}
                      </h3>
                      <p className="text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed line-clamp-2">
                        {vid.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                      <button
                        onClick={() => handleOpenVideo(vid)}
                        className="text-teal-400 hover:text-teal-300 font-medium inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-teal-400" />
                        <span>Watch Showcase</span>
                      </button>

                      {vid.videoType === 'youtube' && (
                        <a
                          href={sanitizeUrl(vid.videoUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-slate-200 inline-flex items-center gap-1 transition-colors"
                        >
                          <span>YouTube Link</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Custom Section Media Blocks */}
        {videoBlocks.length > 0 && (
          <div className="mt-12 space-y-6">
            {videoBlocks.map(block => (
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

      {/* Video Modal Player */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-3xl rounded-2xl bg-[#0d1217] border border-white/10 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white truncate pr-4">
                {activeVideo.title}
              </h4>
              <button
                onClick={handleCloseVideo}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close video"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Embed or Direct HTML5 Player */}
            <div className="relative aspect-video w-full bg-black">
              {activeVideo.videoType === 'direct' ? (
                loadingVideo ? (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs space-y-2">
                    <Loader2 className="w-6 h-6 text-teal-400 animate-spin" />
                    <span>Loading video stream...</span>
                  </div>
                ) : activeVideoDirectUrl ? (
                  <video
                    src={activeVideoDirectUrl}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3">
                    <p className="text-sm text-slate-400">
                      Could not load video from browser storage.
                    </p>
                    <button
                      onClick={handleCloseVideo}
                      className="px-4 py-2 rounded-xl bg-white/10 text-xs text-white hover:bg-white/20"
                    >
                      Close Player
                    </button>
                  </div>
                )
              ) : getYouTubeEmbedUrl(activeVideo.videoUrl) ? (
                <iframe
                  src={getYouTubeEmbedUrl(activeVideo.videoUrl)!}
                  title={activeVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <p className="text-sm text-slate-400">
                    Direct embed not supported for this URL format.
                  </p>
                  <a
                    href={sanitizeUrl(activeVideo.videoUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-400 text-slate-950 font-semibold text-xs hover:bg-teal-300"
                  >
                    <span>Open in External Player</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
