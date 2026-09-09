import React from 'react';
import { Sparkles, Settings2, X, Volume2, ShieldCheck, UserCheck, Disc3 } from 'lucide-react';
import { LiveConnectionState, MoodConfig, PersonalityVoice, ThemeMood, MOOD_THEMES, VisualDisplayMode } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import mahiAvatarImg from '../assets/images/mahi_character_1788992645607.jpg';

interface MahiHeaderProps {
  state: LiveConnectionState;
  sessionDuration: number;
  mood: MoodConfig;
  selectedVoice: PersonalityVoice;
  displayMode: VisualDisplayMode;
  onSelectMood: (mood: ThemeMood) => void;
  onSelectVoice: (voice: PersonalityVoice) => void;
  onToggleDisplayMode: () => void;
  showSettings: boolean;
  onToggleSettings: () => void;
}

export const MahiHeader: React.FC<MahiHeaderProps> = ({
  state,
  sessionDuration,
  mood,
  selectedVoice,
  displayMode,
  onSelectMood,
  onSelectVoice,
  onToggleDisplayMode,
  showSettings,
  onToggleSettings,
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header id="mahi-app-header" className="w-full max-w-xl mx-auto px-4 pt-4 pb-2 flex items-center justify-between z-30">
      {/* Brand & Persona Tag */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div
            className="w-11 h-11 rounded-2xl overflow-hidden border-2 shadow-lg transition-colors duration-500 bg-slate-900"
            style={{
              borderColor: mood.primary,
              boxShadow: `0 0 14px ${mood.primary}40`,
            }}
          >
            <img
              src={mahiAvatarImg}
              alt="Mahi Avatar"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top"
            />
          </div>
          {/* Active status pip */}
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-950 ${
              state === 'speaking'
                ? 'bg-fuchsia-400 animate-ping'
                : state === 'listening'
                ? 'bg-emerald-400 animate-pulse'
                : state === 'connecting'
                ? 'bg-cyan-400'
                : 'bg-slate-500'
            }`}
          />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight text-white font-['Space_Grotesk']">
              MAHI
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-fuchsia-300 bg-fuchsia-950/60 border border-fuchsia-700/60 rounded-full">
              Live AI
            </span>
          </div>
          <p className="text-[11px] text-slate-400 tracking-wide">
            Confident • Witty • By Karthik Naidu
          </p>
        </div>
      </div>

      {/* Right: View Toggle, Install App, State indicator pill & Settings toggle */}
      <div className="flex items-center gap-2">
        {/* Install Application PWA Button */}
        <PWAInstallButton mood={mood} variant="header" />

        {/* View mode toggle button */}
        <button
          id="btn-toggle-view-mode"
          onClick={onToggleDisplayMode}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm"
          title={`Switch to ${displayMode === 'avatar' ? 'Orb' : 'Avatar'} view`}
          aria-label={`Switch to ${displayMode === 'avatar' ? 'Orb' : 'Avatar'} view`}
        >
          {displayMode === 'avatar' ? (
            <>
              <Disc3 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px]">Orb</span>
            </>
          ) : (
            <>
              <UserCheck className="w-3.5 h-3.5 text-fuchsia-400" />
              <span className="text-[11px]">Avatar</span>
            </>
          )}
        </button>

        {/* Status / Timer Pill */}
        <div
          id="status-indicator-pill"
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-800 text-xs font-semibold"
        >
          {state === 'disconnected' && (
            <>
              <span className="w-2 h-2 rounded-full bg-slate-500" />
              <span className="text-slate-400">Idle</span>
            </>
          )}

          {state === 'connecting' && (
            <>
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-cyan-300">Syncing</span>
            </>
          )}

          {state === 'listening' && (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-300">{formatTime(sessionDuration)}</span>
            </>
          )}

          {state === 'speaking' && (
            <>
              <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-ping" />
              <span className="text-fuchsia-300">{formatTime(sessionDuration)}</span>
            </>
          )}
        </div>

        {/* Settings button */}
        <button
          id="btn-header-settings"
          onClick={onToggleSettings}
          className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          aria-label="Toggle settings"
        >
          <Settings2 className="w-4 h-4" />
        </button>
      </div>

      {/* Settings Modal Drawer */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div
            id="mahi-settings-modal"
            className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl relative"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-fuchsia-400" />
                <h3 className="text-base font-bold text-white">Mahi Persona & Audio</h3>
              </div>
              <button
                onClick={onToggleSettings}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Close settings"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5 pt-4">
              {/* Voice selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Live Voice Model
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Aoede', 'Kore', 'Zephyr'] as PersonalityVoice[]).map((voice) => (
                    <button
                      key={voice}
                      onClick={() => onSelectVoice(voice)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                        selectedVoice === voice
                          ? 'bg-fuchsia-600/30 border-fuchsia-500 text-fuchsia-200 shadow-sm'
                          : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1 mb-0.5">
                        <Volume2 className="w-3 h-3" />
                        <span>{voice}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block font-normal">
                        {voice === 'Aoede' ? 'Playful' : voice === 'Kore' ? 'Warm' : 'Energetic'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Visual Display Center Mode */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Visual Center Style
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onToggleDisplayMode()}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-center flex items-center justify-center gap-2 ${
                      displayMode === 'avatar'
                        ? 'bg-fuchsia-600/30 border-fuchsia-500 text-fuchsia-200'
                        : 'bg-slate-800/60 border-slate-700/80 text-slate-300'
                    }`}
                  >
                    <UserCheck className="w-4 h-4 text-fuchsia-400" />
                    <span>Mahi Avatar</span>
                  </button>
                  <button
                    onClick={() => onToggleDisplayMode()}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-center flex items-center justify-center gap-2 ${
                      displayMode === 'orb'
                        ? 'bg-cyan-600/30 border-cyan-500 text-cyan-200'
                        : 'bg-slate-800/60 border-slate-700/80 text-slate-300'
                    }`}
                  >
                    <Disc3 className="w-4 h-4 text-cyan-400" />
                    <span>Plasma Orb</span>
                  </button>
                </div>
              </div>

              {/* Theme Mood Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Atmospheric Core Mood
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {(Object.keys(MOOD_THEMES) as ThemeMood[]).map((moodKey) => {
                    const m = MOOD_THEMES[moodKey];
                    const isSelected = mood.id === moodKey;
                    return (
                      <button
                        key={moodKey}
                        onClick={() => onSelectMood(moodKey)}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-slate-800 border-slate-600 shadow-md'
                            : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/40 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-3.5 h-3.5 rounded-full shadow-sm shrink-0"
                            style={{ backgroundColor: m.primary }}
                          />
                          <div>
                            <span className="text-xs font-semibold text-white block">
                              {m.name}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {m.tagline}
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: m.primary }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Install App Option in Settings */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Application Installation
                </label>
                <PWAInstallButton mood={mood} variant="settings" />
              </div>

              {/* Model info banner */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-300 block">
                    Gemini 3.1 Flash Live Preview
                  </span>
                  <span>
                    Ultra-low latency audio-to-audio streaming via WebSocket with continuous session memory.
                  </span>
                </div>
              </div>

              {/* Creator Attribution */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-fuchsia-400" />
                  <span className="text-slate-400">Created by</span>
                </div>
                <span className="font-semibold text-slate-200">Karthik Naidu</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
