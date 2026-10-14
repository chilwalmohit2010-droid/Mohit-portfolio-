import React, { useState } from 'react';
import { 
  PortfolioData, 
  Project, 
  VideoItem, 
  AppItem, 
  ProjectCategory, 
  AppStatus,
  VideoType,
  ApkSource
} from '../../types/portfolio';
import { 
  saveDraftData,
  publishDraft,
  discardDraft,
  hasUnsavedDraftChanges,
  resetToDefaults,
  exportPortfolioJson, 
  importPortfolioJson,
  logoutAdmin 
} from '../../services/portfolioStorage';
import { 
  extractYouTubeId, 
  getYouTubeThumbnail, 
  isValidHttpUrl, 
  isValidEmail 
} from '../../utils/urlHelper';
import { mediaStorage, StoredMediaFile } from '../../services/mediaStorage';
import { 
  LayoutDashboard, 
  FolderGit2, 
  Film, 
  Smartphone, 
  UserCheck, 
  Share2, 
  Settings, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit2, 
  ArrowUp, 
  ArrowDown, 
  Check, 
  AlertTriangle, 
  Download, 
  Upload, 
  Eye, 
  X,
  Sparkles,
  Palette,
  Type,
  Sliders,
  UploadCloud,
  Image as ImageIcon,
  RotateCcw
} from 'lucide-react';
import { MediaUploader } from './MediaUploader';
import { VisualEditor } from './VisualEditor';

interface AdminDashboardProps {
  portfolioData: PortfolioData;
  onUpdate: (newData: PortfolioData) => void;
  onClose: () => void;
}

type TabType = 
  | 'overview' 
  | 'projects' 
  | 'videos' 
  | 'apps' 
  | 'media'
  | 'typography' 
  | 'animations' 
  | 'bio' 
  | 'contact' 
  | 'backups' 
  | 'settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  portfolioData,
  onUpdate,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [data, setData] = useState<PortfolioData>(portfolioData);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showVisualEditor, setShowVisualEditor] = useState(false);

  // Modals
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isNewProject, setIsNewProject] = useState(false);

  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [isNewVideo, setIsNewVideo] = useState(false);

  const [editingApp, setEditingApp] = useState<AppItem | null>(null);
  const [isNewApp, setIsNewApp] = useState(false);

  // Deletion confirm
  const [confirmDelete, setConfirmDelete] = useState<{
    type: 'project' | 'video' | 'app' | 'media' | 'reset';
    id?: string;
    name?: string;
  } | null>(null);

  // Media Library state
  const [mediaFiles, setMediaFiles] = useState<StoredMediaFile[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [mediaFilter, setMediaFilter] = useState<'all' | 'image' | 'video' | 'apk'>('all');

  const refreshMediaFiles = async () => {
    setLoadingMedia(true);
    try {
      const files = await mediaStorage.listFiles();
      setMediaFiles(files);
    } catch (e) {
      console.error('Error fetching media files:', e);
    } finally {
      setLoadingMedia(false);
    }
  };

  React.useEffect(() => {
    if (activeTab === 'media') {
      refreshMediaFiles();
    }
  }, [activeTab]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const persistDraft = (updated: PortfolioData, message = 'Draft saved') => {
    setData(updated);
    saveDraftData(updated);
    onUpdate(updated);
    showToast(message);
  };

  const handlePublish = () => {
    publishDraft();
    const published = { ...data, publishedAt: new Date().toISOString() };
    setData(published);
    onUpdate(published);
    showToast('Published live to website!');
  };

  const handleDiscard = () => {
    const published = discardDraft();
    setData(published);
    onUpdate(published);
    showToast('Reverted to published version');
  };

  const handleLogout = () => {
    logoutAdmin();
    onClose();
  };

  /* ================= PROJECTS LOGIC ================= */
  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    let updatedProjects: Project[];
    if (isNewProject) {
      updatedProjects = [...data.projects, { ...editingProject, order: data.projects.length + 1 }];
    } else {
      updatedProjects = data.projects.map(p => p.id === editingProject.id ? editingProject : p);
    }

    persistDraft({ ...data, projects: updatedProjects }, isNewProject ? 'Project added to draft' : 'Project updated in draft');
    setEditingProject(null);
  };

  const handleDeleteProject = (id: string) => {
    const updatedProjects = data.projects.filter(p => p.id !== id);
    persistDraft({ ...data, projects: updatedProjects }, 'Project deleted');
    setConfirmDelete(null);
  };

  const handleMoveProject = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= data.projects.length) return;

    const list = [...data.projects];
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    persistDraft({ ...data, projects: list }, 'Project reordered');
  };

  /* ================= VIDEOS LOGIC ================= */
  const handleSaveVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo) return;

    let updatedVideos: VideoItem[];
    if (isNewVideo) {
      updatedVideos = [...data.videos, editingVideo];
    } else {
      updatedVideos = data.videos.map(v => v.id === editingVideo.id ? editingVideo : v);
    }

    persistDraft({ ...data, videos: updatedVideos }, isNewVideo ? 'Video added to draft' : 'Video updated');
    setEditingVideo(null);
  };

  const handleDeleteVideo = (id: string) => {
    const updatedVideos = data.videos.filter(v => v.id !== id);
    persistDraft({ ...data, videos: updatedVideos }, 'Video removed');
    setConfirmDelete(null);
  };

  /* ================= APPS LOGIC ================= */
  const handleSaveApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp) return;

    let updatedApps: AppItem[];
    if (isNewApp) {
      updatedApps = [...data.apps, editingApp];
    } else {
      updatedApps = data.apps.map(a => a.id === editingApp.id ? editingApp : a);
    }

    persistDraft({ ...data, apps: updatedApps }, isNewApp ? 'App added to draft' : 'App updated');
    setEditingApp(null);
  };

  const handleDeleteApp = (id: string) => {
    const updatedApps = data.apps.filter(a => a.id !== id);
    persistDraft({ ...data, apps: updatedApps }, 'App removed');
    setConfirmDelete(null);
  };

  /* ================= EXPORT & IMPORT ================= */
  const handleExport = () => {
    const jsonStr = exportPortfolioJson(true);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mohit-portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Portfolio JSON exported');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importPortfolioJson(content);
      if (res.success) {
        const fresh = JSON.parse(content) as PortfolioData;
        setData(fresh);
        onUpdate(fresh);
        showToast('Backup restored successfully');
      } else {
        alert(res.error || 'Failed to import backup');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    const defaults = resetToDefaults();
    setData(defaults);
    onUpdate(defaults);
    setConfirmDelete(null);
    showToast('Reset to default templates');
  };

  const unsavedChanges = hasUnsavedDraftChanges();

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#080a0d] text-slate-100 overflow-hidden font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[70] px-4 py-2.5 rounded-xl bg-teal-400 text-slate-950 font-bold text-xs shadow-2xl flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <div className="h-16 px-4 sm:px-6 border-b border-white/10 bg-[#0d1115] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/40 flex items-center justify-center text-teal-400 font-bold text-sm">
            m
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-white tracking-wide">
                MOHIT PORTFOLIO ADMIN
              </h1>
              {unsavedChanges ? (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300">
                  Unsaved Draft
                </span>
              ) : (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300">
                  Live Synced
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 font-medium">
              Owner Control Center & Media Engine
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Prominent Edit Website Button */}
          <button
            onClick={() => setShowVisualEditor(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 hover:from-teal-300 hover:to-emerald-300 text-xs font-extrabold shadow-[0_0_15px_rgba(45,212,191,0.3)] transition-all cursor-pointer"
          >
            <Palette className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Edit Website</span>
          </button>

          {/* Publish Button */}
          <button
            onClick={handlePublish}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-400 text-slate-950 text-xs font-bold hover:bg-teal-300 transition-colors shadow-[0_0_15px_rgba(45,212,191,0.2)] cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Publish Changes</span>
            <span className="sm:hidden">Publish</span>
          </button>

          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-medium cursor-pointer"
            title="View public website"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden md:inline">View Site</span>
          </button>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-medium cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Container: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Navigation Sidebar */}
        <aside className="w-56 sm:w-64 border-r border-white/10 bg-[#0a0e12] p-3 sm:p-4 flex flex-col justify-between shrink-0 overflow-y-auto">
          <nav className="space-y-1">
            {[
              { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
              { id: 'projects', label: 'Projects & Demos', icon: <FolderGit2 className="w-4 h-4" /> },
              { id: 'videos', label: 'Video Showcase', icon: <Film className="w-4 h-4" /> },
              { id: 'apps', label: 'Apps & APK Releases', icon: <Smartphone className="w-4 h-4" /> },
              { id: 'media', label: 'Uploaded Media', icon: <ImageIcon className="w-4 h-4" /> },
              { id: 'typography', label: 'Typography & Colors', icon: <Type className="w-4 h-4" /> },
              { id: 'animations', label: 'Animations & Text', icon: <Sparkles className="w-4 h-4" /> },
              { id: 'bio', label: 'Bio & Skills', icon: <UserCheck className="w-4 h-4" /> },
              { id: 'contact', label: 'Contact & Socials', icon: <Share2 className="w-4 h-4" /> },
              { id: 'backups', label: 'Backups & Restore', icon: <Download className="w-4 h-4" /> },
              { id: 'settings', label: 'Settings & Cloud Sync', icon: <Settings className="w-4 h-4" /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer text-left ${
                  activeTab === tab.id
                    ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="pt-4 border-t border-white/5 text-[11px] text-slate-500 space-y-1">
            <div>Version {data.version}</div>
            <div className="truncate">Draft updated: {new Date(data.lastUpdated).toLocaleDateString()}</div>
          </div>
        </aside>

        {/* Content Pane */}
        <main className="flex-1 bg-[#080a0d] p-4 sm:p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-6">

            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
                    <p className="text-sm text-slate-400">Welcome to your Mohit Portfolio management console.</p>
                  </div>
                  <button
                    onClick={() => setShowVisualEditor(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 font-extrabold text-xs hover:from-teal-300 hover:to-emerald-300 cursor-pointer shadow-[0_0_20px_rgba(45,212,191,0.3)] transition-all"
                  >
                    <Palette className="w-4 h-4 stroke-[2.5]" />
                    <span>Edit Website</span>
                  </button>
                </div>

                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-[#0f141a] border border-white/10 space-y-1">
                    <span className="text-xs text-slate-400 font-medium">Projects</span>
                    <div className="text-2xl font-extrabold text-white font-mono">{data.projects.length}</div>
                    <span className="text-[10px] text-teal-400">Filtered & categorized</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0f141a] border border-white/10 space-y-1">
                    <span className="text-xs text-slate-400 font-medium">Videos</span>
                    <div className="text-2xl font-extrabold text-white font-mono">{data.videos.length}</div>
                    <span className="text-[10px] text-teal-400">Direct + YouTube</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0f141a] border border-white/10 space-y-1">
                    <span className="text-xs text-slate-400 font-medium">Android Apps</span>
                    <div className="text-2xl font-extrabold text-white font-mono">{data.apps.length}</div>
                    <span className="text-[10px] text-teal-400">Direct APK releases</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0f141a] border border-white/10 space-y-1">
                    <span className="text-xs text-slate-400 font-medium">Status</span>
                    <div className="text-sm font-bold text-white truncate">
                      {unsavedChanges ? 'Unpublished Draft' : 'All Published'}
                    </div>
                    <span className="text-[10px] text-teal-400">
                      {unsavedChanges ? 'Click Publish above' : 'Up to date'}
                    </span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="p-6 rounded-2xl bg-[#0f141a] border border-white/10 space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Quick Actions</h3>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => {
                        setIsNewProject(true);
                        setEditingProject({
                          id: `proj-${Date.now()}`,
                          title: '',
                          category: 'web',
                          description: '',
                          featured: true,
                          visible: true,
                          order: data.projects.length + 1
                        });
                        setActiveTab('projects');
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-400 text-slate-950 font-bold text-xs hover:bg-teal-300 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Project</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsNewVideo(true);
                        setEditingVideo({
                          id: `vid-${Date.now()}`,
                          title: '',
                          description: '',
                          videoType: 'youtube',
                          videoUrl: '',
                          category: 'Showcase',
                          featured: true
                        });
                        setActiveTab('videos');
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-xs hover:bg-white/10 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Upload / Add Video</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsNewApp(true);
                        setEditingApp({
                          id: `app-${Date.now()}`,
                          name: '',
                          description: '',
                          version: 'v1.0.0',
                          status: 'Available',
                          apkSource: 'direct'
                        });
                        setActiveTab('apps');
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-xs hover:bg-white/10 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Upload APK Binary</span>
                    </button>
                  </div>
                </div>

                {/* Architecture Highlights */}
                <div className="p-6 rounded-2xl bg-teal-500/5 border border-teal-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-teal-400 font-semibold text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>Real Persistent Storage & Draft Workflow Active</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Uploaded images, direct MP4 videos, and direct Android APK files are stored in persistent IndexedDB binary storage. Any edits you make here stay in your private draft until you click <strong>Publish Changes</strong>, ensuring visitors never see work in progress.
                  </p>
                </div>
              </div>
            )}

            {/* TAB: PROJECTS */}
            {activeTab === 'projects' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">Project Showcase</h2>
                    <p className="text-xs text-slate-400">Manage, reorder, and update your portfolio items.</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsNewProject(true);
                      setEditingProject({
                        id: `proj-${Date.now()}`,
                        title: '',
                        category: 'web',
                        description: '',
                        featured: true,
                        visible: true,
                        order: data.projects.length + 1
                      });
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-400 text-slate-950 font-bold text-xs hover:bg-teal-300 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Project</span>
                  </button>
                </div>

                {/* Project List */}
                <div className="space-y-3">
                  {data.projects.map((proj, idx) => (
                    <div
                      key={proj.id}
                      className="p-4 rounded-xl bg-[#0f141a] border border-white/10 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => handleMoveProject(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 rounded hover:bg-white/10 disabled:opacity-20 text-slate-400 cursor-pointer"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMoveProject(idx, 'down')}
                            disabled={idx === data.projects.length - 1}
                            className="p-1 rounded hover:bg-white/10 disabled:opacity-20 text-slate-400 cursor-pointer"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded">
                              {proj.category}
                            </span>
                            <h4 className="text-sm font-bold text-white">{proj.title}</h4>
                            {proj.visible === false && (
                              <span className="text-[10px] text-slate-500 bg-white/5 px-1.5 py-0.5 rounded">
                                Hidden
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5 max-w-md">
                            {proj.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setIsNewProject(false);
                            setEditingProject({ ...proj });
                          }}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setConfirmDelete({ type: 'project', id: proj.id, name: proj.title })}
                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: VIDEOS */}
            {activeTab === 'videos' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">Video Showcase</h2>
                    <p className="text-xs text-slate-400">Support both direct video uploads (MP4/WebM) and YouTube links.</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsNewVideo(true);
                      setEditingVideo({
                        id: `vid-${Date.now()}`,
                        title: '',
                        description: '',
                        videoType: 'direct',
                        videoUrl: '',
                        category: 'Showcase',
                        featured: true
                      });
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-400 text-slate-950 font-bold text-xs hover:bg-teal-300 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Video</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {data.videos.map(vid => (
                    <div
                      key={vid.id}
                      className="p-4 rounded-xl bg-[#0f141a] border border-white/10 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-16 aspect-video bg-black rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                          {vid.videoType === 'youtube' && getYouTubeThumbnail(vid.videoUrl) ? (
                            <img
                              src={getYouTubeThumbnail(vid.videoUrl)!}
                              alt={vid.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Film className="w-5 h-5 text-teal-400" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-teal-400">
                              {vid.videoType === 'direct' ? 'Uploaded Video' : 'YouTube Link'}
                            </span>
                            <h4 className="text-sm font-bold text-white">{vid.title}</h4>
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{vid.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setIsNewVideo(false);
                            setEditingVideo({ ...vid });
                          }}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDelete({ type: 'video', id: vid.id, name: vid.title })}
                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: APPS & APKS */}
            {activeTab === 'apps' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">Apps & APK Releases</h2>
                    <p className="text-xs text-slate-400">Directly upload Android APK binaries or manage external download URLs.</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsNewApp(true);
                      setEditingApp({
                        id: `app-${Date.now()}`,
                        name: '',
                        description: '',
                        version: 'v1.0.0',
                        status: 'Available',
                        apkSource: 'direct'
                      });
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-400 text-slate-950 font-bold text-xs hover:bg-teal-300 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add / Upload APK</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {data.apps.map(app => (
                    <div
                      key={app.id}
                      className="p-4 rounded-xl bg-[#0f141a] border border-white/10 flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{app.name}</h4>
                          <span className="text-[10px] font-mono text-slate-400">{app.version}</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/5 text-teal-300 border border-teal-500/30">
                            {app.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{app.description}</p>
                        <div className="text-[10px] text-slate-500 mt-1">
                          Download Source: {app.apkFileId ? `Direct Binary (${app.apkFileName || 'APK Package'})` : app.apkUrl ? app.apkUrl : 'Coming Soon'}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setIsNewApp(false);
                            setEditingApp({ ...app });
                          }}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDelete({ type: 'app', id: app.id, name: app.name })}
                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: MEDIA LIBRARY */}
            {activeTab === 'media' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-white">Media Storage Engine</h2>
                    <p className="text-xs text-slate-400">
                      Direct image, video, and APK uploads stored persistently in client-side IndexedDB binary database.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                      <span>IndexedDB Active</span>
                    </span>
                    <button
                      onClick={refreshMediaFiles}
                      className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-300 flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Refresh</span>
                    </button>
                  </div>
                </div>

                {/* Storage Overview Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#0f141a] border border-white/5 space-y-1">
                    <span className="text-[11px] font-medium text-slate-400">Total Media</span>
                    <p className="text-lg font-bold text-white">{mediaFiles.length} files</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#0f141a] border border-white/5 space-y-1">
                    <span className="text-[11px] font-medium text-slate-400">Images</span>
                    <p className="text-lg font-bold text-teal-400">{mediaFiles.filter(f => f.category === 'image').length}</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#0f141a] border border-white/5 space-y-1">
                    <span className="text-[11px] font-medium text-slate-400">Videos</span>
                    <p className="text-lg font-bold text-blue-400">{mediaFiles.filter(f => f.category === 'video').length}</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#0f141a] border border-white/5 space-y-1">
                    <span className="text-[11px] font-medium text-slate-400">APK Packages</span>
                    <p className="text-lg font-bold text-emerald-400">{mediaFiles.filter(f => f.category === 'apk').length}</p>
                  </div>
                </div>

                {/* Direct Upload Panels */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-[#0f141a] border border-white/10 space-y-2">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-teal-400" />
                      <span>Upload Image</span>
                    </h3>
                    <MediaUploader
                      category="image"
                      onFileSelected={() => {
                        refreshMediaFiles();
                        showToast('Image uploaded and saved to storage');
                      }}
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-[#0f141a] border border-white/10 space-y-2">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5 text-teal-400" />
                      <span>Upload Video (MP4/WebM)</span>
                    </h3>
                    <MediaUploader
                      category="video"
                      onFileSelected={() => {
                        refreshMediaFiles();
                        showToast('Video uploaded and saved to storage');
                      }}
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-[#0f141a] border border-white/10 space-y-2">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-teal-400" />
                      <span>Upload Android APK</span>
                    </h3>
                    <MediaUploader
                      category="apk"
                      onFileSelected={() => {
                        refreshMediaFiles();
                        showToast('APK binary uploaded and saved to storage');
                      }}
                    />
                  </div>
                </div>

                {/* Filter and Stored Files List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">Stored Files in IndexedDB</h3>
                      <span className="text-xs text-slate-500 font-mono">({mediaFiles.length})</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {(['all', 'image', 'video', 'apk'] as const).map(tab => (
                        <button
                          key={tab}
                          onClick={() => setMediaFilter(tab)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize cursor-pointer transition-colors ${
                            mediaFilter === tab
                              ? 'bg-teal-400 text-slate-950 font-bold'
                              : 'bg-white/5 text-slate-400 hover:text-white'
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>

                  {mediaFiles.length === 0 ? (
                    <div className="p-8 text-center bg-[#0f141a] border border-white/5 rounded-xl space-y-2">
                      <p className="text-xs text-slate-400">No media files stored in browser database yet.</p>
                      <p className="text-[11px] text-slate-500">Upload an image, video, or APK above to see it stored here.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {mediaFiles
                        .filter(f => mediaFilter === 'all' || f.category === mediaFilter)
                        .map(file => (
                          <div
                            key={file.id}
                            className="p-3 rounded-xl bg-[#0f141a] border border-white/10 flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3 overflow-hidden min-w-0">
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

                              <div className="min-w-0">
                                <div className="text-xs font-bold text-white truncate max-w-sm">{file.name}</div>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                                  <span className="uppercase text-teal-400 font-bold">{file.category}</span>
                                  <span>·</span>
                                  <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                                  <span>·</span>
                                  <span>{file.id}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setShowVisualEditor(true);
                                  showToast(`Opening Visual Editor to place "${file.name}"`);
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                                title="Open in Visual Editor to place on website"
                              >
                                <Palette className="w-3.5 h-3.5" />
                                <span>Place on Website</span>
                              </button>

                              {file.category === 'apk' && (
                                <button
                                  type="button"
                                  onClick={() => mediaStorage.downloadFile(file.id, file.name)}
                                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                                  title="Download APK binary to device"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Download</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(file.id);
                                  showToast('Storage ID copied to clipboard');
                                }}
                                className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[11px] text-slate-300 cursor-pointer"
                                title="Copy ID"
                              >
                                Copy ID
                              </button>

                              <button
                                type="button"
                                onClick={() => setConfirmDelete({ type: 'media', id: file.id, name: file.name })}
                                className="p-1.5 rounded hover:bg-red-500/10 text-slate-400 hover:text-red-400 cursor-pointer"
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

            {/* TAB: TYPOGRAPHY & COLORS */}
            {activeTab === 'typography' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white">Typography & Theme Controls</h2>
                  <p className="text-xs text-slate-400">Configure site fonts, scale, and surface aesthetics.</p>
                </div>

                <div className="p-6 rounded-2xl bg-[#0f141a] border border-white/10 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Site-wide Font</label>
                    <select
                      value={data.themeConfig.fontFamily}
                      onChange={(e) => persistDraft({
                        ...data,
                        themeConfig: { ...data.themeConfig, fontFamily: e.target.value as any }
                      })}
                      className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-sm"
                    >
                      <option value="plus-jakarta">Plus Jakarta Sans</option>
                      <option value="outfit">Outfit</option>
                      <option value="inter">Inter</option>
                      <option value="urbanist">Urbanist</option>
                      <option value="manrope">Manrope</option>
                      <option value="mono">JetBrains Mono</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Accent Color</label>
                    <div className="flex items-center gap-3">
                      {['#2dd4bf', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6'].map(col => (
                        <button
                          key={col}
                          onClick={() => persistDraft({
                            ...data,
                            themeConfig: { ...data.themeConfig, accentColor: col }
                          })}
                          className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 cursor-pointer"
                          style={{
                            backgroundColor: col,
                            borderColor: data.themeConfig.accentColor === col ? '#ffffff' : 'transparent'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ANIMATIONS */}
            {activeTab === 'animations' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white">Animation & Text Effects</h2>
                  <p className="text-xs text-slate-400">Configure role cycling and typewriter speeds.</p>
                </div>

                <div className="p-6 rounded-2xl bg-[#0f141a] border border-white/10 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <span className="text-xs font-semibold text-white">Enable Rotating Roles</span>
                    <input
                      type="checkbox"
                      checked={data.animationConfig.typewriterEnabled}
                      onChange={(e) => persistDraft({
                        ...data,
                        animationConfig: { ...data.animationConfig, typewriterEnabled: e.target.checked }
                      })}
                      className="rounded accent-teal-400 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Roles Sequence (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={data.profile.roles.join(', ')}
                      onChange={(e) => persistDraft({
                        ...data,
                        profile: {
                          ...data.profile,
                          roles: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                        }
                      })}
                      className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB: BIO & SKILLS */}
            {activeTab === 'bio' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white">Profile, Bio & Skills</h2>
                  <p className="text-xs text-slate-400">Update your hero presentation, about story, and skills.</p>
                </div>

                <div className="p-6 rounded-2xl bg-[#0f141a] border border-white/10 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Display Name</label>
                      <input
                        type="text"
                        value={data.profile.name}
                        onChange={(e) => persistDraft({ ...data, profile: { ...data.profile, name: e.target.value } })}
                        className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Hero Kicker</label>
                      <input
                        type="text"
                        value={data.profile.kicker}
                        onChange={(e) => persistDraft({ ...data, profile: { ...data.profile, kicker: e.target.value } })}
                        className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">About Biography</label>
                    <textarea
                      rows={6}
                      value={data.profile.aboutBio}
                      onChange={(e) => persistDraft({ ...data, profile: { ...data.profile, aboutBio: e.target.value } })}
                      className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB: CONTACT & SOCIALS */}
            {activeTab === 'contact' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white">Contact & Social Links</h2>
                  <p className="text-xs text-slate-400">Configure your public contact email and verified social channels.</p>
                </div>

                <div className="p-6 rounded-2xl bg-[#0f141a] border border-white/10 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Contact Email</label>
                    <input
                      type="email"
                      placeholder="e.g. mohit@example.com"
                      value={data.profile.email}
                      onChange={(e) => persistDraft({ ...data, profile: { ...data.profile, email: e.target.value } })}
                      className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Instagram Profile URL</label>
                      <input
                        type="url"
                        value={data.profile.socials.instagram}
                        onChange={(e) => persistDraft({
                          ...data,
                          profile: {
                            ...data.profile,
                            socials: { ...data.profile.socials, instagram: e.target.value }
                          }
                        })}
                        className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">YouTube Channel URL</label>
                      <input
                        type="url"
                        value={data.profile.socials.youtube}
                        onChange={(e) => persistDraft({
                          ...data,
                          profile: {
                            ...data.profile,
                            socials: { ...data.profile.socials, youtube: e.target.value }
                          }
                        })}
                        className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">GitHub Profile URL</label>
                      <input
                        type="url"
                        value={data.profile.socials.github}
                        onChange={(e) => persistDraft({
                          ...data,
                          profile: {
                            ...data.profile,
                            socials: { ...data.profile.socials, github: e.target.value }
                          }
                        })}
                        className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">LinkedIn Profile URL</label>
                      <input
                        type="url"
                        value={data.profile.socials.linkedin || ''}
                        onChange={(e) => persistDraft({
                          ...data,
                          profile: {
                            ...data.profile,
                            socials: { ...data.profile.socials, linkedin: e.target.value }
                          }
                        })}
                        className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: BACKUPS & RESTORE */}
            {activeTab === 'backups' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white">Backups & Data Portability</h2>
                  <p className="text-xs text-slate-400">Export backups, restore data, and reset to defaults.</p>
                </div>

                <div className="p-6 rounded-2xl bg-[#0f141a] border border-white/10 space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={handleExport}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-medium hover:bg-white/10 cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-teal-400" />
                      <span>Export Portfolio JSON</span>
                    </button>

                    <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-medium hover:bg-white/10 cursor-pointer">
                      <Upload className="w-4 h-4 text-teal-400" />
                      <span>Import Backup JSON</span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        className="hidden"
                      />
                    </label>

                    <button
                      onClick={() => setConfirmDelete({ type: 'reset', name: 'Reset all portfolio data to factory defaults' })}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-medium hover:bg-red-500/20 cursor-pointer"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>Reset to Defaults</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SETTINGS & DEPLOYMENT */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white">Backend Architecture & Deployment</h2>
                  <p className="text-xs text-slate-400">Overview of client storage, hosting, and cloud sync options.</p>
                </div>

                <div className="p-6 rounded-2xl bg-[#0f141a] border border-white/10 space-y-4 text-xs text-slate-300 leading-relaxed">
                  <p>
                    <strong>1. Local Persistent Architecture:</strong> The current environment stores all metadata in browser persistent storage, and all uploaded media (Images, Videos, APK packages) in high-capacity IndexedDB binary stores. This runs completely free without external paid API subscriptions.
                  </p>
                  <p>
                    <strong>2. Free URL Publishing:</strong> Run <code className="bg-black/50 px-1 py-0.5 rounded text-teal-300">npm run build</code> and deploy the generated <code className="bg-black/50 px-1 py-0.5 rounded text-teal-300">dist/</code> folder for free to Vercel, Netlify, GitHub Pages, or Google Cloud Run.
                  </p>
                  <p>
                    <strong>3. Multi-Device Cloud Synchronization (Optional):</strong> If you need content to sync automatically across separate devices without manual JSON import/export, a backend database like Firebase Firestore or a REST API can be configured. To maintain security, client-side write permissions must be restricted to your authenticated owner account.
                  </p>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* VISUAL EDITOR MODAL OVERLAY */}
      {showVisualEditor && (
        <VisualEditor
          draftData={data}
          publishedData={portfolioData}
          onUpdateDraft={(updated) => persistDraft(updated, 'Visual draft updated')}
          onPublish={() => {
            handlePublish();
            setShowVisualEditor(false);
          }}
          onDiscard={() => {
            handleDiscard();
          }}
          onClose={() => setShowVisualEditor(false)}
          hasUnsavedChanges={unsavedChanges}
        />
      )}

      {/* EDIT PROJECT MODAL */}
      {editingProject && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-xl rounded-2xl bg-[#0f141a] border border-white/10 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingProject(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white">
              {isNewProject ? 'Add New Project' : 'Edit Project'}
            </h3>

            <form onSubmit={handleSaveProject} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Project Title</label>
                <input
                  type="text"
                  required
                  value={editingProject.title}
                  onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Category</label>
                  <select
                    value={editingProject.category}
                    onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value as ProjectCategory })}
                    className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-sm"
                  >
                    <option value="web">Web Development</option>
                    <option value="app">App Development</option>
                    <option value="creative">Creative Work</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Visibility</label>
                  <select
                    value={editingProject.visible !== false ? 'true' : 'false'}
                    onChange={(e) => setEditingProject({ ...editingProject, visible: e.target.value === 'true' })}
                    className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-sm"
                  >
                    <option value="true">Visible on website</option>
                    <option value="false">Hidden (draft only)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Description</label>
                <textarea
                  rows={3}
                  required
                  value={editingProject.description}
                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-sm"
                />
              </div>

              {/* Real Image Uploader for Project Thumbnail */}
              <MediaUploader
                category="image"
                label="Project Thumbnail Image"
                currentValue={editingProject.thumbnailUrl}
                onFileSelected={(res) => setEditingProject({ ...editingProject, thumbnailUrl: res.fileId })}
                onRemove={() => setEditingProject({ ...editingProject, thumbnailUrl: undefined })}
                helperText="Upload thumbnail image from phone gallery/desktop. Leave blank to show the code window illustration."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Live Website / Demo URL</label>
                  <input
                    type="url"
                    value={editingProject.liveUrl || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, liveUrl: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">GitHub Source Code URL</label>
                  <input
                    type="url"
                    value={editingProject.githubUrl || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, githubUrl: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-sm"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-400 text-slate-950 font-bold text-xs hover:bg-teal-300"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT VIDEO MODAL */}
      {editingVideo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#0f141a] border border-white/10 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingVideo(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white">
              {isNewVideo ? 'Add Video' : 'Edit Video'}
            </h3>

            <form onSubmit={handleSaveVideo} className="space-y-4">
              {/* Video Source Type */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Video Source</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingVideo({ ...editingVideo, videoType: 'youtube' })}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold cursor-pointer ${
                      editingVideo.videoType === 'youtube'
                        ? 'bg-teal-400 text-slate-950 font-bold'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    YouTube / External URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingVideo({ ...editingVideo, videoType: 'direct' })}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold cursor-pointer ${
                      editingVideo.videoType === 'direct'
                        ? 'bg-teal-400 text-slate-950 font-bold'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    Direct Video Upload
                  </button>
                </div>
              </div>

              {editingVideo.videoType === 'youtube' ? (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">YouTube Video URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={editingVideo.videoUrl}
                    onChange={(e) => setEditingVideo({ ...editingVideo, videoUrl: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-sm"
                  />
                </div>
              ) : (
                <MediaUploader
                  category="video"
                  label="Direct Video File (MP4, WebM)"
                  currentValue={editingVideo.directFileId}
                  onFileSelected={(res) => setEditingVideo({
                    ...editingVideo,
                    directFileId: res.fileId,
                    videoUrl: res.fileId,
                    thumbnailUrl: editingVideo.thumbnailUrl || res.posterUrl || res.fileId,
                    fileSize: `${(res.size / (1024 * 1024)).toFixed(1)} MB`
                  })}
                  onRemove={() => setEditingVideo({ ...editingVideo, directFileId: undefined })}
                  helperText="Upload video from phone or computer for instant HTML5 playback."
                />
              )}

              {/* Optional Custom Video Thumbnail / Poster */}
              <MediaUploader
                category="image"
                label="Custom Video Poster / Thumbnail (Optional)"
                currentValue={editingVideo.thumbnailUrl}
                onFileSelected={(res) => setEditingVideo({
                  ...editingVideo,
                  thumbnailUrl: res.fileId
                })}
                onRemove={() => setEditingVideo({ ...editingVideo, thumbnailUrl: undefined })}
                helperText="Upload custom video cover image. If empty, YouTube cover or auto-captured video frame is used."
              />

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Title</label>
                <input
                  type="text"
                  required
                  value={editingVideo.title}
                  onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Category Tag</label>
                  <input
                    type="text"
                    value={editingVideo.category}
                    onChange={(e) => setEditingVideo({ ...editingVideo, category: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Duration (optional)</label>
                  <input
                    type="text"
                    value={editingVideo.duration || ''}
                    onChange={(e) => setEditingVideo({ ...editingVideo, duration: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Description</label>
                <textarea
                  rows={2}
                  required
                  value={editingVideo.description}
                  onChange={(e) => setEditingVideo({ ...editingVideo, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-sm"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingVideo(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-400 text-slate-950 font-bold text-xs hover:bg-teal-300"
                >
                  Save Video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT APP MODAL */}
      {editingApp && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#0f141a] border border-white/10 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingApp(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white">
              {isNewApp ? 'Add Android App' : 'Edit App'}
            </h3>

            <form onSubmit={handleSaveApp} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">App Name</label>
                <input
                  type="text"
                  required
                  value={editingApp.name}
                  onChange={(e) => setEditingApp({ ...editingApp, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Version</label>
                  <input
                    type="text"
                    required
                    value={editingApp.version}
                    onChange={(e) => setEditingApp({ ...editingApp, version: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Status</label>
                  <select
                    value={editingApp.status}
                    onChange={(e) => setEditingApp({ ...editingApp, status: e.target.value as AppStatus })}
                    className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-sm"
                  >
                    <option value="Coming Soon">Coming Soon</option>
                    <option value="Available">Available</option>
                    <option value="Updated">Updated</option>
                  </select>
                </div>
              </div>

              {/* Direct APK Upload vs URL */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">APK Package Download Source</label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setEditingApp({ ...editingApp, apkSource: 'direct' })}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold cursor-pointer ${
                      editingApp.apkSource !== 'url'
                        ? 'bg-teal-400 text-slate-950 font-bold'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    Direct APK Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingApp({ ...editingApp, apkSource: 'url' })}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold cursor-pointer ${
                      editingApp.apkSource === 'url'
                        ? 'bg-teal-400 text-slate-950 font-bold'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    External Download URL
                  </button>
                </div>

                {editingApp.apkSource === 'url' ? (
                  <input
                    type="url"
                    placeholder="https://github.com/.../app.apk"
                    value={editingApp.apkUrl || ''}
                    onChange={(e) => setEditingApp({ ...editingApp, apkUrl: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-sm"
                  />
                ) : (
                  <MediaUploader
                    category="apk"
                    label="Select .APK File"
                    currentValue={editingApp.apkFileId}
                    currentFileName={editingApp.apkFileName}
                    onFileSelected={(res) => setEditingApp({
                      ...editingApp,
                      apkFileId: res.fileId,
                      apkFileName: res.fileName,
                      fileSize: `${(res.size / (1024 * 1024)).toFixed(1)} MB`
                    })}
                    onRemove={() => setEditingApp({ ...editingApp, apkFileId: undefined, apkFileName: undefined })}
                    helperText="Upload direct APK package for users to download directly."
                  />
                )}
              </div>

              {/* Optional App Icon */}
              <MediaUploader
                category="image"
                label="App Icon (Optional)"
                currentValue={editingApp.iconUrl}
                onFileSelected={(res) => setEditingApp({
                  ...editingApp,
                  iconUrl: res.fileId
                })}
                onRemove={() => setEditingApp({ ...editingApp, iconUrl: undefined })}
                helperText="Upload custom app icon. Square PNG or WebP recommended."
              />

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">App Description</label>
                <textarea
                  rows={2}
                  required
                  value={editingApp.description}
                  onChange={(e) => setEditingApp({ ...editingApp, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Release Notes (optional)</label>
                <input
                  type="text"
                  value={editingApp.releaseNotes || ''}
                  onChange={(e) => setEditingApp({ ...editingApp, releaseNotes: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-sm"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingApp(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-400 text-slate-950 font-bold text-xs hover:bg-teal-300"
                >
                  Save App
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION DELETION DIALOG */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-[#12161b] border border-white/10 p-6 space-y-4 shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">Confirm Action</h3>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to {confirmDelete.type === 'reset' ? 'reset all data' : `delete "${confirmDelete.name}"`}?
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-3 py-1.5 rounded-lg bg-white/5 text-xs text-slate-300 hover:bg-white/10 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmDelete.type === 'project' && confirmDelete.id) {
                    handleDeleteProject(confirmDelete.id);
                  } else if (confirmDelete.type === 'video' && confirmDelete.id) {
                    handleDeleteVideo(confirmDelete.id);
                  } else if (confirmDelete.type === 'app' && confirmDelete.id) {
                    handleDeleteApp(confirmDelete.id);
                  } else if (confirmDelete.type === 'media' && confirmDelete.id) {
                    mediaStorage.deleteFile(confirmDelete.id).then(() => {
                      refreshMediaFiles();
                      setConfirmDelete(null);
                      showToast('Media file deleted from storage');
                    });
                  } else if (confirmDelete.type === 'reset') {
                    handleReset();
                  }
                }}
                className="px-4 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold text-xs cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
