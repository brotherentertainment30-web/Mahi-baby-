import React, { useEffect, useRef, useState } from 'react';
import { LiveConnectionState, MoodConfig } from '../types';
import { Sparkles, Mic, Volume2, MicOff, Maximize2, X } from 'lucide-react';
import mahiAvatarImg from '../assets/images/mahi_character_1788992645607.jpg';

interface MahiAvatarCardProps {
  state: LiveConnectionState;
  inputVolume: number;
  outputVolume: number;
  mood: MoodConfig;
  micAnalyser: AnalyserNode | null;
  speakerAnalyser: AnalyserNode | null;
  onClick: () => void;
  isMuted: boolean;
}

export const MahiAvatarCard: React.FC<MahiAvatarCardProps> = ({
  state,
  inputVolume,
  outputVolume,
  mood,
  micAnalyser,
  speakerAnalyser,
  onClick,
  isMuted,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);
  const [showFullPreview, setShowFullPreview] = useState(false);

  // Active volume calculation for halo/aura reactivity
  const activeVolume = state === 'speaking' ? outputVolume : state === 'listening' && !isMuted ? inputVolume : 0;
  const pulseScale = 1 + activeVolume * 0.06;

  // Waveform canvas overlay at the base of the avatar
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 280);
    let height = (canvas.height = 48);

    const freqData = new Uint8Array(32);
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      let analyser = null;
      if (state === 'speaking') {
        analyser = speakerAnalyser;
      } else if (state === 'listening' && !isMuted) {
        analyser = micAnalyser;
      }

      if (analyser) {
        analyser.getByteFrequencyData(freqData);
      }

      const barCount = 20;
      const barWidth = 3.5;
      const spacing = (width - barCount * barWidth) / (barCount + 1);

      phase += 0.08;

      for (let i = 0; i < barCount; i++) {
        const x = spacing + i * (barWidth + spacing);
        const freqVal = analyser ? (freqData[i % freqData.length] || 0) / 255 : 0;

        let barHeight = 4;
        if (state === 'speaking' || (state === 'listening' && !isMuted)) {
          barHeight = Math.max(4, freqVal * 36 + Math.sin(phase + i * 0.4) * 6 * (activeVolume + 0.15));
        } else if (state === 'connecting') {
          barHeight = 6 + Math.sin(phase * 2 + i * 0.5) * 5;
        } else {
          barHeight = 3 + Math.sin(phase * 0.5 + i * 0.3) * 2;
        }

        const y = height - barHeight;

        // Gradient for bars
        const grad = ctx.createLinearGradient(0, y, 0, height);
        grad.addColorStop(0, mood.primary);
        grad.addColorStop(1, state === 'speaking' ? mood.accent : `${mood.primary}33`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [state, inputVolume, outputVolume, mood, micAnalyser, speakerAnalyser, isMuted, activeVolume]);

  return (
    <div
      id="mahi-avatar-card-container"
      className="relative flex flex-col items-center justify-center w-full max-w-[320px] mx-auto select-none"
    >
      {/* Dynamic Soundwave Pulsing Rings (Behind Portrait) */}
      <div
        className="absolute inset-0 -m-6 rounded-3xl pointer-events-none transition-all duration-300"
        style={{
          boxShadow:
            state === 'speaking'
              ? `0 0 ${40 + activeVolume * 60}px ${mood.primary}88, 0 0 ${80 + activeVolume * 90}px ${mood.accent}55`
              : state === 'listening'
              ? `0 0 35px ${mood.primary}55`
              : `0 0 20px rgba(0,0,0,0.6)`,
        }}
      />

      {state === 'speaking' && (
        <span
          className="absolute -inset-3 rounded-[32px] pointer-events-none animate-ping opacity-30"
          style={{ backgroundColor: mood.primary }}
        />
      )}

      {/* Main Avatar Card Frame */}
      <div
        id="mahi-avatar-frame"
        onClick={onClick}
        role="button"
        tabIndex={0}
        aria-label="Mahi Character Avatar - Tap to interact"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
        className="group relative w-full aspect-[3/4] rounded-[28px] overflow-hidden cursor-pointer shadow-2xl border-2 transition-all duration-300 transform active:scale-95"
        style={{
          borderColor:
            state === 'speaking'
              ? mood.primary
              : state === 'listening'
              ? `${mood.primary}aa`
              : 'rgba(51, 65, 85, 0.7)',
          transform: `scale(${pulseScale})`,
        }}
      >
        {/* The Illustrated Portrait of Mahi */}
        <img
          src={mahiAvatarImg}
          alt="Mahi - AI Companion"
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover object-center transition-all duration-700 ${
            state === 'speaking'
              ? 'scale-105 brightness-105 contrast-105'
              : state === 'listening'
              ? 'scale-100 brightness-100'
              : 'scale-100 brightness-90 grayscale-[15%]'
          }`}
        />

        {/* Cinematic Vignette & Bottom Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090e] via-transparent to-black/20 pointer-events-none" />

        {/* Ambient Mood Tint Overlay */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-700 mix-blend-color"
          style={{
            backgroundColor: mood.primary,
            opacity: state === 'speaking' ? 0.15 : state === 'listening' ? 0.08 : 0.02,
          }}
        />

        {/* Top Header Tags Overlay on Avatar */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {/* Status Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-semibold shadow-lg">
            {state === 'speaking' && (
              <>
                <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-ping" />
                <span className="text-fuchsia-200">Mahi Speaking</span>
              </>
            )}
            {state === 'listening' && (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-200">{isMuted ? 'Mic Muted' : 'Mahi Listening'}</span>
              </>
            )}
            {state === 'connecting' && (
              <>
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-cyan-200">Connecting...</span>
              </>
            )}
            {state === 'disconnected' && (
              <>
                <span className="w-2 h-2 rounded-full bg-slate-500" />
                <span className="text-slate-300">Tap to Wake</span>
              </>
            )}
          </div>

          {/* Zoom / Full Preview Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowFullPreview(true);
            }}
            className="pointer-events-auto p-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white/70 hover:text-white transition-colors"
            title="View Full Portrait"
            aria-label="View Full Portrait"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bottom Bar: Soundwave visualizer & Name Tag */}
        <div className="absolute bottom-2 left-3 right-3 pointer-events-none flex flex-col gap-1">
          {/* Waveform EQ Canvas */}
          <canvas ref={canvasRef} className="w-full h-8 block" />

          {/* Name & Identity */}
          <div className="flex items-center justify-between pt-1 border-t border-white/10">
            <div>
              <span className="text-sm font-extrabold text-white tracking-wide drop-shadow-md">
                MAHI
              </span>
              <span className="text-[11px] text-slate-300 ml-2 italic drop-shadow">
                Your AI Companion
              </span>
            </div>

            {state === 'speaking' ? (
              <Volume2 className="w-4 h-4 text-fuchsia-300 animate-bounce" />
            ) : isMuted ? (
              <MicOff className="w-4 h-4 text-rose-400" />
            ) : state === 'listening' ? (
              <Mic className="w-4 h-4 text-emerald-400 animate-pulse" />
            ) : (
              <Sparkles className="w-4 h-4 text-slate-400" />
            )}
          </div>
        </div>
      </div>

      {/* Full Size Modal Preview */}
      {showFullPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          onClick={() => setShowFullPreview(false)}
        >
          <div
            className="relative max-w-md w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-900 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowFullPreview(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/70 text-white hover:bg-black transition-colors"
              aria-label="Close preview"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={mahiAvatarImg}
              alt="Mahi Full Portrait"
              referrerPolicy="no-referrer"
              className="w-full h-auto object-cover max-h-[80vh]"
            />
            <div className="p-4 bg-slate-950 flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-white">Mahi</h4>
                <p className="text-xs text-slate-400">Witty, confident & always here for you</p>
              </div>
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold border"
                style={{
                  backgroundColor: `${mood.primary}20`,
                  borderColor: mood.primary,
                  color: mood.primary,
                }}
              >
                {mood.name}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
