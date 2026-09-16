import React from 'react';
import { Mic, Timer, CheckCircle, AlertCircle, ChevronDown } from 'lucide-react';
import { Question } from '../types';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

interface NavbarProps {
  questions: Question[];
  currentQuestion: Question;
  onSelectQuestion: (q: Question) => void;
  secondsElapsed: number;
  isConnected: boolean;
  onOpenReport: () => void;
  canReview: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  questions,
  currentQuestion,
  onSelectQuestion,
  secondsElapsed,
  isConnected,
  onOpenReport,
  canReview,
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="relative z-30 mb-6">
      <div className="bg-cream-50 border-4 border-black rounded-[20px] shadow-neo px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-neo-yellow border-3 border-black rounded-[14px] shadow-neo-sm flex items-center justify-center">
            <Mic className="w-6 h-6 text-black" strokeWidth={3} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-black font-sans leading-none">
                CodeTalk
              </h1>
              <Badge color="yellow" className="uppercase font-black text-[10px]">
                Voice Agent
              </Badge>
            </div>
            <p className="text-xs font-bold text-gray-700 mt-1">
              Real-Time Technical Interview Simulator
            </p>
          </div>
        </div>

        {/* Center: Problem Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 bg-white border-3 border-black rounded-[16px] px-4 py-2 shadow-neo-sm hover:bg-cream-100 transition-all cursor-pointer font-bold text-sm"
          >
            <span className="text-gray-500 text-xs uppercase font-extrabold">Problem:</span>
            <span className="text-black font-extrabold">{currentQuestion.title}</span>
            <Badge
              color={currentQuestion.difficultyColor}
              className="text-[11px] font-black"
            >
              {currentQuestion.difficulty}
            </Badge>
            <ChevronDown className="w-4 h-4 text-black" strokeWidth={3} />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute top-full mt-2 left-0 w-72 bg-cream-50 border-4 border-black rounded-[18px] shadow-neo-lg z-50 p-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="text-xs font-black text-gray-500 uppercase px-3 py-1.5 border-b-2 border-black/10">
                Select Interview Question
              </div>
              <div className="max-h-64 overflow-y-auto mt-1 space-y-1">
                {questions.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => {
                      onSelectQuestion(q);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-bold flex items-center justify-between border-2 transition-all ${
                      q.id === currentQuestion.id
                        ? 'bg-neo-yellow border-black shadow-neo-sm text-black'
                        : 'border-transparent hover:bg-white hover:border-black/30 text-gray-800'
                    }`}
                  >
                    <span className="truncate pr-2">{q.title}</span>
                    <Badge color={q.difficultyColor} className="text-[10px] shrink-0">
                      {q.difficulty}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Timer & Actions */}
        <div className="flex items-center gap-3">
          {/* Timer Badge */}
          <div className="flex items-center gap-2 bg-cream-200 border-3 border-black px-3.5 py-1.5 rounded-[14px] shadow-neo-sm text-black font-black text-sm">
            <Timer className="w-4 h-4" strokeWidth={2.5} />
            <span className="tabular-nums font-mono">{formatTimer(secondsElapsed)}</span>
          </div>

          {/* WebSocket Status Indicator */}
          <div
            title={isConnected ? 'AssemblyAI WebSocket Active' : 'WebSocket Disconnected'}
            className="flex items-center gap-1.5 px-3 py-1.5 border-3 border-black rounded-[14px] text-xs font-black bg-white shadow-neo-sm"
          >
            {isConnected ? (
              <>
                <CheckCircle className="w-4 h-4 text-neo-green fill-neo-green/20" strokeWidth={3} />
                <span className="text-black hidden sm:inline">STT Active</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-neo-orange" strokeWidth={3} />
                <span className="text-black hidden sm:inline">Standby</span>
              </>
            )}
          </div>

          {/* Complete Interview Button */}
          <Button
            variant="warning"
            size="sm"
            onClick={onOpenReport}
            disabled={!canReview}
            className="hidden sm:inline-flex"
          >
            Complete & Review
          </Button>
        </div>
      </div>
    </header>
  );
};
