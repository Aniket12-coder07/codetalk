import React, { useState, useEffect } from 'react';
import { X, Activity, Server, Radio, Cpu, CheckCircle2, AlertCircle, RefreshCw, Volume2, Mic, Play } from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

interface DiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  backendUrl: string;
  wsUrl: string;
  backendStatus: 'online' | 'streaming' | 'offline' | 'checking';
  onPingBackend: () => Promise<void>;
  onSimulateVoice: () => void;
  onToggleRecording: () => void;
  isRecording: boolean;
  audioLevel: number;
}

export const DiagnosticsModal: React.FC<DiagnosticsModalProps> = ({
  isOpen,
  onClose,
  backendUrl,
  wsUrl,
  backendStatus,
  onPingBackend,
  onSimulateVoice,
  onToggleRecording,
  isRecording,
  audioLevel,
}) => {
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<string | null>(null);
  const [latency, setLatency] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      handlePing();
    }
  }, [isOpen]);

  const handlePing = async () => {
    setIsPinging(true);
    const start = performance.now();
    try {
      await onPingBackend();
      const end = performance.now();
      setLatency(Math.round(end - start));
      setPingResult('Backend responded successfully (HTTP 200 OK)');
    } catch {
      setLatency(null);
      setPingResult('Unable to reach backend server. Check if task is running.');
    } finally {
      setIsPinging(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-cream-50 dark:bg-[#121215] border-4 border-black dark:border-white/90 rounded-[24px] shadow-neo-xl dark:shadow-[8px_8px_0px_0px_#000000] p-6 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-10 h-10 bg-white dark:bg-zinc-800 border-3 border-black dark:border-white/80 rounded-[14px] shadow-neo-sm flex items-center justify-center hover:bg-cream-100 dark:hover:bg-zinc-700 neo-pressable cursor-pointer"
        >
          <X className="w-5 h-5 text-black dark:text-white" strokeWidth={3} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b-4 border-black/10 dark:border-white/10">
          <div className="w-12 h-12 rounded-[16px] bg-neo-yellow border-3 border-black flex items-center justify-center shadow-neo-sm">
            <Activity className="w-6 h-6 text-black" strokeWidth={3} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-black dark:text-white font-sans">
                System & Engine Health
              </h2>
              <Badge
                color={backendStatus === 'online' || backendStatus === 'streaming' ? 'green' : 'orange'}
                className="uppercase text-[10px]"
              >
                {backendStatus}
              </Badge>
            </div>
            <p className="text-xs font-bold text-gray-600 dark:text-zinc-400 mt-0.5">
              CodeTalk Voice Pipeline Diagnostics
            </p>
          </div>
        </div>

        {/* Services Status Cards */}
        <div className="space-y-3 mb-6">
          {/* Backend Card */}
          <div className="bg-white dark:bg-zinc-800/90 border-3 border-black dark:border-white/80 rounded-[16px] p-3.5 shadow-neo-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-neo-blue/20 border-2 border-black dark:border-white/80 flex items-center justify-center">
                <Server className="w-4 h-4 text-neo-blue" />
              </div>
              <div>
                <span className="text-xs font-black text-black dark:text-white block">
                  FastAPI Backend Server
                </span>
                <span className="text-[11px] font-mono text-gray-500 dark:text-zinc-400">
                  {backendUrl} {latency !== null && `(${latency}ms)`}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {backendStatus === 'offline' ? (
                <span className="flex items-center gap-1 text-xs font-black text-neo-red">
                  <AlertCircle className="w-4 h-4" /> Offline
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-black text-neo-green">
                  <CheckCircle2 className="w-4 h-4" /> Connected
                </span>
              )}
            </div>
          </div>

          {/* AssemblyAI STT Card */}
          <div className="bg-white dark:bg-zinc-800/90 border-3 border-black dark:border-white/80 rounded-[16px] p-3.5 shadow-neo-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-neo-yellow/30 border-2 border-black dark:border-white/80 flex items-center justify-center">
                <Radio className="w-4 h-4 text-black dark:text-white" />
              </div>
              <div>
                <span className="text-xs font-black text-black dark:text-white block">
                  AssemblyAI Universal Streaming v3
                </span>
                <span className="text-[11px] font-mono text-gray-500 dark:text-zinc-400 truncate max-w-[200px] block">
                  {wsUrl}
                </span>
              </div>
            </div>
            <Badge color="yellow" className="text-[10px]">
              Ready (16kHz PCM)
            </Badge>
          </div>

          {/* Reasoning Engine Card */}
          <div className="bg-white dark:bg-zinc-800/90 border-3 border-black dark:border-white/80 rounded-[16px] p-3.5 shadow-neo-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-neo-purple/20 border-2 border-black dark:border-white/80 flex items-center justify-center">
                <Cpu className="w-4 h-4 text-neo-purple" />
              </div>
              <div>
                <span className="text-xs font-black text-black dark:text-white block">
                  LangChain + Claude AI Interviewer
                </span>
                <span className="text-[11px] font-mono text-gray-500 dark:text-zinc-400">
                  Rigorous Rubric & Efficiency Evaluator
                </span>
              </div>
            </div>
            <Badge color="purple" className="text-[10px]">
              Online
            </Badge>
          </div>
        </div>

        {/* Live Audio Microphone Status */}
        <div className="bg-cream-100 dark:bg-zinc-900 border-3 border-black dark:border-white/80 rounded-[18px] p-4 shadow-neo-sm mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase text-black dark:text-white flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-neo-orange" />
              Microphone Stream Monitor
            </span>
            <Badge color={isRecording ? 'green' : 'gray'} className="text-[10px]">
              {isRecording ? 'Streaming Active' : 'Standby / Idle'}
            </Badge>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <div className="flex-1 bg-white dark:bg-zinc-800 border-2 border-black dark:border-white/80 rounded-full h-3 overflow-hidden p-0.5">
              <div
                style={{ width: `${audioLevel}%` }}
                className="h-full bg-neo-yellow border-r-2 border-black rounded-full transition-all duration-75"
              />
            </div>
            <span className="font-mono text-xs font-bold text-black dark:text-white shrink-0">
              {audioLevel}% Vol
            </span>
          </div>

          <p className="text-[11px] font-bold text-gray-600 dark:text-zinc-400 mt-2">
            {isRecording
              ? 'Microphone is streaming 16kHz PCM chunks live to AssemblyAI.'
              : 'Microphone is on standby. Click "Start Speaking" or use the quick actions below to test.'}
          </p>
        </div>

        {/* Quick Diagnostics Actions */}
        <div className="space-y-2 mb-6">
          <span className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-zinc-400 block mb-1">
            Interactive Test Actions:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Ping Button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePing}
              disabled={isPinging}
              className="flex items-center gap-1.5 w-full justify-center"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
              <span>Ping Server ({latency ? `${latency}ms` : 'Check'})</span>
            </Button>

            {/* Toggle Mic Stream */}
            <Button
              variant={isRecording ? 'warning' : 'primary'}
              size="sm"
              onClick={onToggleRecording}
              className="flex items-center gap-1.5 w-full justify-center"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>{isRecording ? 'Stop Voice Stream' : 'Test Microphone'}</span>
            </Button>
          </div>

          {/* Simulate Voice shortcut */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onSimulateVoice();
              onClose();
            }}
            className="flex items-center gap-1.5 w-full justify-center mt-2 border-2 border-dashed border-black dark:border-white/60 bg-white dark:bg-zinc-800 text-black dark:text-white"
          >
            <Play className="w-3.5 h-3.5 text-neo-green fill-neo-green/30" />
            <span>Simulate Candidate Voice Input (Zero-Mic Demo)</span>
          </Button>
        </div>

        {/* Footer info message */}
        {pingResult && (
          <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 border-2 border-black dark:border-white/80 text-xs font-bold text-gray-700 dark:text-zinc-300">
            {pingResult}
          </div>
        )}
      </div>
    </div>
  );
};
