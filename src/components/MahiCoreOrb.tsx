import React, { useEffect, useRef } from 'react';
import { LiveConnectionState, MoodConfig } from '../types';

interface MahiCoreOrbProps {
  state: LiveConnectionState;
  inputVolume: number;
  outputVolume: number;
  mood: MoodConfig;
  micAnalyser: AnalyserNode | null;
  speakerAnalyser: AnalyserNode | null;
  onClick: () => void;
  isMuted: boolean;
}

export const MahiCoreOrb: React.FC<MahiCoreOrbProps> = ({
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
  const animFrameId = useRef<number>(0);
  const phaseRef = useRef<number>(0);
  const smoothVolRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 360);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 360);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        width = canvas.width = entry.contentRect.width;
        height = canvas.height = entry.contentRect.height;
      }
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    const freqData = new Uint8Array(64);

    const render = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const baseRadius = Math.min(width, height) * 0.22;

      // Determine active target volume
      let targetVol = 0;
      if (state === 'speaking') {
        if (speakerAnalyser) {
          speakerAnalyser.getByteFrequencyData(freqData);
          targetVol = outputVolume;
        } else {
          targetVol = outputVolume;
        }
      } else if (state === 'listening' && !isMuted) {
        if (micAnalyser) {
          micAnalyser.getByteFrequencyData(freqData);
          targetVol = inputVolume;
        } else {
          targetVol = inputVolume;
        }
      } else if (state === 'connecting') {
        targetVol = 0.35 + Math.sin(time * 0.005) * 0.2;
      } else {
        // Idle breathing
        targetVol = 0.05 + Math.sin(time * 0.002) * 0.03;
      }

      // Smooth volume interpolation
      smoothVolRef.current += (targetVol - smoothVolRef.current) * 0.18;
      const currentVol = smoothVolRef.current;

      phaseRef.current += 0.03 + currentVol * 0.08;
      const phase = phaseRef.current;

      // 1. Outer ambient glow ring
      const glowRadius = baseRadius * (1.6 + currentVol * 0.8);
      const glowGrad = ctx.createRadialGradient(cx, cy, baseRadius * 0.5, cx, cy, glowRadius);
      glowGrad.addColorStop(0, mood.glowColor);
      glowGrad.addColorStop(0.5, mood.glowColor.replace('0.45', '0.15'));
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // 2. Concentric tech/cyber rings
      ctx.save();
      const ringCount = 3;
      for (let i = 0; i < ringCount; i++) {
        const r = baseRadius * (1.25 + i * 0.3 + currentVol * 0.2);
        ctx.strokeStyle = mood.primary;
        ctx.lineWidth = i === 1 ? 1.5 : 1;
        ctx.globalAlpha = (0.18 - i * 0.04) * (state === 'disconnected' ? 0.6 : 1);

        ctx.beginPath();
        const startAngle = (phase * (i % 2 === 0 ? 0.5 : -0.5) + (i * Math.PI) / 3) % (Math.PI * 2);
        const arcLength = Math.PI * (0.8 + currentVol * 0.6);
        ctx.arc(cx, cy, r, startAngle, startAngle + arcLength);
        ctx.stroke();

        // Little cyber ticks on the ring
        if (state !== 'disconnected') {
          const tickAngle = startAngle + arcLength + 0.2;
          const tx = cx + Math.cos(tickAngle) * r;
          const ty = cy + Math.sin(tickAngle) * r;
          ctx.fillStyle = mood.accent;
          ctx.beginPath();
          ctx.arc(tx, ty, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      // 3. Audio Frequency Waveform Orbit (when speaking or listening)
      if ((state === 'speaking' || state === 'listening') && currentVol > 0.04) {
        ctx.save();
        const points = 48;
        const waveRadius = baseRadius * 1.15;
        ctx.beginPath();
        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * Math.PI * 2;
          const freqIndex = Math.floor((i / points) * (freqData.length * 0.6));
          const freqVal = (freqData[freqIndex] || 0) / 255;
          const displacement = Math.sin(angle * 6 + phase * 2) * 8 * currentVol + freqVal * 20;
          const r = waveRadius + displacement;
          const px = cx + Math.cos(angle) * r;
          const py = cy + Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = state === 'speaking' ? mood.accent : mood.primary;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.65;
        ctx.stroke();
        ctx.restore();
      }

      // 4. Inner Organic Multi-layer Plasma Core
      const coreGrad = ctx.createRadialGradient(
        cx - baseRadius * 0.2,
        cy - baseRadius * 0.2,
        baseRadius * 0.1,
        cx,
        cy,
        baseRadius * (1 + currentVol * 0.5)
      );

      if (state === 'disconnected') {
        coreGrad.addColorStop(0, '#334155');
        coreGrad.addColorStop(0.5, '#1e293b');
        coreGrad.addColorStop(1, '#0f172a');
      } else if (state === 'connecting') {
        coreGrad.addColorStop(0, '#38bdf8');
        coreGrad.addColorStop(0.5, '#0284c7');
        coreGrad.addColorStop(1, '#0369a1');
      } else if (state === 'speaking') {
        coreGrad.addColorStop(0, mood.orbGradients[0]);
        coreGrad.addColorStop(0.5, mood.orbGradients[1]);
        coreGrad.addColorStop(1, mood.orbGradients[2]);
      } else {
        // Listening
        coreGrad.addColorStop(0, mood.primary);
        coreGrad.addColorStop(0.6, mood.secondary);
        coreGrad.addColorStop(1, '#090d16');
      }

      ctx.save();
      // Wave shape for the core
      const segments = 64;
      ctx.beginPath();
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        // Superimposed harmonic oscillations for organic plasma effect
        const deform =
          Math.sin(theta * 3 + phase) * 6 * currentVol +
          Math.cos(theta * 5 - phase * 1.4) * 4 * currentVol +
          Math.sin(theta * 2 + phase * 0.7) * (state === 'disconnected' ? 2 : 4);
        const r = baseRadius * (0.85 + currentVol * 0.3) + deform;
        const x = cx + Math.cos(theta) * r;
        const y = cy + Math.sin(theta) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = coreGrad;
      ctx.shadowColor = mood.primary;
      ctx.shadowBlur = state === 'disconnected' ? 8 : 24 + currentVol * 30;
      ctx.fill();
      ctx.restore();

      // 5. Specular Highlights / Glass Reflection on Core
      ctx.save();
      const specGrad = ctx.createLinearGradient(
        cx,
        cy - baseRadius * 0.8,
        cx,
        cy + baseRadius * 0.4
      );
      specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
      specGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.08)');
      specGrad.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.ellipse(
        cx - baseRadius * 0.15,
        cy - baseRadius * 0.35,
        baseRadius * 0.5,
        baseRadius * 0.28,
        -Math.PI / 12,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = specGrad;
      ctx.fill();
      ctx.restore();

      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameId.current);
      resizeObserver.disconnect();
    };
  }, [state, inputVolume, outputVolume, mood, micAnalyser, speakerAnalyser, isMuted]);

  return (
    <div
      id="mahi-core-orb-container"
      onClick={onClick}
      className="relative flex items-center justify-center w-full max-w-sm aspect-square mx-auto cursor-pointer select-none group"
      role="button"
      aria-label="Mahi AI Core - Tap to interact"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block transform transition-transform duration-500 group-hover:scale-105 active:scale-95"
      />

      {/* Center state badge overlay for accessibility & visual polish */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {state === 'disconnected' && (
          <div className="flex flex-col items-center gap-2 opacity-90 transition-opacity duration-300">
            <span className="px-3 py-1 text-xs font-semibold uppercase tracking-widest text-slate-300 bg-black/60 backdrop-blur-md rounded-full border border-slate-700/60 shadow-lg">
              Tap to Wake
            </span>
          </div>
        )}

        {state === 'connecting' && (
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span className="px-3 py-1 text-xs font-semibold tracking-wider text-cyan-300 bg-black/60 backdrop-blur-md rounded-full border border-cyan-500/40">
              Syncing...
            </span>
          </div>
        )}

        {state === 'listening' && (
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-3 bg-emerald-400 rounded-full animate-pulse" />
              <span className="w-1.5 h-5 bg-emerald-400 rounded-full animate-pulse delay-75" />
              <span className="w-1.5 h-3 bg-emerald-400 rounded-full animate-pulse delay-150" />
            </div>
            <span className="px-3 py-0.5 text-[11px] font-medium tracking-wide text-emerald-300 bg-black/50 backdrop-blur-md rounded-full border border-emerald-500/30">
              {isMuted ? 'Muted' : 'Listening'}
            </span>
          </div>
        )}

        {state === 'speaking' && (
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-4 bg-fuchsia-400 rounded-full animate-bounce" />
              <span className="w-1.5 h-6 bg-pink-400 rounded-full animate-bounce delay-100" />
              <span className="w-1.5 h-3 bg-violet-400 rounded-full animate-bounce delay-200" />
            </div>
            <span className="px-3 py-0.5 text-[11px] font-semibold tracking-wide text-fuchsia-200 bg-black/60 backdrop-blur-md rounded-full border border-fuchsia-500/40">
              Speaking
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
