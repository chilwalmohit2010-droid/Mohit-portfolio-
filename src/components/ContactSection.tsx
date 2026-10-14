import React, { useState } from 'react';
import { ProfileConfig } from '../types/portfolio';
import { Mail, Instagram, Youtube, Github, Twitter, Linkedin, ArrowUpRight, Copy, Check, Send } from 'lucide-react';
import { sanitizeUrl, isValidEmail } from '../utils/urlHelper';

interface ContactSectionProps {
  profile: ProfileConfig;
  headingOverride?: string;
  onOpenAdmin?: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ 
  profile, 
  headingOverride, 
  onOpenAdmin 
}) => {
  const [copied, setCopied] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [contactSubject, setContactSubject] = useState('');
  const [contactBody, setContactBody] = useState('');

  const email = profile.email?.trim() || '';
  const hasEmail = Boolean(email && isValidEmail(email));

  const socials = [
    {
      name: 'Instagram',
      url: profile.socials.instagram,
      icon: <Instagram className="w-4 h-4" />,
    },
    {
      name: 'YouTube',
      url: profile.socials.youtube,
      icon: <Youtube className="w-4 h-4" />,
    },
    {
      name: 'GitHub',
      url: profile.socials.github,
      icon: <Github className="w-4 h-4" />,
    },
    ...(profile.socials.twitter ? [{
      name: 'Twitter / X',
      url: profile.socials.twitter,
      icon: <Twitter className="w-4 h-4" />,
    }] : []),
    ...(profile.socials.linkedin ? [{
      name: 'LinkedIn',
      url: profile.socials.linkedin,
      icon: <Linkedin className="w-4 h-4" />,
    }] : []),
  ];

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasEmail) {
      navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasEmail) {
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(contactSubject)}&body=${encodeURIComponent(contactBody)}`;
    }
  };

  return (
    <section id="contact" className="py-20 sm:py-28 border-t border-white/5 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header matching Screenshot 3 */}
        <div className="space-y-4 max-w-3xl mb-12 sm:mb-14">
          <span className="text-xs sm:text-sm font-bold tracking-[0.2em] text-teal-400 uppercase">
            LET'S CONNECT
          </span>
          <h2 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            {headingOverride ? (
              <span>{headingOverride}</span>
            ) : (
              <>
                Have something in mind?<br />
                <span className="text-teal-400">Let’s make it happen.</span>
              </>
            )}
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            A conversation is where every great idea starts.
          </p>
        </div>

        {/* Contact Container matching Screenshot 3 */}
        <div className="max-w-2xl rounded-2xl border border-white/10 bg-[#0d1217]/70 p-6 sm:p-8 space-y-6 shadow-xl backdrop-blur-sm">
          
          {/* Email row matching Screenshot 3 */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                <Mail className="w-5 h-5 stroke-[2]" />
              </div>

              <div>
                {hasEmail ? (
                  <a
                    href={`mailto:${email}`}
                    className="text-base sm:text-lg font-bold text-white hover:text-teal-300 transition-colors"
                  >
                    {email}
                  </a>
                ) : (
                  <div className="text-base sm:text-lg font-semibold text-white">
                    Email not added yet
                  </div>
                )}
                <div className="text-xs text-slate-400 mt-0.5">
                  {hasEmail ? 'Click to send an email' : 'Contact information placeholder'}
                </div>
              </div>
            </div>

            {hasEmail ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyEmail}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Copy email to clipboard"
                >
                  {copied ? <Check className="w-4 h-4 text-teal-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setMessageOpen(!messageOpen)}
                  className="px-3.5 py-1.5 rounded-lg bg-teal-400 text-slate-950 font-semibold text-xs hover:bg-teal-300 transition-colors cursor-pointer"
                >
                  Message
                </button>
              </div>
            ) : onOpenAdmin ? (
              <button
                onClick={onOpenAdmin}
                className="text-xs text-teal-400 hover:underline font-medium cursor-pointer"
              >
                Configure
              </button>
            ) : null}
          </div>

          {/* Quick Email Form if toggled */}
          {messageOpen && hasEmail && (
            <form onSubmit={handleSendEmail} className="pt-4 border-t border-white/5 space-y-3">
              <input
                type="text"
                placeholder="Subject / Topic"
                value={contactSubject}
                onChange={(e) => setContactSubject(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-sm focus:border-teal-400 focus:outline-none"
              />
              <textarea
                rows={3}
                placeholder="Your message..."
                value={contactBody}
                onChange={(e) => setContactBody(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-sm focus:border-teal-400 focus:outline-none"
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Sends directly via your default email application
                </span>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-400 text-slate-950 font-semibold text-xs hover:bg-teal-300 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send via Email</span>
                </button>
              </div>
            </form>
          )}

          {/* Hairline Divider */}
          <div className="border-t border-white/10" />

          {/* Social Links List matching Screenshot 3 */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs sm:text-sm">
            {socials.map((soc) => {
              const isConfigured = Boolean(soc.url && soc.url.trim().length > 0);
              return (
                <div key={soc.name} className="flex items-center gap-2">
                  <span className="text-slate-400">{soc.icon}</span>
                  {isConfigured ? (
                    <a
                      href={sanitizeUrl(soc.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-slate-200 hover:text-teal-400 transition-colors inline-flex items-center gap-1"
                    >
                      <span>{soc.name}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                    </a>
                  ) : (
                    <span className="text-slate-400">
                      {soc.name} <span className="text-slate-500">— not added</span>
                    </span>
                  )}
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};
