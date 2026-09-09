/**
 * AudioStreamer
 * Captures microphone audio at 16kHz PCM16 and streams Base64 chunks.
 */

export interface AudioStreamerCallbacks {
  onAudioChunk: (base64PCM: string) => void;
  onVolumeChange?: (volume: number) => void;
  onError?: (err: Error) => void;
}

export class AudioStreamer {
  private audioCtx: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private processorNode: ScriptProcessorNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private isMuted: boolean = false;
  private isStreaming: boolean = false;
  private callbacks: AudioStreamerCallbacks;

  constructor(callbacks: AudioStreamerCallbacks) {
    this.callbacks = callbacks;
  }

  public async start(): Promise<void> {
    if (this.isStreaming) return;

    try {
      // 1. Request microphone permission
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // 2. Initialize AudioContext at 16kHz
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtx({ sampleRate: 16000 });

      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      // 3. Create audio graph
      this.sourceNode = this.audioCtx.createMediaStreamSource(this.mediaStream);
      this.analyserNode = this.audioCtx.createAnalyser();
      this.analyserNode.fftSize = 256;
      this.analyserNode.smoothingTimeConstant = 0.4;

      // 4096 samples at 16kHz is ~256ms chunk size, ideal for Live API latency
      this.processorNode = this.audioCtx.createScriptProcessor(4096, 1, 1);

      this.processorNode.onaudioprocess = (e: AudioProcessingEvent) => {
        if (!this.isStreaming) return;

        const channelData = e.inputBuffer.getChannelData(0);

        // Calculate RMS volume level
        let sum = 0;
        for (let i = 0; i < channelData.length; i++) {
          sum += channelData[i] * channelData[i];
        }
        const rms = Math.sqrt(sum / channelData.length);
        const normalizedVolume = Math.min(1, Math.max(0, rms * 5)); // scale for sensitivity
        if (this.callbacks.onVolumeChange) {
          this.callbacks.onVolumeChange(this.isMuted ? 0 : normalizedVolume);
        }

        // If muted, do not send audio data to the server
        if (this.isMuted) return;

        // Convert Float32 to 16-bit PCM little-endian
        const pcmBuffer = this.floatTo16BitPCM(channelData);
        const base64Audio = this.arrayBufferToBase64(pcmBuffer);

        this.callbacks.onAudioChunk(base64Audio);
      };

      // Connect nodes
      this.sourceNode.connect(this.analyserNode);
      this.analyserNode.connect(this.processorNode);
      this.processorNode.connect(this.audioCtx.destination);

      this.isStreaming = true;
    } catch (err: any) {
      this.stop();
      if (this.callbacks.onError) {
        this.callbacks.onError(err instanceof Error ? err : new Error(String(err)));
      }
      throw err;
    }
  }

  public stop(): void {
    this.isStreaming = false;

    if (this.processorNode) {
      this.processorNode.disconnect();
      this.processorNode.onaudioprocess = null;
      this.processorNode = null;
    }

    if (this.analyserNode) {
      this.analyserNode.disconnect();
      this.analyserNode = null;
    }

    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }

    if (this.callbacks.onVolumeChange) {
      this.callbacks.onVolumeChange(0);
    }
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.callbacks.onVolumeChange && muted) {
      this.callbacks.onVolumeChange(0);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyserNode;
  }

  public isActive(): boolean {
    return this.isStreaming;
  }

  private floatTo16BitPCM(input: Float32Array): ArrayBuffer {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return output.buffer;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
}
