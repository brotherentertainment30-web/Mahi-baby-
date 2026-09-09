import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LiveSession } from './services/LiveSession';
import {
  LiveConnectionState,
  PersonalityVoice,
  ThemeMood,
  ToolCallAction,
  ToastMessage,
  MOOD_THEMES,
  VisualDisplayMode,
} from './types';
import { MahiHeader } from './components/MahiHeader';
import { MahiCoreOrb } from './components/MahiCoreOrb';
import { MahiAvatarCard } from './components/MahiAvatarCard';
import { MahiControls } from './components/MahiControls';
import { PersonaStatus } from './components/PersonaStatus';
import { ToolActionOverlay } from './components/ToolActionOverlay';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { AlertTriangle, X } from 'lucide-react';

export default function App() {
  const [connectionState, setConnectionState] = useState<LiveConnectionState>('disconnected');
  const [displayMode, setDisplayMode] = useState<VisualDisplayMode>('avatar');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [inputVolume, setInputVolume] = useState<number>(0);
  const [outputVolume, setOutputVolume] = useState<number>(0);
  const [activeMood, setActiveMood] = useState<ThemeMood>('electric-violet');
  const [selectedVoice, setSelectedVoice] = useState<PersonalityVoice>('Aoede');
  const [activeTool, setActiveTool] = useState<ToolCallAction | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [sessionDuration, setSessionDuration] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  const liveSessionRef = useRef<LiveSession | null>(null);
  const durationTimerRef = useRef<number | null>(null);

  const currentMoodConfig = MOOD_THEMES[activeMood] || MOOD_THEMES['electric-violet'];

  // Add a toast message
  const addToast = useCallback((message: string, tone?: string) => {
    const newToast: ToastMessage = {
      id: Math.random().toString(36).substring(2, 9),
      message,
      tone: (tone as any) || 'playful',
      timestamp: Date.now(),
    };
    setToasts((prev) => [...prev.slice(-3), newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 6000);
  }, []);

  // Initialize LiveSession instance
  useEffect(() => {
    const session = new LiveSession({
      onStateChange: (newState) => {
        setConnectionState(newState);
      },
      onToolCall: (action) => {
        setActiveTool(action);

        // React to specific tool actions
        if (action.name === 'changeMood' && action.args?.mood) {
          const reqMood = action.args.mood as ThemeMood;
          if (MOOD_THEMES[reqMood]) {
            setActiveMood(reqMood);
          }
          if (action.args.comment) {
            addToast(action.args.comment, 'sassy');
          }
        } else if (action.name === 'openWebsite') {
          addToast(`Mahi opened: ${action.args.title || action.args.url}`, 'flirty');
        } else if (action.name === 'searchWeb') {
          addToast(`Mahi searched: "${action.args.query}"`, 'sassy');
        }

        // Auto-dismiss tool card after 12s
        setTimeout(() => {
          setActiveTool((curr) => (curr?.id === action.id ? null : curr));
        }, 12000);
      },
      onVolumeChange: (inVol, outVol) => {
        setInputVolume(inVol);
        setOutputVolume(outVol);
      },
      onError: (err) => {
        setErrorMessage(err);
      },
      onToast: (msg, tone) => {
        addToast(msg, tone);
      },
    });

    liveSessionRef.current = session;

    return () => {
      session.disconnect();
    };
  }, [addToast]);

  // Session timer when connected
  useEffect(() => {
    if (connectionState === 'listening' || connectionState === 'speaking') {
      if (durationTimerRef.current === null) {
        setSessionDuration(0);
        durationTimerRef.current = window.setInterval(() => {
          setSessionDuration((prev) => prev + 1);
        }, 1000);
      }
    } else {
      if (durationTimerRef.current !== null) {
        window.clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
      setSessionDuration(0);
    }

    return () => {
      if (durationTimerRef.current !== null) {
        window.clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
    };
  }, [connectionState]);

  // Handle Connect / Disconnect toggle
  const handleToggleConnect = useCallback(() => {
    setErrorMessage(null);
    if (!liveSessionRef.current) return;

    if (connectionState === 'disconnected') {
      liveSessionRef.current.connect(selectedVoice).catch((err) => {
        setErrorMessage(err.message || 'Failed to start Live session');
      });
    } else {
      liveSessionRef.current.disconnect();
    }
  }, [connectionState, selectedVoice]);

  // Handle Mute toggle
  const handleToggleMute = useCallback(() => {
    if (!liveSessionRef.current) return;
    const nextMuted = !isMuted;
    liveSessionRef.current.setMuted(nextMuted);
    setIsMuted(nextMuted);
  }, [isMuted]);

  // Handle Interruption
  const handleInterrupt = useCallback(() => {
    if (!liveSessionRef.current) return;
    liveSessionRef.current.interrupt();
  }, []);

  return (
    <div
      id="mahi-app-root"
      className="relative min-h-screen w-full bg-[#08090e] text-slate-100 flex flex-col justify-between overflow-hidden font-['Plus_Jakarta_Sans',sans-serif] select-none"
      style={{
        backgroundImage: currentMoodConfig.bgGlow,
      }}
    >
      {/* Ambient background lighting effect */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[140px] opacity-25 transition-all duration-1000"
        style={{ backgroundColor: currentMoodConfig.primary }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-[140px] opacity-15 transition-all duration-1000"
        style={{ backgroundColor: currentMoodConfig.secondary }}
      />

      {/* Floating Tool & Toast Notifications */}
      <ToolActionOverlay
        activeTool={activeTool}
        toasts={toasts}
        mood={currentMoodConfig}
        onDismissTool={() => setActiveTool(null)}
        onDismissToast={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />

      {/* Error Banner */}
      {errorMessage && (
        <aside
          id="error-banner"
          aria-label="Error alert"
          className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto p-4 rounded-2xl bg-rose-950/90 border border-rose-600/80 backdrop-blur-xl shadow-2xl flex items-start justify-between gap-3 text-rose-200"
        >
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold block text-sm text-white">Connection Notice</span>
              <p className="mt-0.5 text-rose-200">{errorMessage}</p>
            </div>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="p-1 rounded-lg text-rose-300 hover:text-white"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </aside>
      )}

      {/* Top Header */}
      <MahiHeader
        state={connectionState}
        sessionDuration={sessionDuration}
        mood={currentMoodConfig}
        selectedVoice={selectedVoice}
        displayMode={displayMode}
        onSelectMood={setActiveMood}
        onSelectVoice={setSelectedVoice}
        onToggleDisplayMode={() => setDisplayMode((prev) => (prev === 'avatar' ? 'orb' : 'avatar'))}
        showSettings={showSettings}
        onToggleSettings={() => setShowSettings((prev) => !prev)}
      />

      {/* Prominent PWA Install Banner */}
      <PWAInstallBanner mood={currentMoodConfig} />

      {/* Center Stage: Interactive Avatar or Core Orb & Sassy Vibe Status */}
      <main id="mahi-interactive-stage" className="flex-1 flex flex-col items-center justify-center px-4 py-2 my-auto z-10 w-full max-w-md mx-auto">
        {displayMode === 'avatar' ? (
          <MahiAvatarCard
            state={connectionState}
            inputVolume={inputVolume}
            outputVolume={outputVolume}
            mood={currentMoodConfig}
            micAnalyser={liveSessionRef.current?.getMicAnalyser() ?? null}
            speakerAnalyser={liveSessionRef.current?.getSpeakerAnalyser() ?? null}
            onClick={handleToggleConnect}
            isMuted={isMuted}
          />
        ) : (
          <MahiCoreOrb
            state={connectionState}
            inputVolume={inputVolume}
            outputVolume={outputVolume}
            mood={currentMoodConfig}
            micAnalyser={liveSessionRef.current?.getMicAnalyser() ?? null}
            speakerAnalyser={liveSessionRef.current?.getSpeakerAnalyser() ?? null}
            onClick={handleToggleConnect}
            isMuted={isMuted}
          />
        )}

        <div className="mt-4 w-full">
          <PersonaStatus
            state={connectionState}
            isMuted={isMuted}
            mood={currentMoodConfig}
          />
        </div>
      </main>

      {/* Bottom Voice Controls */}
      <footer id="mahi-controls-footer" className="z-20 w-full pt-2">
        <MahiControls
          state={connectionState}
          isMuted={isMuted}
          mood={currentMoodConfig}
          onToggleConnect={handleToggleConnect}
          onToggleMute={handleToggleMute}
          onInterrupt={handleInterrupt}
          onOpenSettings={() => setShowSettings(true)}
        />
      </footer>
    </div>
  );
}
