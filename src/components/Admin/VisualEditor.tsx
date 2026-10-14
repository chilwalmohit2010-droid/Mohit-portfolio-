import React, { useState, useEffect } from 'react';
import { 
  PortfolioData, 
  VisualThemeConfig, 
  AnimationConfig, 
  SectionsConfig,
  Project,
  VideoItem,
  AppItem
} from '../../types/portfolio';
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  UploadCloud, 
  RotateCcw, 
  Type, 
  Palette, 
  Layers, 
  Sparkles, 
  Eye, 
  Check, 
  X,
  MousePointerClick,
  Image as ImageIcon,
  Film,
  FolderGit2,
  Plus,
  Trash2,
  Info,
  CheckCircle2,
  Download
} from 'lucide-react';
import { MediaUploader } from './MediaUploader';
import { mediaStorage, StoredMediaFile } from '../../services/mediaStorage';
import { Hero } from '../Hero';
import { ProjectsSection } from '../ProjectsSection';
import { VideoSection } from '../VideoSection';
import { AppsSection } from '../AppsSection';
import { AboutSection } from '../AboutSection';
import { ContactSection } from '../ContactSection';
import { Footer } from '../Footer';

interface VisualEditorProps {
  draftData: PortfolioData;
  publishedData: PortfolioData;
  onUpdateDraft: (updated: PortfolioData) => void;
  onPublish: () => void;
  onDiscard: () => void;
  onClose: () => void;
  hasUnsavedChanges: boolean;
}

type EditorLeftTab = 'elements' | 'sections' | 'media';

type SelectedElementType = 
  | 'none'
  | 'hero-visual'
  | 'hero-text'
  | 'hero-kicker'
  | 'hero-cta'
  | 'project'
  | 'video'
  | 'app'
  | 'about'
  | 'contact';

interface SelectedElement {
  type: SelectedElementType;
  id?: string;
  title: string;
}

export const VisualEditor: React.FC<VisualEditorProps> = ({
  draftData,
  publishedData,
  onUpdateDraft,
  onPublish,
  onDiscard,
  onClose,
  hasUnsavedChanges
}) => {
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [leftTab, setLeftTab] = useState<EditorLeftTab>('elements');
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const [selectedElement, setSelectedElement] = useState<SelectedElement>({ type: 'none', title: 'Page' });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Media Library in Left Sidebar
  const [mediaFiles, setMediaFiles] = useState<StoredMediaFile[]>([]);
  const [mediaFilter, setMediaFilter] = useState<'all' | 'image' | 'video' | 'apk'>('all');
  const [selectedMediaForPlacement, setSelectedMediaForPlacement] = useState<StoredMediaFile | null>(null);
  const [placementTarget, setPlacementTarget] = useState<string>('hero');

  // Media picker modal for element properties
  const [showMediaPickerModal, setShowMediaPickerModal] = useState<boolean>(false);
  const [mediaPickerCategory, setMediaPickerCategory] = useState<'image' | 'video' | 'apk'>('image');
  const [mediaPickerTarget, setMediaPickerTarget] = useState<string>('hero');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadMedia = async () => {
    try {
      const files = await mediaStorage.listFiles();
      setMediaFiles(files);
    } catch (e) {
      console.error('Error fetching media for visual editor:', e);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const updateDraft = (modifier: (prev: PortfolioData) => PortfolioData) => {
    const updated = modifier(draftData);
    onUpdateDraft(updated);
  };

  /* ================= SECTION ORDERING & TOGGLING ================= */
  const sectionKeys: (keyof SectionsConfig)[] = ['hero', 'work', 'videos', 'apps', 'about', 'contact', 'footer'];

  const toggleSectionVisibility = (secKey: keyof SectionsConfig) => {
    updateDraft(prev => {
      const current = prev.sectionsConfig[secKey]?.visible !== false;
      return {
        ...prev,
        sectionsConfig: {
          ...prev.sectionsConfig,
          [secKey]: {
            ...prev.sectionsConfig[secKey],
            visible: !current
          }
        }
      };
    });
    showToast(`${secKey.toUpperCase()} visibility updated`);
  };

  /* ================= QUICK ELEMENT ADDERS ================= */
  const handleAddNewProject = () => {
    const newProj: Project = {
      id: `proj_${Date.now()}`,
      title: 'New Showcase Project',
      description: 'Interactive web application designed with modern UI and responsive layouts.',
      category: 'web',
      liveUrl: 'https://example.com',
      githubUrl: 'https://github.com',
      featured: true,
      visible: true,
      order: draftData.projects.length + 1
    };
    updateDraft(prev => ({
      ...prev,
      projects: [newProj, ...prev.projects]
    }));
    setSelectedElement({ type: 'project', id: newProj.id, title: newProj.title });
    showToast('New Project created & selected for editing');
  };

  const handleAddNewVideo = () => {
    const newVid: VideoItem = {
      id: `vid_${Date.now()}`,
      title: 'New Cinematic Video Showcase',
      description: 'Dynamic pacing, sound design, and color grading showcase.',
      category: 'commercial',
      videoType: 'youtube',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      featured: true
    };
    updateDraft(prev => ({
      ...prev,
      videos: [newVid, ...prev.videos]
    }));
    setSelectedElement({ type: 'video', id: newVid.id, title: newVid.title });
    showToast('New Video created & selected for editing');
  };

  const handleAddNewApp = () => {
    const newApp: AppItem = {
      id: `app_${Date.now()}`,
      name: 'Mohit Mobile App',
      version: 'v1.0.0',
      fileSize: '18 MB',
      description: 'Android application built with Kotlin and Jetpack Compose.',
      status: 'Available',
      apkSource: 'direct'
    };
    updateDraft(prev => ({
      ...prev,
      apps: [newApp, ...prev.apps]
    }));
    setSelectedElement({ type: 'app', id: newApp.id, title: newApp.name });
    showToast('New App entry created & selected for editing');
  };

  /* ================= MEDIA PLACEMENT HANDLERS ================= */
  const handleExecutePlacement = (file: StoredMediaFile, target: string) => {
    if (target === 'hero') {
      updateDraft(prev => ({
        ...prev,
        profile: { ...prev.profile, heroBgImage: file.id }
      }));
      showToast(`Inserted "${file.name}" as Hero 3D Abstract Visual!`);
    } else if (target.startsWith('project:')) {
      const projId = target.replace('project:', '');
      updateDraft(prev => ({
        ...prev,
        projects: prev.projects.map(p => p.id === projId ? { ...p, thumbnailUrl: file.id } : p)
      }));
      showToast(`Inserted thumbnail into project!`);
    } else if (target.startsWith('video-poster:')) {
      const vidId = target.replace('video-poster:', '');
      updateDraft(prev => ({
        ...prev,
        videos: prev.videos.map(v => v.id === vidId ? { ...v, thumbnailUrl: file.id } : v)
      }));
      showToast(`Updated video poster thumbnail!`);
    } else if (target.startsWith('video-file:')) {
      const vidId = target.replace('video-file:', '');
      updateDraft(prev => ({
        ...prev,
        videos: prev.videos.map(v => v.id === vidId ? { 
          ...v, 
          videoType: 'direct',
          videoUrl: file.id,
          directFileId: file.id, 
          fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          thumbnailUrl: file.posterDataUrl ? file.id : v.thumbnailUrl 
        } : v)
      }));
      showToast(`Linked uploaded video file for direct playback!`);
    } else if (target.startsWith('app-icon:')) {
      const appId = target.replace('app-icon:', '');
      updateDraft(prev => ({
        ...prev,
        apps: prev.apps.map(a => a.id === appId ? { ...a, iconUrl: file.id } : a)
      }));
      showToast(`Updated app icon image!`);
    } else if (target.startsWith('app-apk:')) {
      const appId = target.replace('app-apk:', '');
      updateDraft(prev => ({
        ...prev,
        apps: prev.apps.map(a => a.id === appId ? { 
          ...a, 
          apkSource: 'direct',
          apkFileId: file.id, 
          apkFileName: file.name,
          fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
        } : a)
      }));
      showToast(`Linked APK binary file to app release!`);
    } else if (target === 'new-project') {
      const newProj: Project = {
        id: `proj_${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        description: 'New portfolio showcase item featuring custom uploaded media.',
        category: 'creative',
        thumbnailUrl: file.id,
        featured: true,
        visible: true,
        order: draftData.projects.length + 1
      };
      updateDraft(prev => ({
        ...prev,
        projects: [newProj, ...prev.projects]
      }));
      setSelectedElement({ type: 'project', id: newProj.id, title: newProj.title });
      showToast(`Created new Project with "${file.name}"!`);
    } else if (target === 'new-video') {
      const newVid: VideoItem = {
        id: `vid_${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        description: 'Directly uploaded video showcase with native HTML5 playback.',
        category: 'creative',
        videoType: 'direct',
        videoUrl: file.id,
        directFileId: file.id,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        thumbnailUrl: file.posterDataUrl ? file.id : undefined,
        featured: true
      };
      updateDraft(prev => ({
        ...prev,
        videos: [newVid, ...prev.videos]
      }));
      setSelectedElement({ type: 'video', id: newVid.id, title: newVid.title });
      showToast(`Created new Video showcase from "${file.name}"!`);
    } else if (target === 'new-app') {
      const newApp: AppItem = {
        id: `app_${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ''),
        version: 'v1.0.0',
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        description: 'Android APK package ready for direct download and installation.',
        status: 'Available',
        apkSource: 'direct',
        apkFileId: file.id,
        apkFileName: file.name
      };
      updateDraft(prev => ({
        ...prev,
        apps: [newApp, ...prev.apps]
      }));
      setSelectedElement({ type: 'app', id: newApp.id, title: newApp.name });
      showToast(`Created new App entry with APK "${file.name}"!`);
    }

    setSelectedMediaForPlacement(null);
    setShowMediaPickerModal(false);
  };

  /* Helper to scroll preview to a specific section */
  const scrollToPreviewSection = (id: string) => {
    const el = document.getElementById(`preview-sec-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Find currently selected entities
  const currentProject = selectedElement.type === 'project' 
    ? draftData.projects.find(p => p.id === selectedElement.id) 
    : null;

  const currentVideo = selectedElement.type === 'video'
    ? draftData.videos.find(v => v.id === selectedElement.id)
    : null;

  const currentApp = selectedElement.type === 'app'
    ? draftData.apps.find(a => a.id === selectedElement.id)
    : null;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-[#07090c] text-slate-100 overflow-hidden font-sans">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-[99] px-4 py-2.5 rounded-xl bg-teal-400 text-slate-950 font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Editor Top Navigation Bar */}
      <header className="h-16 px-4 border-b border-white/10 bg-[#0c1015] flex items-center justify-between shrink-0 z-20">
        
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-slate-950 font-extrabold text-sm shadow-[0_0_15px_rgba(45,212,191,0.3)]">
            M
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold tracking-wide text-white uppercase">
                Visual Website Editor
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                hasUnsavedChanges 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                  : 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
              }`}>
                {hasUnsavedChanges ? '● Unsaved Changes' : '✓ Live Synced'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              Click any element on the canvas to inspect, replace media, or edit text
            </p>
          </div>
        </div>

        {/* Center: Device Viewport Switcher & Preview Mode Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => setDeviceView('desktop')}
              className={`p-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                deviceView === 'desktop' ? 'bg-teal-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Desktop View (100% full width)"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Desktop</span>
            </button>

            <button
              type="button"
              onClick={() => setDeviceView('tablet')}
              className={`p-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                deviceView === 'tablet' ? 'bg-teal-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Tablet</span>
            </button>

            <button
              type="button"
              onClick={() => setDeviceView('mobile')}
              className={`p-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                deviceView === 'mobile' ? 'bg-teal-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Mobile View (375px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Mobile</span>
            </button>
          </div>

          {/* Preview vs Edit Mode Toggle */}
          <button
            type="button"
            onClick={() => {
              setIsPreviewMode(!isPreviewMode);
              if (!isPreviewMode) {
                setSelectedElement({ type: 'none', title: 'Page' });
              }
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
              isPreviewMode
                ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
            title="Toggle between Interactive Edit Mode and Clean Public Preview"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{isPreviewMode ? 'Exit Preview' : 'Preview Site'}</span>
          </button>
        </div>

        {/* Right Actions: Discard, Publish, Exit */}
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Discard unsaved draft changes and revert to live published website?')) {
                  onDiscard();
                  showToast('Reverted to published website');
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              title="Discard draft changes"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Discard</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              onPublish();
              showToast('Changes published to live website!');
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-400 text-slate-950 font-bold text-xs hover:bg-teal-300 transition-colors shadow-[0_0_20px_rgba(45,212,191,0.3)] cursor-pointer"
          >
            <UploadCloud className="w-4 h-4 stroke-[2.5]" />
            <span>Publish Live</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close visual editor"
            title="Exit Visual Editor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Editor Body: Left Sidebar + Center Preview + Right Properties Panel */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* ================= LEFT SIDEBAR (Add Elements / Pages & Sections / Media Library) ================= */}
        <aside className="w-72 sm:w-80 border-r border-white/10 bg-[#0a0e13] flex flex-col shrink-0 overflow-hidden z-10">
          
          {/* Left Navigation Tabs */}
          <div className="flex items-center border-b border-white/10 p-1.5 gap-1 bg-[#0d1217]">
            {[
              { id: 'elements', label: 'Add Elements', icon: <Plus className="w-3.5 h-3.5" /> },
              { id: 'sections', label: 'Pages/Sections', icon: <Layers className="w-3.5 h-3.5" /> },
              { id: 'media', label: 'Media Library', icon: <ImageIcon className="w-3.5 h-3.5" /> },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setLeftTab(tab.id as EditorLeftTab)}
                className={`flex-1 py-2 px-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  leftTab === tab.id
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.icon}
                <span className="truncate">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Left Sidebar Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            
            {/* TAB: ADD ELEMENTS */}
            {leftTab === 'elements' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Add Elements</h3>
                  <p className="text-[11px] text-slate-400">
                    Insert new projects, videos, APK downloads, or media directly into your site.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  <button
                    type="button"
                    onClick={handleAddNewProject}
                    className="p-3 rounded-xl bg-white/[0.04] hover:bg-teal-500/10 border border-white/10 hover:border-teal-500/40 text-left transition-all cursor-pointer group flex items-start gap-3"
                  >
                    <div className="p-2 rounded-lg bg-teal-500/15 text-teal-400 group-hover:scale-105 transition-transform">
                      <FolderGit2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-teal-300">
                        + New Project Card
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Add website demo with image thumbnail and live demo link.
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddNewVideo}
                    className="p-3 rounded-xl bg-white/[0.04] hover:bg-teal-500/10 border border-white/10 hover:border-teal-500/40 text-left transition-all cursor-pointer group flex items-start gap-3"
                  >
                    <div className="p-2 rounded-lg bg-blue-500/15 text-blue-400 group-hover:scale-105 transition-transform">
                      <Film className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-teal-300">
                        + New Video Showcase
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Add direct MP4/WebM video or YouTube link with custom poster.
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddNewApp}
                    className="p-3 rounded-xl bg-white/[0.04] hover:bg-teal-500/10 border border-white/10 hover:border-teal-500/40 text-left transition-all cursor-pointer group flex items-start gap-3"
                  >
                    <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 group-hover:scale-105 transition-transform">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-teal-300">
                        + New Android App & APK
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Upload APK binary, app icon, version, and direct download button.
                      </div>
                    </div>
                  </button>
                </div>

                {/* Direct Media Insertion Guide */}
                <div className="p-3.5 rounded-xl bg-teal-500/5 border border-teal-500/20 space-y-2 mt-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-teal-300">
                    <Info className="w-3.5 h-3.5" />
                    <span>How to Place Uploaded Media</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    1. Click any element on the website canvas (e.g. Hero visual, Project thumbnail, or Video).<br />
                    2. In the right panel, click <strong>"Choose from Media Library"</strong> or <strong>"Upload New"</strong>.<br />
                    3. Click <strong>"Insert into Website"</strong> to immediately display the media!
                  </p>
                </div>
              </div>
            )}

            {/* TAB: PAGES / SECTIONS */}
            {leftTab === 'sections' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Pages & Sections</h3>
                  <p className="text-[11px] text-slate-400">
                    Reorder sections, toggle visibility, and jump to edit content.
                  </p>
                </div>

                <div className="space-y-2">
                  {sectionKeys.map((secKey) => {
                    const isVisible = draftData.sectionsConfig[secKey]?.visible !== false;
                    return (
                      <div
                        key={secKey}
                        className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                          isVisible 
                            ? 'bg-white/[0.03] border-white/10 hover:border-teal-500/30' 
                            : 'bg-black/40 border-white/5 opacity-60'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            scrollToPreviewSection(secKey);
                            if (secKey === 'hero') setSelectedElement({ type: 'hero-text', title: 'Hero Section' });
                            else if (secKey === 'about') setSelectedElement({ type: 'about', title: 'About Bio' });
                            else if (secKey === 'contact') setSelectedElement({ type: 'contact', title: 'Contact Section' });
                          }}
                          className="flex items-center gap-2 min-w-0 text-left cursor-pointer"
                        >
                          <span className="w-2 h-2 rounded-full bg-teal-400" />
                          <span className="text-xs font-bold text-white capitalize truncate">{secKey} Section</span>
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => toggleSectionVisibility(secKey)}
                            className={`p-1.5 rounded-lg text-xs cursor-pointer ${
                              isVisible ? 'text-teal-400 hover:bg-teal-500/10' : 'text-slate-500 hover:bg-white/5'
                            }`}
                            title={isVisible ? 'Hide section' : 'Show section'}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: MEDIA LIBRARY & DIRECT PLACEMENT */}
            {leftTab === 'media' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Media Library</h3>
                    <p className="text-[10px] text-slate-400">IndexedDB Persistent Storage</p>
                  </div>
                  <button
                    type="button"
                    onClick={loadMedia}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs cursor-pointer"
                    title="Refresh media files"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Filter Badges */}
                <div className="flex items-center gap-1">
                  {(['all', 'image', 'video', 'apk'] as const).map(tab => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setMediaFilter(tab)}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors cursor-pointer text-center ${
                        mediaFilter === tab
                          ? 'bg-teal-400 text-slate-950'
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Direct Upload Dropzone */}
                <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2">
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
                    Upload to Library
                  </span>
                  <MediaUploader
                    category={mediaFilter === 'all' ? 'image' : mediaFilter}
                    onFileSelected={(res) => {
                      loadMedia();
                      showToast(`Uploaded "${res.fileName}" to Media Library`);
                    }}
                  />
                </div>

                {/* Stored Files Grid */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Saved Files ({mediaFiles.filter(f => mediaFilter === 'all' || f.category === mediaFilter).length})
                  </span>

                  {mediaFiles.length === 0 ? (
                    <div className="p-4 text-center rounded-xl bg-white/[0.02] border border-white/5 text-slate-500 text-[11px]">
                      No files uploaded yet. Upload an image, video, or APK above!
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                      {mediaFiles
                        .filter(f => mediaFilter === 'all' || f.category === mediaFilter)
                        .map(file => (
                          <div
                            key={file.id}
                            className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-teal-500/40 space-y-2 transition-all"
                          >
                            <div className="flex items-center gap-2.5">
                              {file.category === 'image' && file.dataUrl && (
                                <img src={file.dataUrl} alt="" className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0" />
                              )}
                              {file.category === 'video' && (
                                <div className="w-12 aspect-video bg-black rounded overflow-hidden shrink-0 border border-white/10 flex items-center justify-center">
                                  {file.posterDataUrl || file.dataUrl ? (
                                    <img src={file.posterDataUrl || file.dataUrl} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <Film className="w-4 h-4 text-teal-400" />
                                  )}
                                </div>
                              )}
                              {file.category === 'apk' && (
                                <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                                  <Smartphone className="w-4 h-4" />
                                </div>
                              )}

                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold text-white truncate">{file.name}</div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  {(file.size / (1024 * 1024)).toFixed(2)} MB · {file.category.toUpperCase()}
                                </div>
                              </div>
                            </div>

                            {/* Explicit Place Button */}
                            <div className="pt-2 border-t border-white/5 flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedMediaForPlacement(file);
                                  setPlacementTarget(file.category === 'image' ? 'hero' : file.category === 'video' ? 'new-video' : 'new-app');
                                }}
                                className="flex-1 py-1 px-2 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/30 text-teal-300 font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Place in Website</span>
                              </button>

                              <button
                                type="button"
                                onClick={async () => {
                                  if (window.confirm(`Delete "${file.name}" from persistent storage?`)) {
                                    await mediaStorage.deleteFile(file.id);
                                    loadMedia();
                                    showToast('File deleted');
                                  }
                                }}
                                className="p-1 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 cursor-pointer"
                                title="Delete"
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
        </aside>

        {/* ================= CENTER: LIVE INTERACTIVE PREVIEW CANVAS ================= */}
        <main className="flex-1 bg-[#050608] flex flex-col items-center justify-start p-2 sm:p-4 overflow-hidden relative">
          
          {/* Canvas Sub-Header Notification */}
          {!isPreviewMode && (
            <div className="w-full max-w-4xl mb-2 px-3 py-1.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-[11px] text-teal-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <MousePointerClick className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
                <span>Interactive Edit Mode Active: Click any section, title, image, or card below to edit or replace media.</span>
              </span>
              <button
                type="button"
                onClick={() => setIsPreviewMode(true)}
                className="text-[10px] underline font-bold hover:text-teal-200 cursor-pointer"
              >
                Hide outlines
              </button>
            </div>
          )}

          {/* Device Responsive Frame */}
          <div 
            className={`h-full transition-all duration-300 bg-[#08090a] rounded-2xl border border-white/10 overflow-y-auto shadow-2xl relative select-none ${
              deviceView === 'desktop' 
                ? 'w-full' 
                : deviceView === 'tablet' 
                ? 'w-[768px] max-w-full' 
                : 'w-[375px] max-w-full'
            }`}
          >
            {/* Live Portfolio Sections with Click-to-Edit Wrappers */}
            <div className="pointer-events-auto">
              
              {/* SECTION: HERO */}
              {draftData.sectionsConfig.hero.visible !== false && (
                <div id="preview-sec-hero" className="relative group/hero">
                  {!isPreviewMode && (
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedElement({ type: 'hero-visual', title: 'Hero Visual Artwork' });
                      }}
                      className={`absolute inset-0 z-30 transition-all pointer-events-auto cursor-pointer ${
                        selectedElement.type === 'hero-visual' || selectedElement.type === 'hero-text'
                          ? 'border-2 border-teal-400 bg-teal-500/[0.03] shadow-[inset_0_0_20px_rgba(45,212,191,0.15)]'
                          : 'border-2 border-transparent hover:border-teal-500/40 hover:bg-teal-500/[0.01]'
                      }`}
                    >
                      <div className="absolute top-3 right-3 flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 text-[10px] font-bold shadow-md flex items-center gap-1">
                          <MousePointerClick className="w-3 h-3" />
                          <span>Click to Edit Hero Visual & Text</span>
                        </span>
                      </div>
                    </div>
                  )}

                  <Hero
                    profile={draftData.profile}
                    animationConfig={draftData.animationConfig}
                    onExploreClick={() => scrollToPreviewSection('work')}
                    onConnectClick={() => scrollToPreviewSection('contact')}
                  />
                </div>
              )}

              {/* SECTION: PROJECTS (WORK) */}
              {draftData.sectionsConfig.work.visible !== false && (
                <div id="preview-sec-work" className="relative group/work">
                  {!isPreviewMode && (
                    <div className="absolute top-2 right-4 z-30">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddNewProject();
                        }}
                        className="px-2.5 py-1 rounded-full bg-teal-400 text-slate-950 text-[10px] font-bold shadow-lg flex items-center gap-1 cursor-pointer hover:bg-teal-300"
                      >
                        <Plus className="w-3 h-3" />
                        <span>+ Add Project</span>
                      </button>
                    </div>
                  )}

                  {/* Render Projects with individual card selection */}
                  <div className="relative">
                    <ProjectsSection
                      projects={draftData.projects}
                      headingOverride={draftData.sectionsConfig.work.headingOverride}
                    />

                    {/* Overlay click catcher for individual project cards */}
                    {!isPreviewMode && (
                      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-end p-8">
                        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-6 pointer-events-auto">
                          {draftData.projects.map((proj) => (
                            <div
                              key={proj.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedElement({ type: 'project', id: proj.id, title: proj.title });
                              }}
                              className={`h-48 rounded-2xl cursor-pointer transition-all flex items-end justify-between p-3 ${
                                selectedElement.type === 'project' && selectedElement.id === proj.id
                                  ? 'border-2 border-teal-400 bg-teal-500/10 shadow-[0_0_15px_rgba(45,212,191,0.2)]'
                                  : 'border-2 border-dashed border-transparent hover:border-teal-500/40 hover:bg-teal-500/[0.03]'
                              }`}
                            >
                              <span className="px-2 py-0.5 rounded bg-black/80 border border-teal-500/40 text-teal-300 text-[10px] font-bold">
                                Edit: {proj.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SECTION: VIDEOS */}
              {draftData.sectionsConfig.videos.visible !== false && (
                <div id="preview-sec-videos" className="relative group/videos">
                  {!isPreviewMode && (
                    <div className="absolute top-2 right-4 z-30">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddNewVideo();
                        }}
                        className="px-2.5 py-1 rounded-full bg-teal-400 text-slate-950 text-[10px] font-bold shadow-lg flex items-center gap-1 cursor-pointer hover:bg-teal-300"
                      >
                        <Plus className="w-3 h-3" />
                        <span>+ Add Video</span>
                      </button>
                    </div>
                  )}

                  <div className="relative">
                    <VideoSection
                      videos={draftData.videos}
                      headingOverride={draftData.sectionsConfig.videos.headingOverride}
                    />

                    {/* Overlay click catcher for individual videos */}
                    {!isPreviewMode && (
                      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-end p-8">
                        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-6 pointer-events-auto">
                          {draftData.videos.map((vid) => (
                            <div
                              key={vid.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedElement({ type: 'video', id: vid.id, title: vid.title });
                              }}
                              className={`h-44 rounded-2xl cursor-pointer transition-all flex items-end justify-between p-3 ${
                                selectedElement.type === 'video' && selectedElement.id === vid.id
                                  ? 'border-2 border-teal-400 bg-teal-500/10 shadow-[0_0_15px_rgba(45,212,191,0.2)]'
                                  : 'border-2 border-dashed border-transparent hover:border-teal-500/40 hover:bg-teal-500/[0.03]'
                              }`}
                            >
                              <span className="px-2 py-0.5 rounded bg-black/80 border border-teal-500/40 text-teal-300 text-[10px] font-bold">
                                Edit: {vid.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SECTION: APPS & APK RELEASES */}
              {draftData.sectionsConfig.apps.visible !== false && (
                <div id="preview-sec-apps" className="relative group/apps">
                  {!isPreviewMode && (
                    <div className="absolute top-2 right-4 z-30">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddNewApp();
                        }}
                        className="px-2.5 py-1 rounded-full bg-teal-400 text-slate-950 text-[10px] font-bold shadow-lg flex items-center gap-1 cursor-pointer hover:bg-teal-300"
                      >
                        <Plus className="w-3 h-3" />
                        <span>+ Add App / APK</span>
                      </button>
                    </div>
                  )}

                  <div className="relative">
                    <AppsSection
                      apps={draftData.apps}
                      headingOverride={draftData.sectionsConfig.apps.headingOverride}
                    />

                    {/* Overlay click catcher for individual apps */}
                    {!isPreviewMode && (
                      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-end p-8">
                        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-6 pointer-events-auto">
                          {draftData.apps.map((app) => (
                            <div
                              key={app.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedElement({ type: 'app', id: app.id, title: app.name });
                              }}
                              className={`h-40 rounded-2xl cursor-pointer transition-all flex items-end justify-between p-3 ${
                                selectedElement.type === 'app' && selectedElement.id === app.id
                                  ? 'border-2 border-teal-400 bg-teal-500/10 shadow-[0_0_15px_rgba(45,212,191,0.2)]'
                                  : 'border-2 border-dashed border-transparent hover:border-teal-500/40 hover:bg-teal-500/[0.03]'
                              }`}
                            >
                              <span className="px-2 py-0.5 rounded bg-black/80 border border-teal-500/40 text-teal-300 text-[10px] font-bold">
                                Edit: {app.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SECTION: ABOUT */}
              {draftData.sectionsConfig.about.visible !== false && (
                <div 
                  id="preview-sec-about" 
                  onClick={() => !isPreviewMode && setSelectedElement({ type: 'about', title: 'About Bio & Skills' })}
                  className={`relative ${
                    !isPreviewMode && selectedElement.type === 'about'
                      ? 'ring-2 ring-teal-400 bg-teal-500/[0.02]'
                      : ''
                  }`}
                >
                  <AboutSection
                    profile={draftData.profile}
                    headingOverride={draftData.sectionsConfig.about.headingOverride}
                  />
                </div>
              )}

              {/* SECTION: CONTACT */}
              {draftData.sectionsConfig.contact.visible !== false && (
                <div 
                  id="preview-sec-contact" 
                  onClick={() => !isPreviewMode && setSelectedElement({ type: 'contact', title: 'Contact Information' })}
                  className={`relative ${
                    !isPreviewMode && selectedElement.type === 'contact'
                      ? 'ring-2 ring-teal-400 bg-teal-500/[0.02]'
                      : ''
                  }`}
                >
                  <ContactSection
                    profile={draftData.profile}
                    headingOverride={draftData.sectionsConfig.contact.headingOverride}
                  />
                </div>
              )}

              {/* FOOTER */}
              <Footer onOpenAdmin={() => {}} />
            </div>
          </div>
        </main>

        {/* ================= RIGHT PROPERTIES PANEL (Opens when element is selected) ================= */}
        <aside className="w-80 sm:w-96 border-l border-white/10 bg-[#0a0e13] flex flex-col shrink-0 overflow-hidden z-10">
          
          {/* Header of Properties Panel */}
          <div className="p-3.5 border-b border-white/10 bg-[#0d1217] flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block">
                  Properties Panel
                </span>
                <h4 className="text-xs font-bold text-white truncate">
                  {selectedElement.title}
                </h4>
              </div>
            </div>

            {selectedElement.type !== 'none' && (
              <button
                type="button"
                onClick={() => setSelectedElement({ type: 'none', title: 'Page Theme & Style' })}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 text-xs cursor-pointer"
                title="Deselect element"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Body of Properties Panel */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            
            {/* 1. HERO VISUAL OR HERO TEXT SELECTED */}
            {(selectedElement.type === 'hero-visual' || selectedElement.type === 'hero-text') && (
              <div className="space-y-5">
                
                {/* Media Replacement for Hero */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-teal-400" />
                    <span>Hero 3D Visual / Custom Image</span>
                  </span>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Upload a custom 3D artwork, render, or photo. If empty, the futuristic metallic torus renders by default.
                  </p>

                  {/* Actions to pick or upload */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMediaPickerCategory('image');
                        setMediaPickerTarget('hero');
                        setShowMediaPickerModal(true);
                      }}
                      className="flex-1 py-1.5 px-2.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Choose from Library</span>
                    </button>
                  </div>

                  <MediaUploader
                    category="image"
                    label="Direct Image Upload"
                    currentValue={draftData.profile.heroBgImage}
                    onFileSelected={(res) => {
                      updateDraft(prev => ({
                        ...prev,
                        profile: { ...prev.profile, heroBgImage: res.fileId }
                      }));
                      showToast('Hero artwork updated and saved to draft!');
                    }}
                    onRemove={() => {
                      updateDraft(prev => ({
                        ...prev,
                        profile: { ...prev.profile, heroBgImage: undefined }
                      }));
                      showToast('Hero artwork reset to default 3D torus');
                    }}
                  />

                  {/* Fit Mode */}
                  <div className="space-y-1 pt-2">
                    <label className="text-[11px] font-semibold text-slate-300">Artwork Fit</label>
                    <select
                      value={draftData.profile.heroImageFit || 'contain'}
                      onChange={(e) => updateDraft(prev => ({
                        ...prev,
                        profile: { ...prev.profile, heroImageFit: e.target.value as any }
                      }))}
                      className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                    >
                      <option value="contain">Contain (Centered & Balanced)</option>
                      <option value="cover">Cover (Dramatic Full Bleed)</option>
                    </select>
                  </div>
                </div>

                {/* Hero Text Fields */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5 text-teal-400" />
                    <span>Hero Typography & Names</span>
                  </span>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Display Name</label>
                    <input
                      type="text"
                      value={draftData.profile.name}
                      onChange={(e) => updateDraft(prev => ({
                        ...prev,
                        profile: { ...prev.profile, name: e.target.value }
                      }))}
                      className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Status Kicker Badge</label>
                    <input
                      type="text"
                      value={draftData.profile.kicker}
                      onChange={(e) => updateDraft(prev => ({
                        ...prev,
                        profile: { ...prev.profile, kicker: e.target.value }
                      }))}
                      className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Greeting Subtitle</label>
                    <input
                      type="text"
                      value={draftData.profile.tagline}
                      onChange={(e) => updateDraft(prev => ({
                        ...prev,
                        profile: { ...prev.profile, tagline: e.target.value }
                      }))}
                      className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Sub-headline Description</label>
                    <textarea
                      rows={3}
                      value={draftData.profile.subTagline}
                      onChange={(e) => updateDraft(prev => ({
                        ...prev,
                        profile: { ...prev.profile, subTagline: e.target.value }
                      }))}
                      className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                    />
                  </div>
                </div>

              </div>
            )}

            {/* 2. PROJECT SELECTED */}
            {selectedElement.type === 'project' && currentProject && (
              <div className="space-y-5">
                
                {/* Project Media (Thumbnail) */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-teal-400" />
                    <span>Project Thumbnail</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setMediaPickerCategory('image');
                      setMediaPickerTarget(`project:${currentProject.id}`);
                      setShowMediaPickerModal(true);
                    }}
                    className="w-full py-1.5 px-2.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Choose from Media Library</span>
                  </button>

                  <MediaUploader
                    category="image"
                    label="Upload New Thumbnail"
                    currentValue={currentProject.thumbnailUrl}
                    onFileSelected={(res) => {
                      updateDraft(prev => ({
                        ...prev,
                        projects: prev.projects.map(p => p.id === currentProject.id ? { ...p, thumbnailUrl: res.fileId } : p)
                      }));
                      showToast('Thumbnail updated and linked to project!');
                    }}
                    onRemove={() => {
                      updateDraft(prev => ({
                        ...prev,
                        projects: prev.projects.map(p => p.id === currentProject.id ? { ...p, thumbnailUrl: undefined } : p)
                      }));
                      showToast('Thumbnail removed');
                    }}
                  />
                </div>

                {/* Project Content */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <FolderGit2 className="w-3.5 h-3.5 text-teal-400" />
                    <span>Project Details</span>
                  </span>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Project Title</label>
                    <input
                      type="text"
                      value={currentProject.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateDraft(prev => ({
                          ...prev,
                          projects: prev.projects.map(p => p.id === currentProject.id ? { ...p, title: val } : p)
                        }));
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Category</label>
                    <select
                      value={currentProject.category}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        updateDraft(prev => ({
                          ...prev,
                          projects: prev.projects.map(p => p.id === currentProject.id ? { ...p, category: val } : p)
                        }));
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                    >
                      <option value="web">Web Development</option>
                      <option value="app">Android App</option>
                      <option value="creative">Creative Visual</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Description</label>
                    <textarea
                      rows={3}
                      value={currentProject.description}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateDraft(prev => ({
                          ...prev,
                          projects: prev.projects.map(p => p.id === currentProject.id ? { ...p, description: val } : p)
                        }));
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Live Demo URL</label>
                    <input
                      type="text"
                      value={currentProject.liveUrl || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateDraft(prev => ({
                          ...prev,
                          projects: prev.projects.map(p => p.id === currentProject.id ? { ...p, liveUrl: val } : p)
                        }));
                      }}
                      placeholder="https://example.com"
                      className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Delete Project */}
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Delete project "${currentProject.title}"?`)) {
                      updateDraft(prev => ({
                        ...prev,
                        projects: prev.projects.filter(p => p.id !== currentProject.id)
                      }));
                      setSelectedElement({ type: 'none', title: 'Page' });
                      showToast('Project deleted');
                    }
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Project</span>
                </button>
              </div>
            )}

            {/* 3. VIDEO SELECTED */}
            {selectedElement.type === 'video' && currentVideo && (
              <div className="space-y-5">
                
                {/* Direct Video File Upload & Playback */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5 text-teal-400" />
                    <span>Direct Video Media</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setMediaPickerCategory('video');
                      setMediaPickerTarget(`video-file:${currentVideo.id}`);
                      setShowMediaPickerModal(true);
                    }}
                    className="w-full py-1.5 px-2.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>Choose Video from Media Library</span>
                  </button>

                  <MediaUploader
                    category="video"
                    label="Upload MP4 or WebM Video"
                    currentValue={currentVideo.directFileId}
                    onFileSelected={(res) => {
                      updateDraft(prev => ({
                        ...prev,
                        videos: prev.videos.map(v => v.id === currentVideo.id ? { 
                          ...v, 
                          videoType: 'direct',
                          videoUrl: res.fileId,
                          directFileId: res.fileId,
                          fileSize: `${(res.size / (1024 * 1024)).toFixed(1)} MB`,
                          thumbnailUrl: res.posterUrl || v.thumbnailUrl
                        } : v)
                      }));
                      showToast('Video media attached and saved!');
                    }}
                    onRemove={() => {
                      updateDraft(prev => ({
                        ...prev,
                        videos: prev.videos.map(v => v.id === currentVideo.id ? { 
                          ...v, 
                          directFileId: undefined,
                          fileSize: undefined 
                        } : v)
                      }));
                      showToast('Direct video removed');
                    }}
                  />
                </div>

                {/* Custom Video Thumbnail */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-teal-400" />
                    <span>Custom Poster Thumbnail</span>
                  </span>

                  <MediaUploader
                    category="image"
                    label="Poster Image"
                    currentValue={currentVideo.thumbnailUrl}
                    onFileSelected={(res) => {
                      updateDraft(prev => ({
                        ...prev,
                        videos: prev.videos.map(v => v.id === currentVideo.id ? { ...v, thumbnailUrl: res.fileId } : v)
                      }));
                      showToast('Custom video thumbnail saved!');
                    }}
                    onRemove={() => {
                      updateDraft(prev => ({
                        ...prev,
                        videos: prev.videos.map(v => v.id === currentVideo.id ? { ...v, thumbnailUrl: undefined } : v)
                      }));
                    }}
                  />
                </div>

                {/* Video Details */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Video Information</span>
                  
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Video Title</label>
                    <input
                      type="text"
                      value={currentVideo.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateDraft(prev => ({
                          ...prev,
                          videos: prev.videos.map(v => v.id === currentVideo.id ? { ...v, title: val } : v)
                        }));
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Video URL (YouTube or Direct)</label>
                    <input
                      type="text"
                      value={currentVideo.videoUrl}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateDraft(prev => ({
                          ...prev,
                          videos: prev.videos.map(v => v.id === currentVideo.id ? { ...v, videoUrl: val } : v)
                        }));
                      }}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Delete Video */}
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Delete video "${currentVideo.title}"?`)) {
                      updateDraft(prev => ({
                        ...prev,
                        videos: prev.videos.filter(v => v.id !== currentVideo.id)
                      }));
                      setSelectedElement({ type: 'none', title: 'Page' });
                      showToast('Video deleted');
                    }
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Video</span>
                </button>
              </div>
            )}

            {/* 4. APP SELECTED */}
            {selectedElement.type === 'app' && currentApp && (
              <div className="space-y-5">
                
                {/* APK Binary Media */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-teal-400" />
                    <span>Android APK Binary</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setMediaPickerCategory('apk');
                      setMediaPickerTarget(`app-apk:${currentApp.id}`);
                      setShowMediaPickerModal(true);
                    }}
                    className="w-full py-1.5 px-2.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Choose APK from Media Library</span>
                  </button>

                  <MediaUploader
                    category="apk"
                    label="Upload APK Package"
                    currentValue={currentApp.apkFileId}
                    onFileSelected={(res) => {
                      updateDraft(prev => ({
                        ...prev,
                        apps: prev.apps.map(a => a.id === currentApp.id ? { 
                          ...a, 
                          apkSource: 'direct',
                          apkFileId: res.fileId,
                          apkFileName: res.fileName,
                          fileSize: `${(res.size / (1024 * 1024)).toFixed(1)} MB`
                        } : a)
                      }));
                      showToast('APK package linked for direct download!');
                    }}
                    onRemove={() => {
                      updateDraft(prev => ({
                        ...prev,
                        apps: prev.apps.map(a => a.id === currentApp.id ? { 
                          ...a, 
                          apkFileId: undefined,
                          apkFileName: undefined 
                        } : a)
                      }));
                      showToast('APK unlinked');
                    }}
                  />
                </div>

                {/* App Icon */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-teal-400" />
                    <span>App Icon</span>
                  </span>

                  <MediaUploader
                    category="image"
                    label="App Icon Image"
                    currentValue={currentApp.iconUrl}
                    onFileSelected={(res) => {
                      updateDraft(prev => ({
                        ...prev,
                        apps: prev.apps.map(a => a.id === currentApp.id ? { ...a, iconUrl: res.fileId } : a)
                      }));
                      showToast('App icon updated!');
                    }}
                    onRemove={() => {
                      updateDraft(prev => ({
                        ...prev,
                        apps: prev.apps.map(a => a.id === currentApp.id ? { ...a, iconUrl: undefined } : a)
                      }));
                    }}
                  />
                </div>

                {/* App Details */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">App Information</span>
                  
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">App Name</label>
                    <input
                      type="text"
                      value={currentApp.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateDraft(prev => ({
                          ...prev,
                          apps: prev.apps.map(a => a.id === currentApp.id ? { ...a, name: val } : a)
                        }));
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300">Version</label>
                      <input
                        type="text"
                        value={currentApp.version}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDraft(prev => ({
                            ...prev,
                            apps: prev.apps.map(a => a.id === currentApp.id ? { ...a, version: val } : a)
                          }));
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300">Status</label>
                      <select
                        value={currentApp.status}
                        onChange={(e) => {
                          const val = e.target.value as any;
                          updateDraft(prev => ({
                            ...prev,
                            apps: prev.apps.map(a => a.id === currentApp.id ? { ...a, status: val } : a)
                          }));
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                      >
                        <option value="Available">Available</option>
                        <option value="Updated">Updated</option>
                        <option value="Coming Soon">Coming Soon</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Delete App */}
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Delete app "${currentApp.name}"?`)) {
                      updateDraft(prev => ({
                        ...prev,
                        apps: prev.apps.filter(a => a.id !== currentApp.id)
                      }));
                      setSelectedElement({ type: 'none', title: 'Page' });
                      showToast('App deleted');
                    }
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete App</span>
                </button>
              </div>
            )}

            {/* 5. ABOUT SECTION SELECTED */}
            {selectedElement.type === 'about' && (
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">About Bio & Story</span>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">About Heading</label>
                    <input
                      type="text"
                      value={draftData.sectionsConfig.about.headingOverride || ''}
                      onChange={(e) => updateDraft(prev => ({
                        ...prev,
                        sectionsConfig: {
                          ...prev.sectionsConfig,
                          about: { ...prev.sectionsConfig.about, headingOverride: e.target.value }
                        }
                      }))}
                      placeholder="Crafting Digital Stories & Interfaces"
                      className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Full Bio</label>
                    <textarea
                      rows={5}
                      value={draftData.profile.aboutBio}
                      onChange={(e) => updateDraft(prev => ({
                        ...prev,
                        profile: { ...prev.profile, aboutBio: e.target.value }
                      }))}
                      className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 6. CONTACT SECTION SELECTED */}
            {selectedElement.type === 'contact' && (
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Contact Details</span>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Email Address</label>
                    <input
                      type="email"
                      value={draftData.profile.email || ''}
                      onChange={(e) => updateDraft(prev => ({
                        ...prev,
                        profile: { ...prev.profile, email: e.target.value }
                      }))}
                      className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">GitHub Profile</label>
                    <input
                      type="text"
                      value={draftData.profile.socials.github || ''}
                      onChange={(e) => updateDraft(prev => ({
                        ...prev,
                        profile: { 
                          ...prev.profile, 
                          socials: { ...prev.profile.socials, github: e.target.value }
                        }
                      }))}
                      className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 7. NO ELEMENT SELECTED: GLOBAL STYLING & THEMING */}
            {selectedElement.type === 'none' && (
              <div className="space-y-5">
                <div className="p-3.5 rounded-xl bg-teal-500/5 border border-teal-500/20 text-xs text-teal-300 flex items-center gap-2">
                  <MousePointerClick className="w-4 h-4 shrink-0 text-teal-400" />
                  <span>Click any section or card in the preview to edit its content and place media.</span>
                </div>

                {/* Accent Color Palette */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-teal-400" />
                    <span>Accent Highlight Color</span>
                  </span>

                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { name: 'Mint Teal', hex: '#2dd4bf' },
                      { name: 'Emerald', hex: '#10b981' },
                      { name: 'Cyan', hex: '#06b6d4' },
                      { name: 'Electric', hex: '#3b82f6' },
                      { name: 'Violet', hex: '#8b5cf6' },
                      { name: 'Pink', hex: '#ec4899' },
                      { name: 'Amber', hex: '#f59e0b' },
                      { name: 'Rose', hex: '#f43f5e' },
                    ].map(c => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => updateDraft(prev => ({
                          ...prev,
                          themeConfig: { ...prev.themeConfig, accentColor: c.hex }
                        }))}
                        className={`h-9 rounded-xl border flex items-center justify-center cursor-pointer transition-transform hover:scale-105 ${
                          draftData.themeConfig.accentColor === c.hex ? 'border-white scale-105 shadow-md' : 'border-white/10'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      >
                        {draftData.themeConfig.accentColor === c.hex && (
                          <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Typography Font */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5 text-teal-400" />
                    <span>Portfolio Font Family</span>
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'plus-jakarta', name: 'Plus Jakarta' },
                      { id: 'outfit', name: 'Outfit Modern' },
                      { id: 'urbanist', name: 'Urbanist' },
                      { id: 'manrope', name: 'Manrope' },
                      { id: 'inter', name: 'Inter' },
                      { id: 'mono', name: 'JetBrains Mono' },
                    ].map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => updateDraft(prev => ({
                          ...prev,
                          themeConfig: { ...prev.themeConfig, fontFamily: f.id as any }
                        }))}
                        className={`py-2 px-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                          draftData.themeConfig.fontFamily === f.id
                            ? 'bg-teal-400 text-slate-950 border-teal-400 font-bold'
                            : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Background Aurora */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white block">Subtle Background Aurora</span>
                    <span className="text-[10px] text-slate-400">Restrained soft atmospheric lighting</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={draftData.animationConfig.backgroundMotion !== false}
                    onChange={(e) => updateDraft(prev => ({
                      ...prev,
                      animationConfig: { ...prev.animationConfig, backgroundMotion: e.target.checked }
                    }))}
                    className="w-4 h-4 rounded accent-teal-400 cursor-pointer"
                  />
                </div>
              </div>
            )}

          </div>
        </aside>

      </div>

      {/* ================= MODAL: CHOOSE MEDIA FROM LIBRARY FOR ELEMENT ================= */}
      {showMediaPickerModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-[#0c1015] border border-white/10 rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-teal-400" />
                  <span>Choose Media from Library</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Select a saved file to insert into this element.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowMediaPickerModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Grid of files matching category */}
            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {mediaFiles.filter(f => f.category === mediaPickerCategory).length === 0 ? (
                <div className="p-8 text-center bg-white/[0.02] border border-white/5 rounded-xl text-slate-400 text-xs">
                  No {mediaPickerCategory} files found in library. Use the upload panel to add one.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {mediaFiles
                    .filter(f => f.category === mediaPickerCategory)
                    .map(file => (
                      <div
                        key={file.id}
                        className="p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-teal-500/50 flex items-center gap-3 cursor-pointer group transition-all"
                        onClick={() => handleExecutePlacement(file, mediaPickerTarget)}
                      >
                        {file.category === 'image' && file.dataUrl && (
                          <img src={file.dataUrl} alt="" className="w-12 h-12 rounded-lg object-cover border border-white/10 shrink-0" />
                        )}
                        {file.category === 'video' && (
                          <div className="w-14 aspect-video bg-black rounded overflow-hidden shrink-0 border border-white/10 flex items-center justify-center">
                            {file.posterDataUrl || file.dataUrl ? (
                              <img src={file.posterDataUrl || file.dataUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Film className="w-4 h-4 text-teal-400" />
                            )}
                          </div>
                        )}
                        {file.category === 'apk' && (
                          <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                            <Smartphone className="w-5 h-5" />
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-white group-hover:text-teal-300 truncate">
                            {file.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </div>
                          <span className="text-[9px] font-bold text-teal-400 uppercase mt-1 block">
                            Click to Insert →
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-white/5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowMediaPickerModal(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: PLACE MEDIA INTO TARGET DESTINATION ================= */}
      {selectedMediaForPlacement && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#0c1015] border border-white/10 rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Place Media into Website</h3>
                <p className="text-xs text-slate-400 truncate max-w-xs">{selectedMediaForPlacement.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMediaForPlacement(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Options */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Choose Destination</label>

              {selectedMediaForPlacement.category === 'image' && (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setPlacementTarget('hero')}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs font-semibold cursor-pointer transition-all ${
                      placementTarget === 'hero' ? 'bg-teal-500/20 border-teal-500/40 text-teal-300' : 'bg-white/5 border-white/5 text-slate-300'
                    }`}
                  >
                    Hero 3D Abstract Visual / Background
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlacementTarget('new-project')}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs font-semibold cursor-pointer transition-all ${
                      placementTarget === 'new-project' ? 'bg-teal-500/20 border-teal-500/40 text-teal-300' : 'bg-white/5 border-white/5 text-slate-300'
                    }`}
                  >
                    + Create New Project with this image
                  </button>

                  {draftData.projects.map(proj => (
                    <button
                      key={proj.id}
                      type="button"
                      onClick={() => setPlacementTarget(`project:${proj.id}`)}
                      className={`w-full p-2.5 rounded-xl border text-left text-xs font-semibold cursor-pointer transition-all truncate ${
                        placementTarget === `project:${proj.id}` ? 'bg-teal-500/20 border-teal-500/40 text-teal-300' : 'bg-white/5 border-white/5 text-slate-300'
                      }`}
                    >
                      Project Thumbnail: {proj.title}
                    </button>
                  ))}
                </div>
              )}

              {selectedMediaForPlacement.category === 'video' && (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setPlacementTarget('new-video')}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs font-semibold cursor-pointer transition-all ${
                      placementTarget === 'new-video' ? 'bg-teal-500/20 border-teal-500/40 text-teal-300' : 'bg-white/5 border-white/5 text-slate-300'
                    }`}
                  >
                    + Create New Video Showcase entry
                  </button>

                  {draftData.videos.map(vid => (
                    <button
                      key={vid.id}
                      type="button"
                      onClick={() => setPlacementTarget(`video-file:${vid.id}`)}
                      className={`w-full p-2.5 rounded-xl border text-left text-xs font-semibold cursor-pointer transition-all truncate ${
                        placementTarget === `video-file:${vid.id}` ? 'bg-teal-500/20 border-teal-500/40 text-teal-300' : 'bg-white/5 border-white/5 text-slate-300'
                      }`}
                    >
                      Replace Video in: {vid.title}
                    </button>
                  ))}
                </div>
              )}

              {selectedMediaForPlacement.category === 'apk' && (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setPlacementTarget('new-app')}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs font-semibold cursor-pointer transition-all ${
                      placementTarget === 'new-app' ? 'bg-teal-500/20 border-teal-500/40 text-teal-300' : 'bg-white/5 border-white/5 text-slate-300'
                    }`}
                  >
                    + Create New Android App Release with this APK
                  </button>

                  {draftData.apps.map(app => (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => setPlacementTarget(`app-apk:${app.id}`)}
                      className={`w-full p-2.5 rounded-xl border text-left text-xs font-semibold cursor-pointer transition-all truncate ${
                        placementTarget === `app-apk:${app.id}` ? 'bg-teal-500/20 border-teal-500/40 text-teal-300' : 'bg-white/5 border-white/5 text-slate-300'
                      }`}
                    >
                      Attach APK to: {app.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Explicit Insert Button */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedMediaForPlacement(null)}
                className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleExecutePlacement(selectedMediaForPlacement, placementTarget)}
                className="flex-1 py-2 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Insert into Website</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
