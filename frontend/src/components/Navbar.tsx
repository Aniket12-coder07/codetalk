import React, { useState } from 'react';
import { Mic, Timer, CheckCircle, AlertCircle, ChevronDown, Radio, Sun, Moon, Search } from 'lucide-react';
import { Question, Difficulty } from '../types';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

interface NavbarProps {
  questions: Question[];
  currentQuestion: Question;
  onSelectQuestion: (q: Question) => void;
  secondsElapsed: number;
  isConnected: boolean;
  backendStatus: 'online' | 'streaming' | 'offline' | 'checking';
  onOpenDiagnostics: () => void;
  onOpenReport: () => void;
  canReview: boolean;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  questions,
  currentQuestion,
  onSelectQuestion,
  secondsElapsed,
  isConnected,
  backendStatus,
  onOpenDiagnostics,
  onOpenReport,
  canReview,
  isDarkMode,
  onToggleTheme,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'All' | Difficulty>('All');

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Filter questions based on search & difficulty
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.companyTags && q.companyTags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesDifficulty =
      selectedDifficulty === 'All' || q.difficulty === selectedDifficulty;

    return matchesSearch && matchesDifficulty;
  });

  return (
    <header className="relative z-30 mb-6">
      <div className="bg-cream-50 dark:bg-[#18181c] border-4 border-black dark:border-white/80 rounded-[20px] shadow-neo dark:shadow-[4px_4px_0px_0px_#000000] px-6 py-4 flex flex-wrap items-center justify-between gap-4 transition-colors duration-200">
        {/* Left: Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-neo-yellow border-3 border-black dark:border-white/80 rounded-[14px] shadow-neo-sm flex items-center justify-center">
            <Mic className="w-6 h-6 text-black" strokeWidth={3} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-black dark:text-white font-sans leading-none">
                CodeTalk
              </h1>
              <Badge color="yellow" className="uppercase font-black text-[10px]">
                Voice Agent
              </Badge>
            </div>
            <p className="text-xs font-bold text-gray-700 dark:text-zinc-400 mt-1">
              Real-Time Technical Interview Simulator
            </p>
          </div>
        </div>

        {/* Center: Problem Selector Dropdown with Search & Filters */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 bg-white dark:bg-zinc-800 border-3 border-black dark:border-white/80 rounded-[16px] px-4 py-2 shadow-neo-sm hover:bg-cream-100 dark:hover:bg-zinc-700 transition-all cursor-pointer font-bold text-sm text-black dark:text-white"
          >
            <span className="text-gray-500 dark:text-zinc-400 text-xs uppercase font-extrabold">Problem:</span>
            <span className="font-extrabold truncate max-w-[180px] sm:max-w-[240px] text-left">
              {currentQuestion.title}
            </span>
            <Badge
              color={currentQuestion.difficultyColor}
              className="text-[11px] font-black shrink-0"
            >
              {currentQuestion.difficulty}
            </Badge>
            <ChevronDown className="w-4 h-4 text-black dark:text-white shrink-0" strokeWidth={3} />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute top-full mt-2 left-0 w-80 sm:w-96 bg-cream-50 dark:bg-[#18181c] border-4 border-black dark:border-white/80 rounded-[18px] shadow-neo-lg dark:shadow-[6px_6px_0px_0px_#000000] z-50 p-3 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2 border-b-2 border-black/10 dark:border-white/10 mb-2">
                <span className="text-xs font-black text-gray-600 dark:text-zinc-400 uppercase">
                  Select Problem ({questions.length} Industry Questions)
                </span>
                <button
                  onClick={() => setDropdownOpen(false)}
                  className="text-xs font-bold text-gray-500 hover:text-black dark:hover:text-white"
                >
                  Close ✕
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-500 dark:text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search problem, company, or topic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-800 border-2 border-black dark:border-white/80 rounded-xl pl-8 pr-3 py-1.5 text-xs font-bold text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none"
                />
              </div>

              {/* Difficulty Filter Chips with Counts */}
              <div className="flex items-center gap-1.5 mb-2 pb-2 border-b-2 border-black/10 dark:border-white/10 overflow-x-auto">
                {(['All', 'Easy', 'Medium', 'Hard'] as const).map((diff) => {
                  const count = diff === 'All' ? questions.length : questions.filter((q) => q.difficulty === diff).length;
                  return (
                    <button
                      key={diff}
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`px-2.5 py-0.5 text-[10px] font-black rounded-lg border-2 transition-all flex items-center gap-1 ${
                        selectedDifficulty === diff
                          ? 'bg-neo-yellow border-black dark:border-white text-black shadow-neo-sm'
                          : 'border-transparent text-gray-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800'
                      }`}
                    >
                      <span>{diff}</span>
                      <span className="opacity-70 text-[9px]">({count})</span>
                    </button>
                  );
                })}
              </div>

              {/* Problem List */}
              <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
                {filteredQuestions.length === 0 ? (
                  <div className="text-center py-6 text-xs font-bold text-gray-500 dark:text-zinc-400">
                    No questions match your filter.
                  </div>
                ) : (
                  filteredQuestions.map((q) => (
                    <button
                      key={q.id}
                      onClick={() => {
                        onSelectQuestion(q);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex flex-col gap-1 border-2 transition-all cursor-pointer ${
                        q.id === currentQuestion.id
                          ? 'bg-neo-yellow border-black dark:border-white shadow-neo-sm text-black'
                          : 'border-transparent hover:bg-white dark:hover:bg-zinc-800 hover:border-black/30 dark:hover:border-white/30 text-gray-800 dark:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-extrabold truncate pr-2">{q.title}</span>
                        <Badge color={q.difficultyColor} className="text-[10px] shrink-0">
                          {q.difficulty}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-zinc-400">
                        <span className="font-mono">{q.category}</span>
                        {q.companyTags && q.companyTags.length > 0 && (
                          <span className="truncate">
                            • {q.companyTags.slice(0, 2).join(', ')}
                          </span>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Theme Toggle, Timer, Interactive Status Indicator, & Complete */}
        <div className="flex items-center gap-2.5">
          {/* Dark / Light Mode Toggle Button */}
          <button
            onClick={onToggleTheme}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="w-10 h-10 rounded-[14px] bg-white dark:bg-zinc-800 border-3 border-black dark:border-white/80 flex items-center justify-center shadow-neo-sm hover:bg-cream-100 dark:hover:bg-zinc-700 neo-pressable cursor-pointer text-black dark:text-white"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-neo-yellow" strokeWidth={2.5} />
            ) : (
              <Moon className="w-5 h-5 text-neo-purple" strokeWidth={2.5} />
            )}
          </button>

          {/* Timer Badge */}
          <div className="flex items-center gap-2 bg-cream-200 dark:bg-zinc-800 border-3 border-black dark:border-white/80 px-3 py-1.5 rounded-[14px] shadow-neo-sm text-black dark:text-white font-black text-xs">
            <Timer className="w-3.5 h-3.5" strokeWidth={2.5} />
            <span className="tabular-nums font-mono">{formatTimer(secondsElapsed)}</span>
          </div>

          {/* Interactive Connection & Health Badge ("Standby" Fix) */}
          <button
            onClick={onOpenDiagnostics}
            title="Click to open Voice Pipeline & Engine Diagnostics"
            className={`flex items-center gap-1.5 px-3 py-1.5 border-3 border-black dark:border-white/80 rounded-[14px] text-xs font-black shadow-neo-sm neo-pressable cursor-pointer transition-all ${
              isConnected
                ? 'bg-neo-yellow text-black'
                : backendStatus === 'online'
                ? 'bg-white dark:bg-zinc-800 text-black dark:text-white'
                : 'bg-neo-red/20 text-neo-red border-neo-red'
            }`}
          >
            {isConnected ? (
              <>
                <Radio className="w-3.5 h-3.5 text-black animate-pulse" strokeWidth={3} />
                <span className="hidden sm:inline">Streaming Live</span>
              </>
            ) : backendStatus === 'online' ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-neo-green fill-neo-green/20" strokeWidth={3} />
                <span className="hidden sm:inline">Ready (AssemblyAI Live)</span>
                <span className="sm:hidden">Ready</span>
              </>
            ) : backendStatus === 'checking' ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-neo-yellow animate-ping" />
                <span className="hidden sm:inline">Connecting...</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-neo-red" strokeWidth={3} />
                <span className="hidden sm:inline">Offline (Click to Check)</span>
                <span className="sm:hidden">Offline</span>
              </>
            )}
          </button>

          {/* Complete Interview Button */}
          <Button
            variant="warning"
            size="sm"
            onClick={onOpenReport}
            disabled={!canReview}
            className="hidden md:inline-flex"
          >
            Complete & Review
          </Button>
        </div>
      </div>
    </header>
  );
};
