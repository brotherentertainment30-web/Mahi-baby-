/**
 * AudioPlayer
 * Plays 24kHz PCM16 audio chunks using Web Audio API with gapless scheduling
 * and instant interruption handling.
 */

export interface AudioPlayerCallbacks {
  onPlaybackStarted?: () => void;
  onPlaybackEnded?: () => void;
  onPlaybackInterrupted?: () => void;
  onVolumeChange?: (volume: number) => void;
  onError?: (err: Error) => void;
}

export class AudioPlayer {
  private audioCtx: AudioContext | null = null;
  private analyserNode: AnalyserNode | null = null;
  private nextStartTime: number = 0;
  private activeSources: Set<AudioBufferSourceNode> = new Set();
  private callbacks: AudioPlayerCallbacks;
  private isSpeaking: boolean = false;
  private volumeInterval: number | null = null;

  constructor(callbacks: AudioPlayerCallbacks = {}) {
    this.callbacks = callbacks;
  }

  public async init(): Promise<void> {
    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      // Output AudioContext (Web Audio API handles 24kHz buffer resampling automatically)
      this.audioCtx = new AudioCtx({ sampleRate: 24000 });
      this.analyserNode = this.audioCtx.createAnalyser();
      this.analyserNode.fftSize = 256;
      this.analyserNode.smoothingTimeConstant = 0.3;
      this.analyserNode.connect(this.audioCtx.destination);
      this.startVolumeMeter();
    }

    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }
  }

  public async playChunk(base64PCM: string): Promise<void> {
    await this.init();
    if (!this.audioCtx || !this.analyserNode) return;

    try {
      // Decode Base64 to ArrayBuffer
      const binaryString = window.atob(base64PCM);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // 16-bit PCM: 2 bytes per sample
      const int16Array = new Int16Array(bytes.buffer);
      const sampleCount = int16Array.length;

      // Convert Int16 to Float32 [-1.0, 1.0]
      const float32Array = new Float32Array(sampleCount);
      for (let i = 0; i < sampleCount; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }

      // Create 24kHz AudioBuffer
      const audioBuffer = this.audioCtx.createBuffer(1, sampleCount, 24000);
      audioBuffer.getChannelData(0).set(float32Array);

      // Create buffer source
      const source = this.audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.analyserNode);

      // Gapless scheduling
      const currentTime = this.audioCtx.currentTime;
      if (this.nextStartTime < currentTime) {
        this.nextStartTime = currentTime + 0.025; // 25ms jitter buffer
      }

      source.start(this.nextStartTime);
      this.nextStartTime += audioBuffer.duration;

      this.activeSources.add(source);

      if (!this.isSpeaking) {
        this.isSpeaking = true;
        if (this.callbacks.onPlaybackStarted) {
          this.callbacks.onPlaybackStarted();
        }
      }

      source.onended = () => {
        this.activeSources.delete(source);
        if (this.activeSources.size === 0) {
          this.isSpeaking = false;
          if (this.callbacks.onPlaybackEnded) {
            this.callbacks.onPlaybackEnded();
          }
          if (this.callbacks.onVolumeChange) {
            this.callbacks.onVolumeChange(0);
          }
        }
      };
    } catch (err: any) {
      console.error('AudioPlayer playChunk error:', err);
      if (this.callbacks.onError) {
        this.callbacks.onError(err instanceof Error ? err : new Error(String(err)));
      }
    }
  }

  public interrupt(): void {
    // Immediately halt all active audio chunks
    for (const source of this.activeSources) {
      try {
        source.stop();
        source.disconnect();
      } catch (e) {
        // already stopped
      }
    }

    this.activeSources.clear();
    this.nextStartTime = 0;

    if (this.isSpeaking) {
      this.isSpeaking = false;
      if (this.callbacks.onPlaybackInterrupted) {
        this.callbacks.onPlaybackInterrupted();
      }
      if (this.callbacks.onVolumeChange) {
        this.callbacks.onVolumeChange(0);
      }
    }
  }

  public stop(): void {
    this.interrupt();
    if (this.volumeInterval !== null) {
      window.clearInterval(this.volumeInterval);
      this.volumeInterval = null;
    }

    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyserNode;
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  private startVolumeMeter(): void {
    if (this.volumeInterval !== null) return;

    this.volumeInterval = window.setInterval(() => {
      if (!this.analyserNode || !this.isSpeaking) {
        if (this.callbacks.onVolumeChange) {
          this.callbacks.onVolumeChange(0);
        }
        return;
      }

      const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
      this.analyserNode.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const avg = sum / dataArray.length;
      const normalized = Math.min(1, Math.max(0, avg / 128));

      if (this.callbacks.onVolumeChange) {
        this.callbacks.onVolumeChange(normalized);
      }
    }, 40);
  }
}
