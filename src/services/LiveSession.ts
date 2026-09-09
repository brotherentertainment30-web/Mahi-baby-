import { AudioStreamer } from './AudioStreamer';
import { AudioPlayer } from './AudioPlayer';
import { LiveConnectionState, PersonalityVoice, ToolCallAction } from '../types';

export interface LiveSessionCallbacks {
  onStateChange: (state: LiveConnectionState) => void;
  onToolCall: (action: ToolCallAction) => void;
  onVolumeChange: (inputVol: number, outputVol: number) => void;
  onError: (errorMsg: string) => void;
  onToast: (msg: string, tone?: string) => void;
}

export class LiveSession {
  private ws: WebSocket | null = null;
  private streamer: AudioStreamer | null = null;
  private player: AudioPlayer | null = null;
  private state: LiveConnectionState = 'disconnected';
  private voice: PersonalityVoice = 'Aoede';
  private callbacks: LiveSessionCallbacks;

  private inputVolume: number = 0;
  private outputVolume: number = 0;

  constructor(callbacks: LiveSessionCallbacks) {
    this.callbacks = callbacks;
  }

  public getState(): LiveConnectionState {
    return this.state;
  }

  public async connect(selectedVoice: PersonalityVoice = 'Aoede'): Promise<void> {
    if (this.state === 'connecting' || this.state === 'listening' || this.state === 'speaking') {
      return;
    }

    this.voice = selectedVoice;
    this.setState('connecting');

    try {
      // 1. Initialize Audio Player
      this.player = new AudioPlayer({
        onPlaybackStarted: () => {
          if (this.state !== 'disconnected') {
            this.setState('speaking');
          }
        },
        onPlaybackEnded: () => {
          if (this.state !== 'disconnected') {
            this.setState('listening');
          }
        },
        onPlaybackInterrupted: () => {
          if (this.state !== 'disconnected') {
            this.setState('listening');
          }
        },
        onVolumeChange: (vol) => {
          this.outputVolume = vol;
          this.notifyVolume();
        },
        onError: (err) => {
          console.error('AudioPlayer error:', err);
        },
      });
      await this.player.init();

      // 2. Initialize Audio Streamer (mic)
      this.streamer = new AudioStreamer({
        onAudioChunk: (base64Audio) => {
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'audio', audio: base64Audio }));
          }
        },
        onVolumeChange: (vol) => {
          this.inputVolume = vol;
          this.notifyVolume();
        },
        onError: (err) => {
          console.error('AudioStreamer error:', err);
          this.callbacks.onError(err.message || 'Microphone access denied or error');
          this.disconnect();
        },
      });
      await this.streamer.start();

      // 3. Open WebSocket to server
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/live?voice=${encodeURIComponent(this.voice)}`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('Connected to Mahi Live WS server');
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === 'session_ready') {
            this.setState('listening');
          } else if (msg.type === 'audio' && msg.audio) {
            this.player?.playChunk(msg.audio);
          } else if (msg.type === 'interrupted') {
            console.log('Interruption signal received from server');
            this.player?.interrupt();
            this.setState('listening');
          } else if (msg.type === 'turn_complete') {
            // Turn completed
          } else if (msg.type === 'tool_call' && msg.call) {
            this.handleIncomingToolCall(msg.call);
          } else if (msg.type === 'error') {
            console.error('Server error message:', msg.error);
            this.callbacks.onError(msg.error || 'Live session error');
          } else if (msg.type === 'session_closed') {
            this.disconnect();
          }
        } catch (e) {
          console.error('Error parsing WS message:', e);
        }
      };

      this.ws.onerror = (e) => {
        console.error('Live WS error:', e);
        this.callbacks.onError('WebSocket connection error.');
        this.disconnect();
      };

      this.ws.onclose = () => {
        console.log('Live WS closed');
        this.disconnect();
      };
    } catch (err: any) {
      console.error('LiveSession connect failed:', err);
      this.callbacks.onError(err.message || 'Failed to start Live session');
      this.disconnect();
    }
  }

  public disconnect(): void {
    if (this.state === 'disconnected') return;

    this.setState('disconnected');

    if (this.streamer) {
      this.streamer.stop();
      this.streamer = null;
    }

    if (this.player) {
      this.player.stop();
      this.player = null;
    }

    if (this.ws) {
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.close();
      this.ws = null;
    }

    this.inputVolume = 0;
    this.outputVolume = 0;
    this.notifyVolume();
  }

  public interrupt(): void {
    this.player?.interrupt();
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'interrupt' }));
    }
    if (this.state === 'speaking') {
      this.setState('listening');
    }
  }

  public setMuted(muted: boolean): void {
    this.streamer?.setMuted(muted);
  }

  public isMuted(): boolean {
    return this.streamer?.getMuted() ?? false;
  }

  public getMicAnalyser(): AnalyserNode | null {
    return this.streamer?.getAnalyser() ?? null;
  }

  public getSpeakerAnalyser(): AnalyserNode | null {
    return this.player?.getAnalyser() ?? null;
  }

  private handleIncomingToolCall(call: { id: string; name: string; args: Record<string, any> }): void {
    const action: ToolCallAction = {
      id: call.id,
      name: call.name,
      args: call.args || {},
      timestamp: Date.now(),
    };

    // Execute browser actions
    if (call.name === 'openWebsite') {
      const url = call.args?.url;
      if (url) {
        try {
          window.open(url, '_blank');
        } catch (e) {
          console.warn('Popup blocked or error opening URL:', e);
        }
      }
    } else if (call.name === 'searchWeb') {
      const query = call.args?.query;
      if (query) {
        try {
          window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
        } catch (e) {
          console.warn('Popup blocked or error searching:', e);
        }
      }
    } else if (call.name === 'showToast') {
      if (call.args?.message) {
        this.callbacks.onToast(call.args.message, call.args.tone);
      }
    }

    // Pass to UI for visual cards and reactions
    this.callbacks.onToolCall(action);
  }

  private setState(newState: LiveConnectionState): void {
    if (this.state !== newState) {
      this.state = newState;
      this.callbacks.onStateChange(newState);
    }
  }

  private notifyVolume(): void {
    this.callbacks.onVolumeChange(this.inputVolume, this.outputVolume);
  }
}
