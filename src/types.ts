export type LiveConnectionState = 'disconnected' | 'connecting' | 'listening' | 'speaking';

export type VisualDisplayMode = 'avatar' | 'orb';

export type ThemeMood =
  | 'cyber-neon'
  | 'electric-violet'
  | 'crimson-pulse'
  | 'emerald-matrix'
  | 'gold-radiance';

export type PersonalityVoice = 'Aoede' | 'Kore' | 'Zephyr';

export interface ToolCallAction {
  id: string;
  name: string;
  args: {
    url?: string;
    title?: string;
    reason?: string;
    query?: string;
    mood?: ThemeMood;
    comment?: string;
    message?: string;
    tone?: string;
    [key: string]: any;
  };
  timestamp: number;
}

export interface ToastMessage {
  id: string;
  message: string;
  tone?: 'sassy' | 'flirty' | 'playful' | 'motivational' | 'info';
  timestamp: number;
}

export interface MoodConfig {
  id: ThemeMood;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  orbGradients: [string, string, string];
  glowColor: string;
  bgGlow: string;
  tagline: string;
}

export const MOOD_THEMES: Record<ThemeMood, MoodConfig> = {
  'cyber-neon': {
    id: 'cyber-neon',
    name: 'Cyber Neon',
    primary: '#06b6d4', // cyan-500
    secondary: '#3b82f6', // blue-500
    accent: '#a855f7', // purple-500
    orbGradients: ['#22d3ee', '#0ea5e9', '#3b82f6'],
    glowColor: 'rgba(6, 182, 212, 0.45)',
    bgGlow: 'radial-gradient(circle at 50% 40%, rgba(6, 182, 212, 0.12) 0%, rgba(14, 165, 233, 0.05) 45%, transparent 70%)',
    tagline: 'Electric, sharp & hyper-focused',
  },
  'electric-violet': {
    id: 'electric-violet',
    name: 'Electric Violet',
    primary: '#d946ef', // fuchsia-500
    secondary: '#8b5cf6', // violet-500
    accent: '#ec4899', // pink-500
    orbGradients: ['#f472b6', '#c084fc', '#8b5cf6'],
    glowColor: 'rgba(217, 70, 239, 0.45)',
    bgGlow: 'radial-gradient(circle at 50% 40%, rgba(217, 70, 239, 0.14) 0%, rgba(139, 92, 246, 0.06) 45%, transparent 70%)',
    tagline: 'Flirty, vibrant & undeniably chic',
  },
  'crimson-pulse': {
    id: 'crimson-pulse',
    name: 'Crimson Pulse',
    primary: '#f43f5e', // rose-500
    secondary: '#e11d48', // rose-600
    accent: '#fb7185', // rose-400
    orbGradients: ['#fb7185', '#e11d48', '#881337'],
    glowColor: 'rgba(244, 63, 94, 0.45)',
    bgGlow: 'radial-gradient(circle at 50% 40%, rgba(244, 63, 94, 0.13) 0%, rgba(136, 19, 55, 0.05) 45%, transparent 70%)',
    tagline: 'Bold, daring & delightfully dramatic',
  },
  'emerald-matrix': {
    id: 'emerald-matrix',
    name: 'Emerald Matrix',
    primary: '#10b981', // emerald-500
    secondary: '#14b8a6', // teal-500
    accent: '#34d399', // emerald-400
    orbGradients: ['#34d399', '#10b981', '#047857'],
    glowColor: 'rgba(16, 185, 129, 0.45)',
    bgGlow: 'radial-gradient(circle at 50% 40%, rgba(16, 185, 129, 0.13) 0%, rgba(4, 120, 87, 0.05) 45%, transparent 70%)',
    tagline: 'Mysterious, slick & digitally sublime',
  },
  'gold-radiance': {
    id: 'gold-radiance',
    name: 'Gold Radiance',
    primary: '#f59e0b', // amber-500
    secondary: '#eab308', // yellow-500
    accent: '#fbbf24', // amber-400
    orbGradients: ['#fbbf24', '#f59e0b', '#d97706'],
    glowColor: 'rgba(245, 158, 11, 0.45)',
    bgGlow: 'radial-gradient(circle at 50% 40%, rgba(245, 158, 11, 0.13) 0%, rgba(217, 119, 6, 0.05) 45%, transparent 70%)',
    tagline: 'Opulent, warm & playfully unapologetic',
  },
};
