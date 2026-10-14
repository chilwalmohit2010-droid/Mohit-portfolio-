import React, { useState, useEffect } from 'react';
import { ProfileConfig, CustomMediaBlock } from '../types/portfolio';
import { Edit3, CheckCircle2, Sparkles, Terminal, Smartphone, Film, Palette, Wrench, User } from 'lucide-react';
import { useMediaUrl } from '../utils/useMediaUrl';
import { MediaBlockRenderer } from './MediaBlockRenderer';

interface AboutSectionProps {
  profile: ProfileConfig;
  headingOverride?: string;
  onOpenAdmin?: () => void;
  mediaBlocks?: CustomMediaBlock[];
  isEditable?: boolean;
  selectedBlockId?: string;
  onSelectBlock?: (id: string) => void;
  onDeleteBlock?: (id: string) => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ 
  profile, 
  headingOverride, 
  onOpenAdmin,
  mediaBlocks,
  isEditable,
  selectedBlockId,
  onSelectBlock,
  onDeleteBlock
}) => {
  const aboutImageUrl = useMediaUrl(profile.aboutImage);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [aboutImageUrl]);

  const getSkillCategoryIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('video') || lower.includes('editing')) return <Film className="w-5 h-5 text-teal-400" />;
    if (lower.includes('web') || lower.includes('development')) return <Terminal className="w-5 h-5 text-teal-400" />;
    if (lower.includes('app') || lower.includes('android')) return <Smartphone className="w-5 h-5 text-teal-400" />;
    if (lower.includes('ui') || lower.includes('design')) return <Palette className="w-5 h-5 text-teal-400" />;
    return <Wrench className="w-5 h-5 text-teal-400" />;
  };

  const aboutBlocks = (mediaBlocks || []).filter(b => b.section === 'about');

  return (
    <section id="about" className="py-20 sm:py-24 border-t border-white/5 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="mb-12 space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400" />
            <span className="text-xs font-bold tracking-[0.2em] text-teal-400 uppercase">
              ABOUT & CORE COMPETENCIES
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
            {headingOverride || 'Crafting Digital Stories & Interfaces'}
          </h2>
        </div>

        {/* 2-Column Split: Bio on Left, Skills on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* Left Column: Biography & Optional Creator Photo */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Optional Creator Photo / Visual */}
            {aboutImageUrl && !imgError && (
              <div className="rounded-2xl border border-white/10 bg-[#0d1217]/70 p-2 overflow-hidden shadow-xl aspect-square max-w-sm mx-auto lg:mx-0">
                <img
                  src={aboutImageUrl}
                  alt={profile.name}
                  onError={() => setImgError(true)}
                  className={`w-full h-full rounded-xl ${
                    profile.aboutImageFit === 'contain' ? 'object-contain bg-black/40' : 'object-cover'
                  }`}
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            <div className="rounded-2xl border border-white/10 bg-[#0d1217]/70 p-6 sm:p-7 space-y-4 shadow-lg backdrop-blur-sm">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <span className="text-xs font-semibold text-teal-400 tracking-wider uppercase">
                  Creator Profile
                </span>
                {onOpenAdmin && (
                  <button
                    onClick={onOpenAdmin}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-400 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Bio</span>
                  </button>
                )}
              </div>

              {/* Bio Content */}
              <div className="text-slate-300 text-sm sm:text-base leading-relaxed space-y-3 whitespace-pre-line">
                {profile.aboutBio}
              </div>

              {/* Note callout for owner */}
              <div className="p-3.5 rounded-xl bg-teal-500/5 border border-teal-500/20 text-xs text-slate-400 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>
                  This bio is fully editable from the Admin Dashboard so you can update your story as you grow.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Skill Groups */}
          <div className="lg:col-span-7 space-y-5">
            <h3 className="text-lg font-bold text-white tracking-tight">
              Technical & Creative Toolkit
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profile.skillCategories.map((group) => (
                <div
                  key={group.name}
                  className="rounded-xl border border-white/10 bg-[#0d1217]/60 p-5 space-y-3.5 hover:border-teal-500/30 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    {getSkillCategoryIcon(group.name)}
                    <h4 className="text-sm font-bold text-white">
                      {group.name}
                    </h4>
                  </div>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {group.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-md text-xs font-medium bg-white/[0.04] border border-white/5 text-slate-300 hover:text-teal-300 hover:border-teal-500/30 transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Custom Section Media Blocks */}
        {aboutBlocks.length > 0 && (
          <div className="mt-12 space-y-6">
            {aboutBlocks.map(block => (
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
