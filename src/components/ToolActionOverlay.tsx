import React from 'react';
import { ExternalLink, Search, Palette, Bell, X } from 'lucide-react';
import { ToolCallAction, ToastMessage, MoodConfig } from '../types';
import mahiAvatarImg from '../assets/images/mahi_character_1788992645607.jpg';

interface ToolActionOverlayProps {
  activeTool: ToolCallAction | null;
  toasts: ToastMessage[];
  mood: MoodConfig;
  onDismissTool: () => void;
  onDismissToast: (id: string) => void;
}

export const ToolActionOverlay: React.FC<ToolActionOverlayProps> = ({
  activeTool,
  toasts,
  mood,
  onDismissTool,
  onDismissToast,
}) => {
  return (
    <aside
      id="mahi-tool-actions-overlay"
      aria-label="Mahi Assistant Actions and Notifications"
      className="fixed top-16 left-0 right-0 z-40 flex flex-col items-center pointer-events-none px-4 space-y-3"
    >
      {/* Active Tool Call Banner (e.g. openWebsite / searchWeb) */}
      {activeTool && (
        <div
          id={`tool-card-${activeTool.id}`}
          className="pointer-events-auto w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-4 shadow-2xl transition-all duration-300 transform translate-y-0"
          style={{ borderColor: mood.primary }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md shrink-0"
                style={{ backgroundColor: `${mood.primary}25`, color: mood.primary }}
              >
                {activeTool.name === 'openWebsite' ? (
                  <ExternalLink className="w-5 h-5" />
                ) : activeTool.name === 'searchWeb' ? (
                  <Search className="w-5 h-5" />
                ) : activeTool.name === 'changeMood' ? (
                  <Palette className="w-5 h-5" />
                ) : (
                  <Bell className="w-5 h-5" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Browser Action Triggered
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Live
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-white mt-0.5">
                  {activeTool.name === 'openWebsite'
                    ? activeTool.args.title || 'Opening Website'
                    : activeTool.name === 'searchWeb'
                    ? `Searching: "${activeTool.args.query}"`
                    : activeTool.name === 'changeMood'
                    ? `Atmosphere: ${activeTool.args.mood}`
                    : 'Mahi Notification'}
                </h4>

                {activeTool.args.reason && (
                  <p className="text-xs text-slate-300 mt-1 italic">
                    "{activeTool.args.reason}"
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={onDismissTool}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Dismiss action"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action trigger button */}
          {(activeTool.name === 'openWebsite' || activeTool.name === 'searchWeb') && (
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-400 truncate max-w-[200px]">
                {activeTool.args.url || `google.com/search?q=${activeTool.args.query}`}
              </span>

              <a
                href={
                  activeTool.args.url ||
                  `https://www.google.com/search?q=${encodeURIComponent(activeTool.args.query || '')}`
                }
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-900 bg-white hover:bg-slate-200 transition-colors shadow"
              >
                <span>Launch Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      )}

      {/* Sassy Toast Messages */}
      {toasts.map((toast) => (
        <div
          key={toast.id}
          id={`toast-${toast.id}`}
          className="pointer-events-auto flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-fuchsia-800/50 shadow-xl text-xs font-medium text-slate-200 transition-all duration-300"
        >
          <img
            src={mahiAvatarImg}
            alt="Mahi"
            referrerPolicy="no-referrer"
            className="w-6 h-6 rounded-full object-cover shrink-0 border border-fuchsia-400/50"
          />
          <span className="leading-snug">{toast.message}</span>
          <button
            onClick={() => onDismissToast(toast.id)}
            className="text-slate-400 hover:text-white ml-1.5 p-0.5 rounded"
            aria-label="Close notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </aside>
  );
};
