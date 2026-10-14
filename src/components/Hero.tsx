import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowRight, ArrowDown } from 'lucide-react';
import { HERO_BG_IMAGE } from '../assets/heroImage';
import { ProfileConfig, AnimationConfig, CustomMediaBlock } from '../types/portfolio';
import { useMediaUrl } from '../utils/useMediaUrl';
import { MediaBlockRenderer } from './MediaBlockRenderer';

interface HeroProps {
  profile: ProfileConfig;
  animationConfig?: AnimationConfig;
  onExploreClick: () => void;
  onConnectClick: () => void;
  mediaBlocks?: CustomMediaBlock[];
  isEditable?: boolean;
  selectedBlockId?: string;
  onSelectBlock?: (id: string) => void;
  onDeleteBlock?: (id: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  profile,
  animationConfig,
  onExploreClick,
  onConnectClick,
  mediaBlocks,
  isEditable,
  selectedBlockId,
  onSelectBlock,
  onDeleteBlock
}) => {
  const roles = profile.roles && profile.roles.length > 0 
    ? profile.roles 
    : ['Video Editor', 'Web Developer', 'App Developer'];

  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [fadeState, setFadeState] = useState<'in' | 'out'>('in');
  const [imgError, setImgError] = useState(false);

  const resolvedHeroImage = useMediaUrl(profile.heroBgImage, HERO_BG_IMAGE);

  useEffect(() => {
    setImgError(false);
  }, [resolvedHeroImage]);

  const pauseDuration = animationConfig?.pauseDuration || 3200;
  const isTypewriterEnabled = animationConfig?.typewriterEnabled !== false;

  useEffect(() => {
    if (!isTypewriterEnabled || roles.length <= 1) return;

    const interval = setInterval(() => {
      setFadeState('out');
      setTimeout(() => {
        setCurrentRoleIndex((prev) => (prev + 1) % roles.length);
        setFadeState('in');
      }, 350);
    }, pauseDuration);

    return () => clearInterval(interval);
  }, [roles.length, pauseDuration, isTypewriterEnabled]);

  const getTransitionClasses = () => {
    const style = animationConfig?.transitionStyle || 'fade';
    if (style === 'slide') {
      return fadeState === 'in' ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4';
    }
    if (style === 'zoom') {
      return fadeState === 'in' ? 'opacity-100 scale-100' : 'opacity-0 scale-90';
    }
    return fadeState === 'in' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2';
  };

  const heroBlocks = (mediaBlocks || []).filter(b => b.section === 'hero');

  return (
    <section 
      id="home" 
      className="relative min-h-[92vh] flex flex-col justify-between overflow-hidden pt-12 pb-8 sm:pt-20 sm:pb-12"
    >
      {/* Background 3D Abstract Ring Image & Ambient Aurora Glow */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Abstract 3D Rendered Ring Asset or Custom Uploaded Artwork */}
        <div className="absolute right-[-10%] sm:right-[5%] top-[15%] w-[85%] sm:w-[55%] max-w-[620px] aspect-[9/16] sm:aspect-square opacity-60 sm:opacity-85 mix-blend-lighten filter brightness-95">
          <img 
            src={imgError ? HERO_BG_IMAGE : (resolvedHeroImage || HERO_BG_IMAGE)} 
            alt="Hero Visual Artwork" 
            onError={() => setImgError(true)}
            className={`w-full h-full pointer-events-none select-none ${
              profile.heroImageFit === 'cover' ? 'object-cover' : 'object-contain'
            }`}
            loading="eager"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Ambient Radial Soft Glow */}
        {animationConfig?.backgroundMotion !== false && (
          <>
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />
          </>
        )}
        
        {/* Soft Vignette / Scrim Gradient to ensure total readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090a] via-[#08090a]/60 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#08090a] via-[#08090a]/80 to-transparent pointer-events-none" />
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full my-auto z-10">
        <div className="max-w-2xl space-y-6 sm:space-y-7">
          
          {/* Top Bullet & Kicker matching reference */}
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_8px_#2dd4bf] inline-block" />
            <span className="text-xs sm:text-sm font-semibold tracking-[0.2em] text-teal-400 uppercase">
              {profile.kicker || 'A CREATOR. A BUILDER. A STORYTELLER.'}
            </span>
          </div>

          {/* Sub-heading greeting */}
          <p className="text-lg sm:text-xl text-slate-400 font-normal">
            {profile.tagline || 'Welcome to my creative space'}
          </p>

          {/* Main Display Headline */}
          <div className="space-y-1">
            <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white leading-tight">
              Hi, I’m <span className="text-teal-400 drop-shadow-[0_0_25px_rgba(45,212,191,0.25)]">{profile.name || 'Mohit'}.</span>
            </h1>

            {/* Rotating Role Text */}
            <div className="h-14 sm:h-18 flex items-center">
              <span 
                className={`text-3xl sm:text-5xl font-bold text-teal-400 transition-all duration-300 transform ${getTransitionClasses()}`}
              >
                {roles[currentRoleIndex]}
              </span>
            </div>
          </div>

          {/* Supporting Copy */}
          <div className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-lg space-y-1 whitespace-pre-line">
            {profile.subTagline || 'At the intersection of creativity and technology.\nVideos, websites, and apps — all in one place.'}
          </div>

          {/* Action CTAs matching Screenshot 1 */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            {/* Primary Action Button */}
            <button
              onClick={onExploreClick}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-teal-400 text-slate-950 font-semibold text-sm sm:text-base hover:bg-teal-300 transition-all shadow-[0_0_20px_rgba(45,212,191,0.2)] hover:shadow-[0_0_25px_rgba(45,212,191,0.35)] active:scale-98 cursor-pointer group"
            >
              <span>Explore my work</span>
              <ArrowUpRight className="w-4 h-4 stroke-[2.5] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>

            {/* Secondary Action Button */}
            <button
              onClick={onConnectClick}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-sm sm:text-base hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-sm active:scale-98 cursor-pointer group"
            >
              <span>Let’s connect</span>
              <ArrowRight className="w-4 h-4 stroke-[2] transition-transform group-hover:translate-x-1" />
            </button>
          </div>

        </div>

        {/* Any Hero Custom Media Blocks */}
        {heroBlocks.length > 0 && (
          <div className="mt-12 space-y-6">
            {heroBlocks.map(block => (
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

      {/* Bottom Scroll Indicator matching reference */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full pt-8 z-10">
        <a
          href="#work"
          className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-slate-500 hover:text-teal-400 transition-colors uppercase group"
        >
          <ArrowDown className="w-4 h-4 stroke-[2] transition-transform group-hover:translate-y-1 text-teal-400" />
          <span>Scroll to explore</span>
        </a>
      </div>
    </section>
  );
};
