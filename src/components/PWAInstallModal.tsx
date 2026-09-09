import React, { useState } from 'react';
import { Download, CheckCircle2, Share2, PlusSquare, Smartphone, Monitor, Terminal, ExternalLink, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { MoodConfig } from '../types';
import mahiAvatarImg from '../assets/images/mahi_character_1788992645607.jpg';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  mood: MoodConfig;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose, mood }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'pwa' | 'github'>('pwa');
  const [copiedGit, setCopiedGit] = useState(false);

  if (!isOpen) return null;

  const handleCopyGitCommand = () => {
    navigator.clipboard.writeText('git clone https://github.com/brotherentertainment30-web/Mahi.git\ncd Mahi\nnpm install\nnpm run dev');
    setCopiedGit(true);
    setTimeout(() => setCopiedGit(false), 2500);
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        onClose();
      }
    }
  };

  return (
    <div
      id="pwa-install-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="pwa-install-modal-content"
        className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <img
              src={mahiAvatarImg}
              alt="Mahi App Icon"
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-2xl object-cover border border-fuchsia-400/40 shadow"
            />
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Install Mahi App
                {isInstalled && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold border border-emerald-500/40">
                    Installed
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">Add to Home Screen or Run Locally</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 pt-3 pb-1 flex gap-2 border-b border-slate-800/60 bg-slate-900/50">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 border ${
              activeTab === 'pwa'
                ? 'bg-fuchsia-600/30 border-fuchsia-500 text-fuchsia-200 shadow-sm'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile / Desktop App (1-Click)</span>
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 border ${
              activeTab === 'github'
                ? 'bg-fuchsia-600/30 border-fuchsia-500 text-fuchsia-200 shadow-sm'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>GitHub Setup</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-300">
          {activeTab === 'pwa' ? (
            <>
              {isInstalled ? (
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-white">Mahi is already installed!</h4>
                    <p className="mt-1 text-slate-300 leading-relaxed text-[11px]">
                      You can launch Mahi directly from your device home screen or app launcher without opening browser tabs.
                    </p>
                  </div>
                </div>
              ) : isInstallable ? (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-fuchsia-600 to-cyan-500 flex items-center justify-center shadow-lg">
                      <Download className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">One-Click Direct Install</h4>
                      <p className="mt-1 text-slate-400 text-[11px] max-w-xs mx-auto">
                        Install Mahi as a native standalone application on your Android, Windows, Mac, or Chromebook.
                      </p>
                    </div>
                    <button
                      onClick={handleInstallClick}
                      className="w-full py-3 px-4 rounded-xl font-bold text-white text-sm shadow-lg transition-all transform active:scale-98 flex items-center justify-center gap-2"
                      style={{
                        backgroundColor: mood.primary,
                        boxShadow: `0 0 20px ${mood.primary}60`,
                      }}
                    >
                      <Download className="w-4 h-4" />
                      <span>Install Application Now</span>
                    </button>
                  </div>
                </div>
              ) : isIOS ? (
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-3">
                  <div className="flex items-center gap-2 text-white font-semibold text-sm">
                    <Smartphone className="w-4 h-4 text-fuchsia-400" />
                    <span>Install on iPhone / iPad (Safari)</span>
                  </div>
                  <ol className="space-y-2 text-slate-300 pl-1 text-[11px]">
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-slate-700 text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold">
                        1
                      </span>
                      <span>
                        Tap the <strong className="text-white">Share</strong> button <Share2 className="w-3.5 h-3.5 inline mx-1 text-cyan-400" /> at the bottom of Safari.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-slate-700 text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold">
                        2
                      </span>
                      <span>
                        Scroll down and tap <strong className="text-white">Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-fuchsia-400" />.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-slate-700 text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold">
                        3
                      </span>
                      <span>
                        Tap <strong className="text-white">Add</strong> in the top right. Mahi will now appear on your home screen!
                      </span>
                    </li>
                  </ol>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-2">
                    <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                      <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                      How to install on Android & Desktop Chrome / Edge:
                    </h4>
                    <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[11px]">
                      <li>
                        Tap the browser menu <strong className="text-white">⋮ (three dots)</strong> in Chrome or Edge.
                      </li>
                      <li>
                        Select <strong className="text-white">"Install app"</strong> or <strong className="text-white">"Add to Home Screen"</strong>.
                      </li>
                      <li>
                        On Desktop, click the <strong className="text-white">Install icon</strong> in your browser address bar.
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Benefits badge */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Full Screen App</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Real-time Voice Calls</span>
                </div>
              </div>
            </>
          ) : (
            /* GitHub Repo Local Install Guide */
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/80">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white text-xs">Repository URL:</span>
                  <a
                    href="https://github.com/brotherentertainment30-web/Mahi"
                    target="_blank"
                    rel="noreferrer"
                    className="text-fuchsia-400 hover:text-fuchsia-300 flex items-center gap-1 text-[11px]"
                  >
                    <span>brotherentertainment30-web/Mahi</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
                  Clone & Run in Terminal:
                </label>
                <div className="relative rounded-xl bg-slate-950 p-3 border border-slate-800 font-mono text-[11px] text-emerald-400">
                  <pre className="overflow-x-auto whitespace-pre">
{`git clone https://github.com/brotherentertainment30-web/Mahi.git
cd Mahi
npm install
npm run dev`}
                  </pre>
                  <button
                    onClick={handleCopyGitCommand}
                    className="mt-2 w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-sans font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    {copiedGit ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Commands Copied!</span>
                      </>
                    ) : (
                      <>
                        <Terminal className="w-3.5 h-3.5" />
                        <span>Copy Install Commands</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                <p className="font-semibold text-white">Environment Variable Requirement:</p>
                <p>Create a <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">.env</code> file in the cloned project root:</p>
                <pre className="bg-slate-950 p-2 rounded text-fuchsia-300 text-[10px] mt-1">
GEMINI_API_KEY=your_gemini_api_key_here
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">Mahi Personal Voice Assistant</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
