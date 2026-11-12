/**
 * Audio Engine for Courtroom Recording Playback
 * Plays original audio recording files with real audio output and waveform synchronisation.
 * No synthetic text-to-speech fallback.
 */

export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  volume: number;
}

export class CourtAudioEngine {
  private audioElement: HTMLAudioElement | null = null;
  private onTimeUpdateCallback: ((time: number) => void) | null = null;
  private onEndedCallback: (() => void) | null = null;
  private maxDuration = 300;
  private playbackRate = 1.0;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioElement = new Audio();
      this.audioElement.volume = 1.0;
      this.audioElement.muted = false;
      this.audioElement.setAttribute('playsinline', 'true');
      this.audioElement.addEventListener('timeupdate', () => {
        if (this.onTimeUpdateCallback && this.audioElement) {
          this.onTimeUpdateCallback(this.audioElement.currentTime);
        }
      });
      this.audioElement.addEventListener('ended', () => {
        if (this.onEndedCallback) {
          this.onEndedCallback();
        }
      });
    }
  }

  public loadSource(urlOrBlob: string | Blob, duration: number = 300) {
    this.stop();
    this.maxDuration = duration;

    if (this.audioElement) {
      if (typeof urlOrBlob === 'string' && urlOrBlob.startsWith('http')) {
        this.audioElement.src = urlOrBlob;
      } else if (urlOrBlob instanceof Blob) {
        this.audioElement.src = URL.createObjectURL(urlOrBlob);
      }
      this.audioElement.volume = 1.0;
      this.audioElement.muted = false;
      this.audioElement.load();
    }
  }

  public async play() {
    if (this.audioElement && this.audioElement.src) {
      try {
        this.audioElement.volume = 1.0;
        this.audioElement.muted = false;
        this.audioElement.playbackRate = this.playbackRate;
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          if (ctx.state === 'suspended') {
            await ctx.resume();
          }
        }
        await this.audioElement.play();
      } catch (e) {
        console.warn('Real audio playback error:', e);
      }
    }
  }

  public pause() {
    if (this.audioElement) {
      this.audioElement.pause();
    }
  }

  public stop() {
    this.pause();
    if (this.audioElement) {
      this.audioElement.currentTime = 0;
    }
    if (this.onTimeUpdateCallback) {
      this.onTimeUpdateCallback(0);
    }
  }

  public seek(seconds: number) {
    if (this.audioElement) {
      this.audioElement.currentTime = Math.max(0, Math.min(seconds, this.audioElement.duration || this.maxDuration));
    }
    if (this.onTimeUpdateCallback) {
      this.onTimeUpdateCallback(seconds);
    }
  }

  public setPlaybackRate(rate: number) {
    this.playbackRate = rate;
    if (this.audioElement) {
      this.audioElement.playbackRate = rate;
    }
  }

  public onTimeUpdate(cb: (time: number) => void) {
    this.onTimeUpdateCallback = cb;
  }

  public onEnded(cb: () => void) {
    this.onEndedCallback = cb;
  }
}

export function formatTimeSeconds(totalSec: number): string {
  if (isNaN(totalSec) || totalSec < 0) totalSec = 0;
  const mins = Math.floor(totalSec / 60);
  const secs = Math.floor(totalSec % 60);
  const hrs = Math.floor(mins / 60);
  const remainingMins = mins % 60;

  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${remainingMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
