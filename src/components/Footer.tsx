import React from 'react';
import { ChevronUp, Shield, Lock } from 'lucide-react';

interface FooterProps {
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full border-t border-white/5 py-10 bg-[#060809]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        
        {/* Left Side matching Screenshot 3 */}
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-base tracking-wider text-white">
            MOHIT.
          </span>
          <span className="text-xs text-slate-400">
            Create. Build. Inspire.
          </span>
        </div>

        {/* Middle: Discreet Admin & Attribution */}
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <button
            onClick={onOpenAdmin}
            className="hover:text-teal-400 transition-colors inline-flex items-center gap-1 cursor-pointer"
          >
            <Lock className="w-3 h-3" />
            <span>Admin Dashboard</span>
          </button>
          <span>·</span>
          <span>© {new Date().getFullYear()} Mohit. All rights reserved.</span>
        </div>

        {/* Right Side matching Screenshot 3 */}
        <button
          onClick={scrollToTop}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-teal-400 transition-colors uppercase tracking-wider cursor-pointer group"
        >
          <span>Back to top</span>
          <ChevronUp className="w-4 h-4 transition-transform group-hover:-translate-y-1 text-teal-400" />
        </button>

      </div>
    </footer>
  );
};
