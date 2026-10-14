import { 
  PortfolioData, 
  Project, 
  VideoItem, 
  AppItem, 
  ProfileConfig,
  VisualThemeConfig,
  AnimationConfig,
  SectionsConfig
} from '../types/portfolio';

const PUBLISHED_KEY = 'mohit_portfolio_data_published_v2';
const DRAFT_KEY = 'mohit_portfolio_data_draft_v2';
const LEGACY_KEY = 'mohit_portfolio_data_v1';
const ADMIN_AUTH_KEY = 'mohit_portfolio_admin_auth_v1';
const ADMIN_SESSION_KEY = 'mohit_portfolio_admin_session_v1';

export const initialThemeConfig: VisualThemeConfig = {
  fontFamily: 'plus-jakarta',
  headingScale: 'normal',
  accentColor: '#2dd4bf',
  cardRadius: '2xl',
  buttonRadius: 'xl',
  cardTransparency: 0.7,
  contentWidth: 'normal'
};

export const initialAnimationConfig: AnimationConfig = {
  typewriterEnabled: true,
  typingSpeed: 50,
  pauseDuration: 3200,
  transitionStyle: 'fade',
  backgroundMotion: true,
  motionIntensity: 'subtle',
  reducedMotion: false
};

export const initialSectionsConfig: SectionsConfig = {
  hero: { visible: true, order: 1 },
  work: { visible: true, order: 2, headingOverride: 'A space for websites, apps, and creative explorations.' },
  videos: { visible: true, order: 3, headingOverride: 'Video Editing Showcases' },
  apps: { visible: true, order: 4, headingOverride: 'Apps & APK Releases' },
  about: { visible: true, order: 5, headingOverride: 'Crafting Digital Stories & Interfaces' },
  contact: { visible: true, order: 6, headingOverride: 'Have something in mind? Let’s make it happen.' },
  footer: { visible: true, order: 7 }
};

export const initialPortfolioData: PortfolioData = {
  version: 2,
  lastUpdated: new Date().toISOString(),
  publishedAt: new Date().toISOString(),
  profile: {
    name: 'Mohit',
    brandTitle: 'MOHIT PORTFOLIO',
    kicker: 'A CREATOR. A BUILDER. A STORYTELLER.',
    tagline: 'Welcome to my creative space',
    subTagline: 'At the intersection of creativity and technology.\nVideos, websites, and apps — all in one place.',
    roles: ['Video Editor', 'Web Developer', 'App Developer'],
    aboutBio: 'Hi, I’m Mohit — a passionate creator and builder focused on video editing, web development, and Android applications.\n\n[Editable Placeholder: Customize this biography anytime through the Admin Dashboard to share your story, creative journey, favorite tools, and current goals. Your visitors will see your real achievements and background here!]',
    skillCategories: [
      {
        name: 'Video Editing',
        skills: ['Premiere Pro', 'After Effects', 'DaVinci Resolve', 'Color Grading', 'Sound Design', 'Motion Graphics', 'Pacing & Montage']
      },
      {
        name: 'Web Development',
        skills: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'HTML5 / CSS3', 'JavaScript (ES6+)', 'REST APIs', 'Responsive Design']
      },
      {
        name: 'Android / App Development',
        skills: ['Android Studio', 'Kotlin', 'Jetpack Compose', 'Flutter Basics', 'Mobile UX', 'APK Packaging']
      },
      {
        name: 'UI Design',
        skills: ['Figma', 'Glassmorphism', 'Design Systems', 'Wireframing', 'Dark UI Design', 'Typography & Layout']
      },
      {
        name: 'Creative Tools',
        skills: ['Adobe Photoshop', 'Illustrator', 'CapCut', 'Audio Mastering', 'Storyboarding', 'Visual FX']
      }
    ],
    email: '',
    emailConfigured: false,
    socials: {
      instagram: '',
      youtube: '',
      github: '',
      twitter: '',
      linkedin: ''
    },
    heroImageFit: 'contain'
  },
  projects: [
    {
      id: 'proj-1',
      title: 'Your website project',
      category: 'web',
      description: 'Add your project’s name, a short description, and a live website link.',
      liveUrl: '',
      githubUrl: '',
      videoUrl: '',
      featured: true,
      visible: true,
      order: 1
    },
    {
      id: 'proj-2',
      title: 'Cinematic Visual Montage',
      category: 'creative',
      description: 'Creative video showcase featuring pacing, sound engineering, and high-impact visual color grading.',
      liveUrl: '',
      githubUrl: '',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      featured: true,
      visible: true,
      order: 2
    },
    {
      id: 'proj-3',
      title: 'Android Creator Toolkit',
      category: 'app',
      description: 'Native mobile utility designed for on-the-go asset management, gesture navigation, and clean mobile UI.',
      liveUrl: '',
      githubUrl: '',
      featured: true,
      visible: true,
      order: 3
    },
    {
      id: 'proj-4',
      title: 'Interactive Web Platform',
      category: 'web',
      description: 'Fluid, modern web interface crafted with minimalist dark aesthetic, zero lag, and accessible design.',
      liveUrl: '',
      githubUrl: '',
      featured: false,
      visible: true,
      order: 4
    }
  ],
  videos: [
    {
      id: 'vid-1',
      title: 'Creative Editing Showcase & Transitions',
      description: 'High-energy montage demonstrating advanced motion graphics and audio sync.',
      videoType: 'youtube',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      category: 'Creative Reel',
      featured: true,
      duration: '1:45'
    }
  ],
  apps: [
    {
      id: 'app-1',
      name: 'Mohit Creative Studio',
      description: 'Companion mobile app for organizing creative projects, tracking video edits, and rapid asset previews.',
      version: 'v1.0.0-preview',
      status: 'Coming Soon',
      apkSource: 'url',
      apkUrl: '',
      demoUrl: '',
      releaseNotes: 'Currently in active development. Verified APK download link will be published once internal testing concludes.',
      fileSize: '18.4 MB'
    }
  ],
  themeConfig: initialThemeConfig,
  animationConfig: initialAnimationConfig,
  sectionsConfig: initialSectionsConfig
};

// Safe upgrade function from v1 to v2
function upgradeLegacyData(data: any): PortfolioData {
  return {
    ...initialPortfolioData,
    ...data,
    projects: (data.projects || initialPortfolioData.projects).map((p: any) => ({
      ...p,
      visible: p.visible ?? true
    })),
    videos: (data.videos || initialPortfolioData.videos).map((v: any) => ({
      ...v,
      videoType: v.videoType || 'youtube'
    })),
    apps: (data.apps || initialPortfolioData.apps).map((a: any) => ({
      ...a,
      apkSource: a.apkSource || (a.apkFileId ? 'direct' : 'url')
    })),
    themeConfig: {
      ...initialThemeConfig,
      ...(data.themeConfig || {})
    },
    animationConfig: {
      ...initialAnimationConfig,
      ...(data.animationConfig || {})
    },
    sectionsConfig: {
      ...initialSectionsConfig,
      ...(data.sectionsConfig || {})
    },
    mediaBlocks: data.mediaBlocks || []
  };
}

export function getPublishedData(): PortfolioData {
  try {
    const raw = localStorage.getItem(PUBLISHED_KEY);
    if (!raw) {
      // Check legacy v1 key
      const legacyRaw = localStorage.getItem(LEGACY_KEY);
      if (legacyRaw) {
        const legacy = upgradeLegacyData(JSON.parse(legacyRaw));
        savePublishedData(legacy);
        return legacy;
      }
      savePublishedData(initialPortfolioData);
      return initialPortfolioData;
    }
    return upgradeLegacyData(JSON.parse(raw));
  } catch (e) {
    console.error('Error reading published data:', e);
    return initialPortfolioData;
  }
}

export function getDraftData(): PortfolioData {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) {
      const published = getPublishedData();
      saveDraftData(published);
      return published;
    }
    return upgradeLegacyData(JSON.parse(raw));
  } catch (e) {
    console.error('Error reading draft data:', e);
    return getPublishedData();
  }
}

export function savePublishedData(data: PortfolioData): boolean {
  try {
    data.lastUpdated = new Date().toISOString();
    data.publishedAt = new Date().toISOString();
    localStorage.setItem(PUBLISHED_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event('mohit_portfolio_published_updated'));
    return true;
  } catch (e) {
    console.error('Error saving published data:', e);
    return false;
  }
}

export function saveDraftData(data: PortfolioData): boolean {
  try {
    data.lastUpdated = new Date().toISOString();
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event('mohit_portfolio_draft_updated'));
    return true;
  } catch (e) {
    console.error('Error saving draft data:', e);
    return false;
  }
}

export function publishDraft(): boolean {
  try {
    const draft = getDraftData();
    savePublishedData(draft);
    return true;
  } catch (e) {
    console.error('Error publishing draft:', e);
    return false;
  }
}

export function discardDraft(): PortfolioData {
  const published = getPublishedData();
  saveDraftData(published);
  return published;
}

export function hasUnsavedDraftChanges(): boolean {
  try {
    const pubStr = localStorage.getItem(PUBLISHED_KEY) || '';
    const draftStr = localStorage.getItem(DRAFT_KEY) || '';
    if (!draftStr) return false;
    return pubStr !== draftStr;
  } catch {
    return false;
  }
}

export function resetToDefaults(): PortfolioData {
  savePublishedData(initialPortfolioData);
  saveDraftData(initialPortfolioData);
  return initialPortfolioData;
}

export function exportPortfolioJson(includeDraft = false): string {
  const data = includeDraft ? getDraftData() : getPublishedData();
  return JSON.stringify(data, null, 2);
}

export function importPortfolioJson(jsonString: string): { success: boolean; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed.profile || !Array.isArray(parsed.projects)) {
      return { success: false, error: 'Invalid JSON format: missing required portfolio structure' };
    }
    const upgraded = upgradeLegacyData(parsed);
    savePublishedData(upgraded);
    saveDraftData(upgraded);
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

/* ==================== ADMIN AUTH SERVICES ==================== */

interface AdminAuthConfig {
  isConfigured: boolean;
  passwordHash?: string;
  salt?: string;
  failedAttempts: number;
  lockoutUntil?: number;
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function getAdminAuthConfig(): AdminAuthConfig {
  try {
    const raw = localStorage.getItem(ADMIN_AUTH_KEY);
    if (!raw) {
      return { isConfigured: false, failedAttempts: 0 };
    }
    return JSON.parse(raw);
  } catch {
    return { isConfigured: false, failedAttempts: 0 };
  }
}

export async function setupFirstAdminPassword(password: string): Promise<{ success: boolean; error?: string }> {
  if (!password || password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long' };
  }

  const salt = crypto.randomUUID();
  const passwordHash = await hashPassword(password, salt);

  const authConfig: AdminAuthConfig = {
    isConfigured: true,
    passwordHash,
    salt,
    failedAttempts: 0
  };

  localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(authConfig));
  return { success: true };
}

export async function verifyAdminPassword(password: string): Promise<{ success: boolean; error?: string }> {
  const config = getAdminAuthConfig();

  if (!config.isConfigured || !config.passwordHash || !config.salt) {
    return { success: false, error: 'Admin has not been set up yet. Please complete initial setup.' };
  }

  if (config.lockoutUntil && Date.now() < config.lockoutUntil) {
    const remainingSecs = Math.ceil((config.lockoutUntil - Date.now()) / 1000);
    return { success: false, error: `Too many failed attempts. Please wait ${remainingSecs}s before retrying.` };
  }

  const testHash = await hashPassword(password, config.salt);
  if (testHash === config.passwordHash) {
    config.failedAttempts = 0;
    config.lockoutUntil = undefined;
    localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(config));

    const token = crypto.randomUUID();
    sessionStorage.setItem(ADMIN_SESSION_KEY, token);
    return { success: true };
  } else {
    config.failedAttempts = (config.failedAttempts || 0) + 1;
    if (config.failedAttempts >= 5) {
      config.lockoutUntil = Date.now() + 30000;
    }
    localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(config));
    return { success: false, error: 'Invalid password. Please verify and try again.' };
  }
}

export function isAdminAuthenticated(): boolean {
  try {
    const token = sessionStorage.getItem(ADMIN_SESSION_KEY);
    return Boolean(token && token.length > 10);
  } catch {
    return false;
  }
}

export function logoutAdmin(): void {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
}
