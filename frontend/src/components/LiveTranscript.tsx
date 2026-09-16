import React, { useEffect, useRef } from 'react';
import { MessageSquareText, Copy, Trash2, Check, Radio } from 'lucide-react';
import { Card } from './ui/Card';
import { IconButton } from './ui/IconButton';
import { Badge } from './ui/Badge';

interface LiveTranscriptProps {
  finalTranscripts: string[];
  partialTranscript: string;
  onClear: () => void;
  isListening: boolean;
  onManualTextSubmit?: (text: string) => void;
}

export const LiveTranscript: React.FC<LiveTranscriptProps> = ({
  finalTranscripts,
  partialTranscript,
  onClear,
  isListening,
  onManualTextSubmit,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);
  const [manualInput, setManualInput] = React.useState('');

  // Auto-scroll to bottom when new transcripts arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [finalTranscripts, partialTranscript]);

  const fullText = [...finalTranscripts, partialTranscript].filter(Boolean).join(' ');

  const handleCopy = () => {
    if (!fullText) return;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim() || !onManualTextSubmit) return;
    onManualTextSubmit(manualInput.trim());
    setManualInput('');
  };

  const wordCount = fullText.split(/\s+/).filter(Boolean).length;

  return (
    <Card
      tabColor="yellow"
      tabLabel="Live Speech Transcript"
      tabIcon={<MessageSquareText className="w-3.5 h-3.5" />}
      className="flex flex-col h-full"
    >
      {/* Header Controls */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b-3 border-black/10">
        <div className="flex items-center gap-2">
          {isListening ? (
            <Badge color="green" className="animate-pulse flex items-center gap-1">
              <Radio className="w-3 h-3 text-black" />
              Transcribing
            </Badge>
          ) : (
            <Badge color="gray">Mic Idle</Badge>
          )}
          <span className="text-xs font-bold text-gray-600">
            {wordCount} words spoken
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <IconButton
            icon={copied ? <Check className="w-4 h-4 text-neo-green" /> : <Copy className="w-4 h-4" />}
            tooltip="Copy transcript"
            onClick={handleCopy}
            disabled={!fullText}
          />
          <IconButton
            icon={<Trash2 className="w-4 h-4 text-neo-red" />}
            tooltip="Clear transcript"
            onClick={onClear}
            disabled={!fullText}
          />
        </div>
      </div>

      {/* Transcript Bubble Stream */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto pr-2 space-y-3 min-h-[160px] max-h-[260px]"
      >
        {finalTranscripts.length === 0 && !partialTranscript ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-black/30 rounded-xl bg-white/60">
            <MessageSquareText className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-sm font-bold text-gray-700">
              No speech recorded yet.
            </p>
            <p className="text-xs text-gray-500 max-w-xs mt-1">
              Click the yellow microphone button or type below to explain your algorithm out loud.
            </p>
          </div>
        ) : (
          <>
            {finalTranscripts.map((text, idx) => (
              <div
                key={idx}
                className="bg-white border-2 border-black rounded-[14px] p-3 shadow-neo-sm text-sm font-bold text-black leading-relaxed"
              >
                {text}
              </div>
            ))}

            {partialTranscript && (
              <div className="bg-neo-yellow/30 border-2 border-dashed border-black rounded-[14px] p-3 shadow-neo-sm text-sm font-bold text-black leading-relaxed flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-neo-yellow animate-ping" />
                <span>{partialTranscript}</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Manual write-in text fallback option */}
      {onManualTextSubmit && (
        <form onSubmit={handleManualSubmit} className="mt-3 pt-3 border-t-2 border-black/10 flex gap-2">
          <input
            type="text"
            placeholder="Or type reasoning manually and press Enter..."
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            className="flex-1 bg-white border-2 border-black rounded-xl px-3 py-1.5 text-xs font-bold text-black focus:outline-none focus:shadow-neo-sm"
          />
          <button
            type="submit"
            disabled={!manualInput.trim()}
            className="px-3 py-1.5 bg-cream-200 border-2 border-black rounded-xl text-xs font-black hover:bg-neo-yellow neo-pressable disabled:opacity-40"
          >
            Add
          </button>
        </form>
      )}
    </Card>
  );
};
