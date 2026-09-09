import React from 'react';
import { Mic, MicOff, Power, Hand, Sparkles, Volume2 } from 'lucide-react';
import { LiveConnectionState, MoodConfig } from '../types';

interface MahiControlsProps {
  state: LiveConnectionState;
  isMuted: boolean;
  mood: MoodConfig;
  onToggleConnect: () => void;
  onToggleMute: () => void;
  onInterrupt: () => void;
  onOpenSettings: () => void;
}

export const MahiControls: React.FC<MahiControlsProps> = ({
  state,
  isMuted,
  mood,
  onToggleConnect,
  onToggleMute,
  onInterrupt,
  onOpenSettings,
}) => {
  const isConnected = state === 'listening' || state === 'speaking';
  const isConnecting = state === 'connecting';

  return (
    <div id="mahi-controls-bar" className="w-full max-w-sm mx-auto px-4 pb-6 flex flex-col items-center gap-5">
      {/* Dynamic Action Buttons Row */}
      <div className="flex items-center justify-center gap-6 w-full">
        {/* Left: Mic Mute / Unmute Toggle */}
        <button
          id="btn-toggle-mute"
          onClick={onToggleMute}
          disabled={!isConnected}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border ${
            !isConnected
              ? 'opacity-30 cursor-not-allowed border-slate-800 bg-slate-900/50 text-slate-500'
              : isMuted
              ? 'bg-rose-950/80 border-rose-500/80 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
              : 'bg-slate-900/80 hover:bg-slate-800 border-slate-700/80 text-slate-300 hover:text-white'
          }`}
          title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Center: Hero Main Power / Mic Action Button */}
        <div className="relative flex items-center justify-center">
          {/* Pulsing aura when connected */}
          {isConnected && (
            <span
              className="absolute inset-0 rounded-full animate-ping opacity-25"
              style={{ backgroundColor: mood.primary }}
            />
          )}

          <button
            id="btn-main-power"
            onClick={onToggleConnect}
            disabled={isConnecting}
            className={`relative w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all duration-500 shadow-2xl focus:outline-none select-none active:scale-95 ${
              state === 'disconnected'
                ? 'bg-gradient-to-b from-slate-800 to-slate-950 text-slate-200 border-2 border-slate-700 hover:border-slate-500 hover:shadow-[0_0_25px_rgba(148,163,184,0.25)]'
                : isConnecting
                ? 'bg-gradient-to-b from-cyan-900 to-slate-950 text-cyan-300 border-2 border-cyan-500 animate-pulse'
                : state === 'speaking'
                ? 'bg-gradient-to-b from-fuchsia-600 to-violet-900 text-white border-2 border-fuchsia-400 shadow-[0_0_35px_rgba(217,70,239,0.6)]'
                : 'bg-gradient-to-b from-emerald-600 to-teal-950 text-white border-2 border-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.5)]'
            }`}
            aria-label={
              state === 'disconnected'
                ? 'Wake Mahi AI'
                : isConnecting
                ? 'Connecting to Mahi AI'
                : 'End Voice Session'
            }
          >
            {state === 'disconnected' && (
              <>
                <Power className="w-8 h-8 transition-transform group-hover:scale-110" />
                <span className="text-[10px] font-bold tracking-wider uppercase mt-1 text-slate-400">
                  Wake
                </span>
              </>
            )}

            {isConnecting && (
              <div className="w-7 h-7 border-2 border-cyan-300 border-t-transparent rounded-full animate-spin" />
            )}

            {state === 'listening' && (
              <>
                <Mic className="w-8 h-8 text-emerald-200 animate-pulse" />
                <span className="text-[10px] font-bold tracking-wider uppercase mt-0.5 text-emerald-200">
                  Live
                </span>
              </>
            )}

            {state === 'speaking' && (
              <>
                <Volume2 className="w-8 h-8 text-fuchsia-100 animate-bounce" />
                <span className="text-[10px] font-bold tracking-wider uppercase mt-0.5 text-fuchsia-100">
                  Talking
                </span>
              </>
            )}
          </button>
        </div>

        {/* Right: Interrupt or Settings */}
        {state === 'speaking' ? (
          <button
            id="btn-interrupt"
            onClick={onInterrupt}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/80 text-amber-300 transition-all duration-300 shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse"
            title="Interrupt Mahi (Stop Speaking)"
            aria-label="Interrupt Mahi"
          >
            <Hand className="w-5 h-5" />
          </button>
        ) : (
          <button
            id="btn-open-settings"
            onClick={onOpenSettings}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition-all duration-300"
            title="Customize Personality & Mood"
            aria-label="Customize Settings"
          >
            <Sparkles className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Helper caption */}
      <div className="text-center space-y-1.5">
        <p className="text-xs text-slate-400 font-medium">
          {state === 'disconnected'
            ? 'Voice-to-voice only • Click button to wake Mahi'
            : state === 'connecting'
            ? 'Connecting to Gemini 3.1 Flash Live...'
            : state === 'listening'
            ? isMuted
              ? 'Mic is muted. Unmute to speak.'
              : 'Speak naturally • Mahi is listening'
            : 'Tap center or hand icon to interrupt'}
        </p>
        <div id="creator-attribution" className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <span>Created by</span>
          <span className="font-semibold text-slate-300">Karthik Naidu</span>
        </div>
      </div>
    </div>
  );
};
