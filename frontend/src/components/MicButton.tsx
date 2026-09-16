import React from 'react';
import { Mic, Volume2 } from 'lucide-react';

interface MicButtonProps {
  isRecording: boolean;
  onToggleRecording: () => void;
  audioLevel: number; // 0 to 100
  disabled?: boolean;
}

export const MicButton: React.FC<MicButtonProps> = ({
  isRecording,
  onToggleRecording,
  audioLevel,
  disabled = false,
}) => {
  // Generate 8 animated waveform bars based on audio level
  const bars = [0.3, 0.6, 0.9, 1.2, 1.0, 0.8, 0.5, 0.2];

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-cream-50 border-4 border-black rounded-[20px] shadow-neo">
      <div className="relative mb-3 flex items-center justify-center">
        {/* Pulsing ring when active */}
        {isRecording && (
          <span className="absolute w-24 h-24 rounded-full bg-neo-yellow/30 border-2 border-black animate-ping pointer-events-none" />
        )}

        {/* Primary Mic Button: Bold Yellow (#FFC107), Black Border, Black Icon */}
        <button
          onClick={onToggleRecording}
          disabled={disabled}
          title={isRecording ? 'Pause microphone' : 'Start speaking your approach out loud'}
          className={`relative z-10 w-20 h-20 rounded-[22px] border-4 border-black flex flex-col items-center justify-center transition-all select-none cursor-pointer neo-pressable ${
            isRecording
              ? 'bg-neo-yellow text-black shadow-none translate-x-[2px] translate-y-[2px] ring-4 ring-black/10'
              : 'bg-neo-yellow text-black hover:bg-yellow-400 shadow-neo'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isRecording ? (
            <Mic className="w-9 h-9 text-black animate-pulse" strokeWidth={3} />
          ) : (
            <Mic className="w-9 h-9 text-black" strokeWidth={3} />
          )}
        </button>
      </div>

      {/* Button Status Text */}
      <div className="text-center mb-2">
        <span className="text-sm font-black text-black tracking-wide block">
          {isRecording ? '🎙️ LISTENING (SPEAK NOW)' : '🎙️ CLICK TO START SPEAKING'}
        </span>
        <span className="text-xs font-bold text-gray-600">
          {isRecording
            ? 'Voice streamed live to AssemblyAI'
            : 'Explain your reasoning aloud like a real interview'}
        </span>
      </div>

      {/* Audio Level Equalizer Bars */}
      <div className="flex items-center gap-1.5 h-6 px-3 bg-white border-2 border-black rounded-lg shadow-neo-sm">
        <Volume2 className="w-3.5 h-3.5 text-black mr-1" strokeWidth={2.5} />
        {bars.map((mult, idx) => {
          const height = isRecording
            ? Math.max(4, Math.min(20, (audioLevel / 100) * 20 * mult))
            : 4;
          return (
            <div
              key={idx}
              style={{ height: `${height}px` }}
              className={`w-1.5 rounded-full transition-all duration-75 border border-black ${
                isRecording ? 'bg-neo-yellow' : 'bg-gray-300'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};
