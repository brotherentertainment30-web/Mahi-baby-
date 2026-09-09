import React, { useState } from 'react';
import { Download, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';
import { MoodConfig } from '../types';

interface PWAInstallButtonProps {
  mood: MoodConfig;
  variant?: 'header' | 'settings' | 'card';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ mood, variant = 'header' }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInstallable) {
      // Direct install prompt if browser supports it
      const outcome = await install();
      if (!outcome) {
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  if (variant === 'settings') {
    return (
      <>
        <button
          type="button"
          onClick={handleClick}
          className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-all text-left group"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
              style={{
                backgroundColor: `${mood.primary}25`,
                color: mood.primary,
              }}
            >
              {isInstalled ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Download className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-fuchsia-300 transition-colors">
                {isInstalled ? 'Mahi App Installed' : 'Install Mahi Application'}
              </div>
              <div className="text-[11px] text-slate-400">
                {isInstalled ? 'Running in standalone app mode' : 'Add to home screen or run locally'}
              </div>
            </div>
          </div>
          <span
            className="px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all"
            style={{
              borderColor: `${mood.primary}60`,
              color: mood.primary,
              backgroundColor: `${mood.primary}15`,
            }}
          >
            {isInstalled ? 'Installed' : 'Install'}
          </span>
        </button>

        <PWAInstallModal isOpen={showModal} onClose={() => setShowModal(false)} mood={mood} />
      </>
    );
  }

  // Header button variant
  return (
    <>
      <button
        id="btn-install-app"
        type="button"
        onClick={handleClick}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-fuchsia-600/90 to-pink-600/90 hover:from-fuchsia-500 hover:to-pink-500 text-white text-xs font-bold shadow-md shadow-fuchsia-950/40 border border-fuchsia-400/40 transition-all transform active:scale-95"
        title="Install Mahi App on your device"
        aria-label="Install Mahi App on your device"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="text-[11px]">{isInstalled ? 'App Ready' : 'Install App'}</span>
      </button>

      <PWAInstallModal isOpen={showModal} onClose={() => setShowModal(false)} mood={mood} />
    </>
  );
};
