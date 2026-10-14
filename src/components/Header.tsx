import React, { useState } from 'react';
import { Sun, Moon, Menu, X, Shield, Lock } from 'lucide-react';

interface HeaderProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenAdmin: () => void;
  activeSection?: string;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  onOpenAdmin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Work', href: '#work' },
    { label: 'Videos', href: '#videos' },
    { label: 'Apps', href: '#apps' },
    { label: 'Contact', href: '#contact' },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full transition-colors duration-200 border-b border-white/5 bg-[#08090a]/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        
        {/* Brand Lockup matching reference image */}
        <a 
          href="#home" 
          className="flex items-center gap-3 group focus-visible:outline-teal-400 rounded-lg select-none"
        >
          {/* Rounded Monogram Badge */}
          <div className="w-10 h-10 rounded-xl bg-[#0e1617] border border-teal-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(45,212,191,0.12)] transition-transform group-hover:scale-105">
            <span className="font-sans font-bold text-lg text-teal-400">m</span>
          </div>

          {/* Text Identity */}
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-wider text-white group-hover:text-teal-300 transition-colors uppercase">
              Mohit
            </span>
            <span className="text-[10px] tracking-[0.25em] text-slate-400 uppercase font-medium">
              Portfolio
            </span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(item.href);
              }}
              className="text-sm font-medium text-slate-300 hover:text-teal-400 transition-colors cursor-pointer py-1"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right Actions: Theme Toggle & Mobile hamburger (Exact match to Screenshot 1) */}
        <div className="flex items-center gap-3">

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="p-2 text-slate-300 hover:text-teal-400 transition-colors rounded-lg hover:bg-white/5"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 stroke-[1.75]" />
            ) : (
              <Moon className="w-5 h-5 stroke-[1.75]" />
            )}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 stroke-[1.75]" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-[#0b0e12]/95 backdrop-blur-xl px-5 py-6 space-y-4 animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col space-y-3">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.href);
                }}
                className="text-base font-medium text-slate-200 hover:text-teal-400 py-2 transition-colors border-b border-white/5"
              >
                {item.label}
              </a>
            ))}
          </nav>
          
          <div className="pt-2 text-[11px] text-slate-500 text-center">
            MOHIT PORTFOLIO · Creative & Engineering
          </div>
        </div>
      )}
    </header>
  );
};
