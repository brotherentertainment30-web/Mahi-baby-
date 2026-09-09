import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { MoodConfig } from '../types';
import { PWAInstallModal } from './PWAInstallModal';
import mahiAvatarImg from '../assets/images/mahi_character_1788992645607.jpg';

interface PWAInstallBannerProps {
  mood: MoodConfig;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ mood }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Check session storage on mount
  useEffect(() => {
    const dismissed = sessionStorage.getItem('mahi_pwa_banner_dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('mahi_pwa_banner_dismissed', 'true');
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      // Direct trigger of browser's native PWA installation prompt
      const outcome = await install();
      if (!outcome) {
        // If user cancelled or if prompt didn't complete, open modal guide
        setShowModal(true);
      }
    } else {
      // In iOS Safari or environments waiting for prompt, open guided install dialog
      setShowModal(true);
    }
  };

  // If already installed in standalone mode or dismissed, do not render banner
  if (isInstalled || isDismissed) {
    return <PWAInstallModal isOpen={showModal} onClose={() => setShowModal(false)} mood={mood} />;
  }

  return (
    <>
      <div
        id="pwa-install-banner"
        className="w-full max-w-md mx-auto px-3 pt-2 z-30 transition-all duration-300"
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900/95 via-slate-900/90 to-slate-950/95 border border-fuchsia-600/40 p-3 shadow-xl backdrop-blur-lg flex items-center justify-between gap-3">
          {/* Subtle mood accent ambient glow */}
          <div
            className="absolute -top-10 -left-10 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-40"
            style={{ backgroundColor: mood.primary }}
          />

          {/* Left: Avatar & App Pitch */}
          <div className="flex items-center gap-3 relative z-10 min-w-0">
            <div className="relative shrink-0">
              <img
                src={mahiAvatarImg}
                alt="Mahi"
                referrerPolicy="no-referrer"
                className="w-11 h-11 rounded-xl object-cover object-top border border-fuchsia-400/50 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-slate-950 border border-fuchsia-400/60">
                <Sparkles className="w-2.5 h-2.5 text-fuchsia-400" />
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-white tracking-tight truncate">
                  Install Mahi App
                </h4>
                <span className="px-1.5 py-0.2 rounded-md bg-fuchsia-950/80 border border-fuchsia-600/50 text-[9px] font-semibold text-fuchsia-300 shrink-0">
                  Native PWA
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-tight truncate mt-0.5">
                1-tap Home Screen access & full-screen voice chat
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 shrink-0 relative z-10">
            <button
              id="btn-banner-install"
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-md transition-all duration-200 transform active:scale-95 flex items-center gap-1.5"
              style={{
                backgroundColor: mood.primary,
                boxShadow: `0 2px 10px ${mood.primary}50`,
              }}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>

            <button
              id="btn-banner-dismiss"
              onClick={handleDismiss}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
              title="Dismiss banner"
              aria-label="Dismiss install banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <PWAInstallModal isOpen={showModal} onClose={() => setShowModal(false)} mood={mood} />
    </>
  );
};
