import React, { useState } from 'react';
import { Project, ProjectCategory, CustomMediaBlock } from '../types/portfolio';
import { ArrowUpRight, Code, ExternalLink, Github, Play, X, Layers } from 'lucide-react';
import { sanitizeUrl } from '../utils/urlHelper';
import { useMediaUrl } from '../utils/useMediaUrl';
import { MediaBlockRenderer } from './MediaBlockRenderer';

interface ProjectsSectionProps {
  projects: Project[];
  headingOverride?: string;
  onOpenAdmin?: () => void;
  mediaBlocks?: CustomMediaBlock[];
  isEditable?: boolean;
  selectedBlockId?: string;
  onSelectBlock?: (id: string) => void;
  onDeleteBlock?: (id: string) => void;
}

const ProjectCard: React.FC<{
  project: Project;
  onSelect: (p: Project) => void;
}> = ({ project, onSelect }) => {
  const thumbUrl = useMediaUrl(project.thumbnailUrl);
  const [imgError, setImgError] = useState(false);

  React.useEffect(() => {
    setImgError(false);
  }, [thumbUrl]);

  const hasLiveUrl = Boolean(project.liveUrl && project.liveUrl.trim().length > 0);
  const hasGithubUrl = Boolean(project.githubUrl && project.githubUrl.trim().length > 0);
  const hasVideoUrl = Boolean(project.videoUrl && project.videoUrl.trim().length > 0);
  const isPlaceholder = !hasLiveUrl && !hasGithubUrl && !hasVideoUrl;

  const showCustomImage = Boolean(thumbUrl && !imgError);

  const getCategoryLabel = (cat: ProjectCategory): string => {
    switch (cat) {
      case 'web':
        return 'WEB DEVELOPMENT';
      case 'app':
        return 'APP DEVELOPMENT';
      case 'creative':
        return 'CREATIVE WORK';
      default:
        return 'PROJECT';
    }
  };

  return (
    <div
      onClick={() => onSelect(project)}
      className="group rounded-2xl border border-white/10 bg-[#0d1217]/70 hover:bg-[#11171e]/90 hover:border-teal-500/30 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer shadow-lg hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
    >
      {/* Top Graphic / Preview Area matching Screenshot 2 */}
      <div className="relative aspect-[16/10] bg-[#090d10] border-b border-white/5 flex items-center justify-center p-6 overflow-hidden">
        
        {/* PLACEHOLDER PREVIEW or BADGE */}
        <div className="absolute top-3.5 left-3.5 z-10">
          <span className="px-2.5 py-1 rounded-md text-[10px] tracking-wider font-semibold uppercase bg-black/60 border border-white/10 text-slate-400 backdrop-blur-md">
            {showCustomImage ? 'Project Preview' : 'Placeholder Preview'}
          </span>
        </div>

        {/* Visual Graphic: Either custom thumbnail or code window illustration */}
        {showCustomImage ? (
          <img
            src={thumbUrl}
            alt={project.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-[85%] max-w-[260px] aspect-[4/3] rounded-xl bg-[#11161a] border border-white/10 shadow-2xl p-4 flex flex-col justify-between transition-transform duration-300 group-hover:scale-[1.03]">
            {/* Window dots */}
            <div className="flex items-center gap-1.5 opacity-60">
              <span className="w-2 h-2 rounded-full bg-slate-600" />
              <span className="w-2 h-2 rounded-full bg-slate-600" />
              <span className="w-2 h-2 rounded-full bg-slate-600" />
            </div>

            {/* Middle Code Graphic / Icon */}
            <div className="my-auto py-2">
              <div className="flex items-center gap-2 text-teal-400 mb-2">
                <Code className="w-6 h-6 stroke-[2.2]" />
              </div>
              {/* Code Lines illustration */}
              <div className="space-y-1.5 opacity-40">
                <div className="h-1.5 bg-slate-400 rounded-full w-3/4" />
                <div className="h-1.5 bg-slate-500 rounded-full w-1/2" />
              </div>
            </div>

            {/* Subtle bottom indicator */}
            <div className="text-[10px] text-slate-500 font-mono">
              {project.category.toUpperCase()}
            </div>
          </div>
        )}
      </div>

      {/* Card Content Area matching Screenshot 2 */}
      <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between space-y-4">
        <div className="space-y-2">
          {/* Category in mint uppercase */}
          <span className="text-[11px] font-bold tracking-[0.18em] text-teal-400 uppercase">
            {getCategoryLabel(project.category)}
          </span>

          {/* Project Title */}
          <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-teal-300 transition-colors line-clamp-1">
            {project.title}
          </h3>

          {/* Description */}
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed line-clamp-2">
            {project.description}
          </p>
        </div>

        {/* Divider & Status / Action Footer */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
          {isPlaceholder ? (
            <div className="flex items-center justify-between w-full text-slate-500">
              <span className="font-normal">Link not added yet</span>
              <ArrowUpRight className="w-4 h-4 text-slate-600" />
            </div>
          ) : (
            <div className="flex items-center justify-between w-full text-teal-400 font-medium">
              <span className="group-hover:underline">
                {hasLiveUrl ? 'View Project' : hasVideoUrl ? 'Watch Showcase' : 'View Code'}
              </span>
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ 
  projects, 
  headingOverride,
  onOpenAdmin,
  mediaBlocks,
  isEditable,
  selectedBlockId,
  onSelectBlock,
  onDeleteBlock
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const workBlocks = (mediaBlocks || []).filter(b => b.section === 'work');

  // Filter visible projects only
  const visibleProjects = projects.filter(p => p.visible !== false);

  const categories: { id: string; label: string; filterCat?: ProjectCategory }[] = [
    { id: 'all', label: 'All projects' },
    { id: 'web', label: 'Web Development', filterCat: 'web' },
    { id: 'app', label: 'App Development', filterCat: 'app' },
    { id: 'creative', label: 'Creative', filterCat: 'creative' },
  ];

  const filteredProjects = visibleProjects.filter((project) => {
    if (activeCategory === 'all') return true;
    return project.category === activeCategory;
  });

  const getCategoryLabel = (cat: ProjectCategory): string => {
    switch (cat) {
      case 'web':
        return 'WEB DEVELOPMENT';
      case 'app':
        return 'APP DEVELOPMENT';
      case 'creative':
        return 'CREATIVE WORK';
      default:
        return 'PROJECT';
    }
  };

  return (
    <section id="work" className="py-20 sm:py-24 border-t border-white/5 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Intro matching Screenshot 2 */}
        <div className="mb-10 sm:mb-12 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {headingOverride || 'A space for websites, apps, and creative explorations.'}
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl">
            Selected projects demonstrating technical craftsmanship and creative storytelling.
          </p>
        </div>

        {/* Filter Tabs matching Screenshot 2 */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 mb-10">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 sm:px-5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#182126] text-white border border-teal-500/40 shadow-[0_0_15px_rgba(45,212,191,0.1)]'
                    : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] border border-transparent'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-[#0d1217]/60 p-12 text-center max-w-lg mx-auto space-y-4">
            <Layers className="w-10 h-10 text-teal-400/50 mx-auto" />
            <h3 className="text-lg font-semibold text-white">No projects found in this category</h3>
            <p className="text-sm text-slate-400">
              New projects can be added anytime through the Admin Dashboard.
            </p>
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400 hover:bg-teal-500/20 text-xs font-medium cursor-pointer"
              >
                Manage Projects
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onSelect={(p) => setSelectedProject(p)}
              />
            ))}
          </div>
        )}

        {/* Custom Section Media Blocks */}
        {workBlocks.length > 0 && (
          <div className="mt-12 space-y-6">
            {workBlocks.map(block => (
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

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl rounded-2xl bg-[#0f141a] border border-white/10 shadow-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div>
              <span className="text-xs font-bold tracking-wider text-teal-400 uppercase">
                {getCategoryLabel(selectedProject.category)}
              </span>
              <h3 className="text-2xl font-bold text-white mt-1">
                {selectedProject.title}
              </h3>
            </div>

            {/* Description */}
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {selectedProject.description}
            </p>

            {/* Links and Actions */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-3">
              {selectedProject.liveUrl ? (
                <a
                  href={sanitizeUrl(selectedProject.liveUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-400 text-slate-950 font-semibold text-xs sm:text-sm hover:bg-teal-300 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open Live Website</span>
                </a>
              ) : null}

              {selectedProject.githubUrl ? (
                <a
                  href={sanitizeUrl(selectedProject.githubUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-xs sm:text-sm hover:bg-white/10 transition-colors"
                >
                  <Github className="w-4 h-4" />
                  <span>Source Code</span>
                </a>
              ) : null}

              {selectedProject.videoUrl ? (
                <a
                  href={sanitizeUrl(selectedProject.videoUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 font-medium text-xs sm:text-sm hover:bg-teal-500/20 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  <span>Watch Video</span>
                </a>
              ) : null}

              {!selectedProject.liveUrl && !selectedProject.githubUrl && !selectedProject.videoUrl && (
                <div className="text-xs text-slate-500 italic">
                  No public links configured for this project yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
