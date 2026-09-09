import React, { useState, useEffect } from 'react';
import { LiveConnectionState, MoodConfig } from '../types';
import { Sparkles, MessageCircleHeart, Flame, Compass } from 'lucide-react';

interface PersonaStatusProps {
  state: LiveConnectionState;
  isMuted: boolean;
  mood: MoodConfig;
}

const MAHI_IDLE_LINES = [
  "Hey you... tap to talk to me! I was waiting for you.",
  "Come on, say hi. Tell me how your day went.",
  "I'm right here. Remember to be gentle with yourself today.",
  "Don't be shy now, tap to connect!",
  "Thinking about you... tap to chat whenever you're ready.",
];

const MAHI_LISTENING_LINES = [
  "I'm listening, tell me everything...",
  "Go on, I'm right here with you.",
  "Aww, really? Tell me more!",
  "I hear you, don't hold back...",
  "Listening closely... you have my full attention.",
];

const MAHI_SPEAKING_LINES = [
  "Haha listen to me, here's what I think...",
  "You know what? You're actually so right.",
  "Listen na, let me tell you...",
  "Aww, honestly, you're doing so well.",
  "Haha you're such a dork, but I love it!",
];

const PROMPT_SUGGESTIONS = [
  { text: 'How was your day, Mahi?' },
  { text: 'Who created you?' },
  { text: 'Cheer me up, I had a long day' },
  { text: 'Play something cozy on YouTube' },
];

export const PersonaStatus: React.FC<PersonaStatusProps> = ({ state, isMuted, mood }) => {
  const [currentLine, setCurrentLine] = useState('');

  useEffect(() => {
    let pool = MAHI_IDLE_LINES;
    if (state === 'listening') {
      pool = isMuted ? ["You're muted! Unmute your mic so I can hear your voice."] : MAHI_LISTENING_LINES;
    } else if (state === 'speaking') {
      pool = MAHI_SPEAKING_LINES;
    } else if (state === 'connecting') {
      pool = ["One sec, getting ready to talk to you..."];
    }

    const randomLine = pool[Math.floor(Math.random() * pool.length)];
    setCurrentLine(randomLine);

    if (state === 'listening' || state === 'disconnected') {
      const interval = setInterval(() => {
        const nextLine = pool[Math.floor(Math.random() * pool.length)];
        setCurrentLine(nextLine);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [state, isMuted]);

  return (
    <div id="mahi-persona-status" className="w-full max-w-md mx-auto px-4 flex flex-col items-center gap-3">
      {/* Dynamic Sassy Status Bubble */}
      <div className="relative group px-4 py-2.5 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 shadow-lg text-center max-w-sm transition-all duration-500">
        <div className="flex items-center justify-center gap-2 mb-1">
          {state === 'speaking' ? (
            <Flame className="w-3.5 h-3.5 text-fuchsia-400 animate-pulse" />
          ) : (
            <MessageCircleHeart className="w-3.5 h-3.5 text-pink-400" />
          )}
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Mahi
          </span>
        </div>
        <p className="text-sm font-medium text-slate-200 italic tracking-wide">
          "{currentLine}"
        </p>
      </div>

      {/* Suggested Spoken Phrases for quick discovery */}
      {state !== 'speaking' && (
        <div className="w-full flex flex-wrap items-center justify-center gap-2 pt-1">
          {PROMPT_SUGGESTIONS.map((item, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-slate-300 bg-slate-950/70 border border-slate-800/90 shadow-sm transition-all hover:border-slate-700 hover:text-white"
            >
              <Sparkles className="w-3 h-3 text-slate-400" style={{ color: mood.primary }} />
              Say: "{item.text}"
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
