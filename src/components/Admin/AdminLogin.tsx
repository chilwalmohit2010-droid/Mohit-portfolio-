import React, { useState } from 'react';
import { Lock, KeyRound, ShieldAlert, CheckCircle2, ArrowRight, ShieldCheck, Info } from 'lucide-react';
import { getAdminAuthConfig, setupFirstAdminPassword, verifyAdminPassword } from '../../services/portfolioStorage';

interface AdminLoginProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onCancel }) => {
  const authConfig = getAdminAuthConfig();
  const isFirstTime = !authConfig.isConfigured;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isFirstTime) {
        if (password.length < 6) {
          setError('Master password must be at least 6 characters long.');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          setLoading(false);
          return;
        }

        const res = await setupFirstAdminPassword(password);
        if (res.success) {
          const authRes = await verifyAdminPassword(password);
          if (authRes.success) {
            onSuccess();
          }
        } else {
          setError(res.error || 'Setup failed.');
        }
      } else {
        const res = await verifyAdminPassword(password);
        if (res.success) {
          onSuccess();
        } else {
          setError(res.error || 'Authentication failed. Please verify your password.');
        }
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto rounded-2xl bg-[#0f141a] border border-white/10 p-6 sm:p-8 space-y-5 shadow-2xl">
      {/* Notice that this area is strictly for the owner */}
      <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs text-teal-300 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Website Owner Area Only:</strong> This administrative portal is reserved for Mohit to manage website content, visual themes, media uploads, and APK packages.
        </p>
      </div>

      <div className="text-center space-y-2 pt-1">
        <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 mx-auto flex items-center justify-center">
          {isFirstTime ? <KeyRound className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
        </div>
        <h2 className="text-xl font-bold text-white">
          {isFirstTime ? 'Initial Owner Setup' : 'Admin Authentication'}
        </h2>
        <p className="text-xs text-slate-400">
          {isFirstTime
            ? 'Set your private master password to initialize your portfolio administration.'
            : 'Enter your master password to unlock the admin dashboard.'}
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">
            {isFirstTime ? 'Create Master Password' : 'Admin Password'}
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:border-teal-400 focus:outline-none"
          />
        </div>

        {isFirstTime && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Confirm Master Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:border-teal-400 focus:outline-none"
            />
          </div>
        )}

        <div className="pt-2 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-400 text-slate-950 font-bold text-xs hover:bg-teal-300 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <span>{isFirstTime ? 'Set Password & Enter' : 'Unlock Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
