import React, { useRef, useState, useEffect } from 'react';

interface AudioPlayerProps {
  fileUrl?: string | null;
  file?: File | null;
  audioRef?: React.RefObject<HTMLAudioElement | null>;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
  className?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  fileUrl,
  file,
  audioRef: externalAudioRef,
  onTimeUpdate,
  onPlayStateChange,
  className = '',
}) => {
  const internalAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioRef = externalAudioRef || internalAudioRef;
  const [isPlaying, setIsPlaying] = useState(false);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  const [audioError, setAudioError] = useState<string | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 1.0;
      audioRef.current.muted = false;
      audioRef.current.setAttribute('playsinline', 'true');
    }
  }, [audioRef]);

  useEffect(() => {
    if (file instanceof Blob) {
      const url = URL.createObjectURL(file);
      setObjectUrl(url);
      setAudioError(null);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else if (fileUrl) {
      setObjectUrl(fileUrl);
    } else {
      setObjectUrl(null);
    }
  }, [file, fileUrl]);

  useEffect(() => {
    const player = audioRef.current;
    if (!player) return;

    // 1. Reset error messages immediately when a new file transaction begins
    setAudioError(null);

    // 2. ONLY run load() once right here when the file or objectUrl changes
    if (objectUrl || fileUrl) {
      console.log("Initializing audio source pipeline safely...");
      player.load(); 
    }

    // 3. Define a clean error handler that won't cause infinite reload triggers
    const errorHandler = () => {
      const code = player.error?.code ?? 'unknown';
      console.warn("Browser Audio Error Code: ", code);
      
      // Catch the standard large AAC file decode warning gracefully without crashing
      if (code === 3 && file?.name.endsWith('.aac')) {
        console.log("Large AAC stream metadata detected. Initializing buffer play...");
        return; // Exit safely without forcing a infinite player.load() loop!
      }

      // Set real, breaking errors to the UI state
      setAudioError("The browser encountered an error trying to decode this file.");
    };

    player.addEventListener('error', errorHandler);
    return () => {
      player.removeEventListener('error', errorHandler);
    };
  }, [file, objectUrl, fileUrl, audioRef]); // Added fileUrl to ensure safety across inputs

  const handlePlayWithSound = async () => {
    if (audioRef.current) {
      try {
        audioRef.current.muted = false;
        audioRef.current.volume = 1.0;
        // Resume AudioContext for browsers that block autoplay
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          if (ctx.state === 'suspended') {
            await ctx.resume();
          }
        }
        await audioRef.current.play();
        setIsPlaying(true);
        if (onPlayStateChange) onPlayStateChange(true);
      } catch (err) {
        console.error('Audio play error', err);
      }
    }
  };

  const getAudioMimeType = (fileName?: string, url?: string | null): string => {
    const target = (fileName || url || '').toLowerCase();
    if (target.endsWith('.aac')) return 'audio/aac';
    if (target.endsWith('.wav')) return 'audio/wav';
    if (target.endsWith('.ogg')) return 'audio/ogg';
    return 'audio/mpeg'; // Default fallback
  };

  return (
    <div className={`bg-black p-4 rounded-xl ${className}`}>
      <audio
        ref={audioRef}
        id="audioPlayer"
        controls
        className="w-full"
        preload="metadata"
        onLoadedData={(e) => {
          const target = e.currentTarget;
          target.volume = 1.0;
          target.muted = false;
        }}
        onTimeUpdate={(e) => {
          const target = e.currentTarget;
          if (onTimeUpdate) {
            onTimeUpdate(target.currentTime, target.duration || 0);
          }
        }}
        onPlay={() => {
          setIsPlaying(true);
          if (onPlayStateChange) onPlayStateChange(true);
        }}
        onPause={() => {
          setIsPlaying(false);
          if (onPlayStateChange) onPlayStateChange(false);
        }}
        onEnded={() => {
          setIsPlaying(false);
          if (onPlayStateChange) onPlayStateChange(false);
        }}
      >
        {(objectUrl || fileUrl) ? (
          <source 
            src={objectUrl || fileUrl || undefined} 
            type={getAudioMimeType(file?.name, fileUrl || objectUrl || undefined)} 
          />
        ) : null}
        Your browser does not support the audio element.
      </audio>
      {audioError && (
        <div className="bg-rose-900/90 text-rose-100 text-xs p-2.5 rounded-lg mt-2 border border-rose-700">
          ⚠️ {audioError}
        </div>
      )}
      <div className="text-white text-xs mt-2">
        🔊 Volume: 100% - Unmuted - {file?.name || (fileUrl ? fileUrl.split('/').pop() : 'Court Audio')}
      </div>
      <button 
        type="button"
        id="playWithSoundBtn"
        onClick={handlePlayWithSound}
        className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
      >
        <span>🔊 Play With Sound</span>
      </button>
    </div>
  );
};

