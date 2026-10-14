export type ProjectCategory = 'web' | 'app' | 'creative';

export interface Project {
  id: string;
  title: string;
  category: ProjectCategory;
  description: string;
  thumbnailUrl?: string;
  liveUrl?: string;
  githubUrl?: string;
  videoUrl?: string;
  featured: boolean;
  visible: boolean;
  order: number;
  galleryImages?: string[];
}

export type VideoType = 'youtube' | 'direct';

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  videoType: VideoType;
  videoUrl: string; // YouTube URL or object URL / identifier
  directFileId?: string; // Stored in IndexedDB for direct playback
  category: string;
  thumbnailUrl?: string;
  duration?: string;
  featured: boolean;
  fileSize?: string;
}

export type AppStatus = 'Coming Soon' | 'Available' | 'Updated';
export type ApkSource = 'direct' | 'url';

export interface AppItem {
  id: string;
  name: string;
  description: string;
  version: string;
  status: AppStatus;
  apkSource?: ApkSource;
  apkFileId?: string; // Stored in IndexedDB for direct binary download
  apkFileName?: string;
  apkUrl?: string;
  demoUrl?: string;
  iconUrl?: string;
  releaseNotes?: string;
  fileSize?: string;
}

export interface SkillCategory {
  name: string;
  skills: string[];
}

export interface SocialLinks {
  instagram: string;
  youtube: string;
  github: string;
  twitter?: string;
  linkedin?: string;
}

export interface ProfileConfig {
  name: string;
  brandTitle: string;
  kicker: string;
  tagline: string;
  subTagline: string;
  roles: string[];
  aboutBio: string;
  skillCategories: SkillCategory[];
  email: string;
  emailConfigured: boolean;
  socials: SocialLinks;
  heroBgImage?: string;
  heroImageFit?: 'contain' | 'cover';
  aboutImage?: string;
  aboutImageFit?: 'contain' | 'cover';
}

export interface VisualThemeConfig {
  fontFamily: 'plus-jakarta' | 'outfit' | 'inter' | 'urbanist' | 'manrope' | 'mono';
  headingScale: 'compact' | 'normal' | 'large' | 'dramatic';
  accentColor: string; // e.g. '#2dd4bf'
  cardRadius: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  buttonRadius: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  cardTransparency: number; // 0.3 - 0.95
  contentWidth: 'compact' | 'normal' | 'wide';
}

export interface AnimationConfig {
  typewriterEnabled: boolean;
  typingSpeed: number; // ms
  pauseDuration: number; // ms
  transitionStyle: 'fade' | 'slide' | 'zoom';
  backgroundMotion: boolean;
  motionIntensity: 'subtle' | 'moderate' | 'disabled';
  reducedMotion: boolean;
}

export interface SectionSettings {
  visible: boolean;
  order: number;
  headingOverride?: string;
  subheadingOverride?: string;
  emptyStateText?: string;
}

export interface SectionsConfig {
  hero: SectionSettings;
  work: SectionSettings;
  videos: SectionSettings;
  apps: SectionSettings;
  about: SectionSettings;
  contact: SectionSettings;
  footer: SectionSettings;
}

export interface CustomMediaBlock {
  id: string;
  section: 'hero' | 'work' | 'videos' | 'apps' | 'about' | 'contact';
  type: 'image' | 'video';
  mediaId: string; // Stored persistent media ID (e.g. media_image_...) or external URL
  title?: string;
  caption?: string;
  aspectRatio?: 'video' | 'square' | 'wide' | 'auto';
  alignment?: 'center' | 'left' | 'right';
  order?: number;
}

export interface PortfolioData {
  version: number;
  lastUpdated: string;
  publishedAt?: string;
  profile: ProfileConfig;
  projects: Project[];
  videos: VideoItem[];
  apps: AppItem[];
  themeConfig: VisualThemeConfig;
  animationConfig: AnimationConfig;
  sectionsConfig: SectionsConfig;
  mediaBlocks?: CustomMediaBlock[];
}
