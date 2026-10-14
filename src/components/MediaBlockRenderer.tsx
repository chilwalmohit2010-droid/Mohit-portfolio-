import React, { useState, useEffect } from 'react';
import { CustomMediaBlock } from '../types/portfolio';
import { useMediaUrl } from '../utils/useMediaUrl';
import { mediaStorage } from '../services/mediaStorage';
import { getYouTubeEmbedUrl } from '../utils/urlHelper';
import { Play, Video as VideoIcon, Image as ImageIcon, Trash2, Edit2 } from 'lucide-react';

interface MediaBlockRendererProps {
  block: CustomMediaBlock;
  isEditable?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
}

export const MediaBlockRenderer: React.FC<MediaBlockRendererProps> = ({
  block,
  isEditable,
  isSelected,
  onSelect,
  onDelete
}) => {
  const mediaUrl = useMediaUrl(block.mediaId);
  const [directVideoUrl, setDirectVideoUrl] = useState<string | null>(null);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (block.type === 'video' && block.mediaId.startsWith('media_')) {
      mediaStorage.getVideoUrl(block.mediaId).then(url => {
        if (active && url) setDirectVideoUrl(url);
      });
      mediaStorage.getThumbnailUrl(block.mediaId).then(thumb => {
        if (active && thumb) setPosterUrl(thumb);
      });
    }
    return () => { active = false; };
  }, [block.mediaId, block.type]);

  const alignmentClass = 
    block.alignment === 'left' ? 'mr-auto text-left' :
    block.alignment === 'right' ? 'ml-auto text-right' :
    'mx-auto text-center';

  return (
    <div
      onClick={(e) => {
        if (isEditable && onSelect) {
          e.stopPropagation();
          onSelect();
        }
      }}
      className={`my-8 relative group rounded-2xl overflow-hidden max-w-4xl ${alignmentClass} transition-all duration-300 ${
        isEditable ? 'cursor-pointer' : ''
      } ${
        isSelected 
          ? 'ring-2 ring-teal-400 shadow-[0_0_25px_rgba(45,212,191,0.3)]' 
          : isEditable ? 'hover:ring-1 hover:ring-teal-400/40' : ''
      }`}
    >
      {/* Editor Badge & Action Toolbar */}
      {isEditable && (
        <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-black/80 border border-white/10 text-teal-300">
            {block.type.toUpperCase()} BLOCK
          </span>
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1 rounded bg-red-500/80 hover:bg-red-500 text-white shadow cursor-pointer"
              title="Delete media block"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Media Content */}
      <div className="rounded-2xl border border-white/10 bg-[#0d1217]/80 overflow-hidden shadow-2xl">
        {block.type === 'image' ? (
          <div className="relative aspect-[16/10] sm:aspect-video w-full bg-black/40 overflow-hidden">
            {mediaUrl ? (
              <img
                src={mediaUrl}
                alt={block.title || 'Portfolio Image Block'}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                <ImageIcon className="w-8 h-8 text-slate-600" />
                <span className="text-xs">Loading image...</span>
              </div>
            )}
          </div>
        ) : (
          /* Video Block */
          <div className="relative aspect-video w-full bg-black overflow-hidden">
            {block.mediaId.startsWith('media_') ? (
              directVideoUrl ? (
                <video
                  src={directVideoUrl}
                  poster={posterUrl || undefined}
                  controls
                  playsInline
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                  Loading direct video player...
                </div>
              )
            ) : getYouTubeEmbedUrl(block.mediaId) ? (
              <iframe
                src={getYouTubeEmbedUrl(block.mediaId)!}
                title={block.title || 'Video Player'}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                Video player not configured.
              </div>
            )}
          </div>
        )}

        {/* Title & Caption */}
        {(block.title || block.caption) && (
          <div className="p-4 sm:p-5 border-t border-white/5 bg-[#0a0e12]/60 text-left">
            {block.title && (
              <h4 className="text-sm sm:text-base font-bold text-white mb-1">
                {block.title}
              </h4>
            )}
            {block.caption && (
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                {block.caption}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
