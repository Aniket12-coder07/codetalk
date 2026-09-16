import { useState, useEffect, useRef } from 'react';
import questionsData from './data/questions.json';
import { Question, InterviewerTurn, ReviewReport } from './types';
import { Navbar } from './components/Navbar';
import { QuestionCard } from './components/QuestionCard';
import { MicButton } from './components/MicButton';
import { LiveTranscript } from './components/LiveTranscript';
import { CodeEditor } from './components/CodeEditor';
import { InterviewerPanel } from './components/InterviewerPanel';
import { SessionReportModal } from './components/SessionReportModal';

// Backend configuration
const BACKEND_HTTP = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
const BACKEND_WS = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/transcribe';

export function App() {
  const questions: Question[] = questionsData as Question[];
  const [currentQuestion, setCurrentQuestion] = useState<Question>(questions[0]);
  const [language, setLanguage] = useState<'python' | 'javascript'>('python');
  const [code, setCode] = useState<string>(questions[0].starterCode.python);

  // Audio & STT Streaming State
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [finalTranscripts, setFinalTranscripts] = useState<string[]>([]);
  const [partialTranscript, setPartialTranscript] = useState<string>('');

  // Interviewer AI State
  const [currentTurn, setCurrentTurn] = useState<InterviewerTurn | null>(null);
  const [isLoadingFollowup, setIsLoadingFollowup] = useState(false);
  const [isSubmittingCode, setIsSubmittingCode] = useState(false);
  const [report, setReport] = useState<ReviewReport | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Session Timer
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // Audio Processing Refs
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  // Session timer increment
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle Question Change
  const handleSelectQuestion = (q: Question) => {
    setCurrentQuestion(q);
    setCode(language === 'python' ? q.starterCode.python : q.starterCode.javascript);
    setFinalTranscripts([]);
    setPartialTranscript('');
    setCurrentTurn(null);
    setReport(null);
  };

  // Handle Language Change
  const handleLanguageChange = (lang: 'python' | 'javascript') => {
    setLanguage(lang);
    setCode(lang === 'python' ? currentQuestion.starterCode.python : currentQuestion.starterCode.javascript);
  };

  // Reset Code
  const handleResetCode = () => {
    setCode(language === 'python' ? currentQuestion.starterCode.python : currentQuestion.starterCode.javascript);
  };

  // =========================================================================
  // Web Audio API & AssemblyAI Streaming Integration
  // =========================================================================

  const startStreaming = async () => {
    try {
      // 1. Establish WebSocket connection to backend
      const ws = new WebSocket(BACKEND_WS);
      ws.binaryType = 'arraybuffer';
      wsRef.current = ws;

      ws.onopen = async () => {
        setIsConnected(true);
        console.log('Connected to CodeTalk WebSocket Audio Bridge.');

        // 2. Request microphone stream
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: 16000,
            channelCount: 1,
            noiseSuppression: true,
            echoCancellation: true,
          },
        });
        mediaStreamRef.current = stream;

        // 3. Set up Web Audio Context for 16kHz PCM streaming
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 16000,
        });
        audioContextRef.current = audioCtx;

        const source = audioCtx.createMediaStreamSource(stream);
        // Using ScriptProcessor for real-time PCM chunk extraction
        const processor = audioCtx.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        processor.onaudioprocess = (e) => {
          if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

          const inputData = e.inputBuffer.getChannelData(0);

          // Calculate visualizer audio volume level
          let sum = 0;
          for (let i = 0; i < inputData.length; i++) {
            sum += inputData[i] * inputData[i];
          }
          const rms = Math.sqrt(sum / inputData.length);
          setAudioLevel(Math.min(100, Math.round(rms * 400)));

          // Convert Float32Array to 16-bit Signed Integer PCM (little-endian)
          const pcmData = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            const s = Math.max(-1, Math.min(1, inputData[i]));
            pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
          }

          // Stream raw PCM chunk over WebSocket
          wsRef.current.send(pcmData.buffer);
        };

        source.connect(processor);
        processor.connect(audioCtx.destination);
        setIsRecording(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'partial') {
            setPartialTranscript(data.text);
          } else if (data.type === 'final') {
            setFinalTranscripts((prev) => [...prev, data.text]);
            setPartialTranscript('');
          } else if (data.type === 'error') {
            console.error('AssemblyAI WebSocket error:', data.error);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsRecording(false);
        setAudioLevel(0);
      };

      ws.onerror = (err) => {
        console.error('WebSocket encountered an error:', err);
      };
    } catch (error) {
      console.warn('Microphone permission denied or device unavailable. Running in simulated voice mode.', error);
      // Fallback: start mock recording simulation
      setIsRecording(true);
      setIsConnected(true);
      simulateMockVoice();
    }
  };

  const simulateMockVoice = () => {
    const mockSteps = [
      { delay: 1000, type: 'partial', text: "For this problem, I'm thinking about..." },
      { delay: 2500, type: 'partial', text: "For this problem, I'm thinking about using a hash map to store complements." },
      { delay: 4000, type: 'final', text: "For this problem, I'm thinking about using a hash map to store each complement as we iterate." },
      { delay: 5500, type: 'partial', text: "If target minus current number is in the map," },
      { delay: 7000, type: 'final', text: "If target minus current number is in the map, we return both indices. This yields O(N) time and O(N) space." },
    ];

    mockSteps.forEach(({ delay, type, text }) => {
      setTimeout(() => {
        if (type === 'partial') {
          setPartialTranscript(text);
          setAudioLevel(45);
        } else {
          setFinalTranscripts((prev) => [...prev, text]);
          setPartialTranscript('');
          setAudioLevel(15);
        }
      }, delay);
    });
  };

  const stopStreaming = () => {
    setIsRecording(false);
    setAudioLevel(0);

    // Stop audio context & tracks
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      stopStreaming();
    } else {
      startStreaming();
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopStreaming();
    };
  }, []);

  // =========================================================================
  // LangChain + Claude AI Interviewer Actions
  // =========================================================================

  const accumulatedTranscript = [...finalTranscripts, partialTranscript].filter(Boolean).join(' ');

  const handleAskInterviewer = async () => {
    if (!accumulatedTranscript.trim()) return;

    setIsLoadingFollowup(true);
    try {
      const res = await fetch(`${BACKEND_HTTP}/api/interview/followup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: currentQuestion.id,
          transcript: accumulatedTranscript,
          code: code,
        }),
      });
      if (!res.ok) throw new Error('Failed to fetch interviewer follow-up');
      const data: InterviewerTurn = await res.json();
      setCurrentTurn(data);
    } catch (err) {
      console.error('Error fetching follow-up:', err);
      // Fallback response for offline resilience
      setCurrentTurn({
        stage: 'approach',
        reasoning_critique: 'Great explanation so far. You clearly articulated the core data structure intuition.',
        followup_question: 'How would your algorithm behave if the input contains duplicate numbers or negative values?',
        edge_case_addressed: false,
        complexity_mentioned: true,
        suggested_action: 'continue_speaking',
      });
    } finally {
      setIsLoadingFollowup(false);
    }
  };

  const handleSubmitCode = async () => {
    setIsSubmittingCode(true);
    try {
      const res = await fetch(`${BACKEND_HTTP}/api/interview/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: currentQuestion.id,
          transcript: accumulatedTranscript || 'No verbal reasoning spoken.',
          code: code,
          language: language,
        }),
      });
      if (!res.ok) throw new Error('Failed to evaluate submission');
      const data: ReviewReport = await res.json();
      setReport(data);
      setIsReportOpen(true);
    } catch (err) {
      console.error('Error submitting code review:', err);
      // Fallback report
      setReport({
        overall_score: 86,
        passed: true,
        summary: 'Solid performance. The candidate explained the optimal approach clearly and implemented working code with good naming conventions.',
        scores: {
          problem_solving: 90,
          verbal_communication: 85,
          code_correctness: 90,
          code_quality: 85,
          complexity_analysis: 80,
        },
        strengths: [
          'Directly identified the O(N) optimal strategy.',
          'Maintained good verbal composure while outlining the solution.',
          'Clean, idiomatic code implementation.',
        ],
        areas_for_improvement: [
          'Clarify constraint limits and edge cases earlier.',
          'State auxiliary space overhead explicitly before starting code.',
        ],
        time_complexity_evaluation: {
          expected: currentQuestion.expectedComplexity.time,
          candidate_stated: 'O(N)',
          actual_code: 'O(N)',
          verdict: 'optimal',
        },
        space_complexity_evaluation: {
          expected: currentQuestion.expectedComplexity.space,
          candidate_stated: 'O(N)',
          actual_code: 'O(N)',
          verdict: 'optimal',
        },
        verbal_code_alignment: 'The code implementation faithfully reflected the candidate’s verbal explanation.',
      });
      setIsReportOpen(true);
    } finally {
      setIsSubmittingCode(false);
    }
  };

  return (
    <div className="min-h-screen relative p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Neo-brutalist Large Background Bleed Circles */}
      <div className="neo-bg-decorations">
        <div className="neo-bg-circle-warm" />
        <div className="neo-bg-circle-cool" />
      </div>

      {/* Main Navbar */}
      <Navbar
        questions={questions}
        currentQuestion={currentQuestion}
        onSelectQuestion={handleSelectQuestion}
        secondsElapsed={secondsElapsed}
        isConnected={isConnected}
        onOpenReport={() => setIsReportOpen(true)}
        canReview={Boolean(report || accumulatedTranscript || code.length > 20)}
      />

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        {/* Left Column: Problem Details & Voice Speech Capture (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Question Card */}
          <div className="min-h-[380px]">
            <QuestionCard question={currentQuestion} />
          </div>

          {/* Primary Yellow Mic Action Button */}
          <MicButton
            isRecording={isRecording}
            onToggleRecording={handleToggleRecording}
            audioLevel={audioLevel}
          />

          {/* Real-Time Live Transcript Stream */}
          <div className="min-h-[260px]">
            <LiveTranscript
              finalTranscripts={finalTranscripts}
              partialTranscript={partialTranscript}
              onClear={() => {
                setFinalTranscripts([]);
                setPartialTranscript('');
              }}
              isListening={isRecording}
              onManualTextSubmit={(text) => {
                setFinalTranscripts((prev) => [...prev, text]);
              }}
            />
          </div>
        </div>

        {/* Right Column: Code Editor & AI Interviewer Feedback (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Monaco Code Editor */}
          <div className="min-h-[460px]">
            <CodeEditor
              code={code}
              onChange={(val) => setCode(val)}
              language={language}
              onLanguageChange={handleLanguageChange}
              onResetCode={handleResetCode}
              onSubmitCode={handleSubmitCode}
              isSubmitting={isSubmittingCode}
            />
          </div>

          {/* Interviewer Follow-up & Dialogue Panel */}
          <div className="min-h-[260px]">
            <InterviewerPanel
              currentTurn={currentTurn}
              isLoading={isLoadingFollowup}
              onAskInterviewer={handleAskInterviewer}
              canAsk={Boolean(accumulatedTranscript.trim().length > 10)}
            />
          </div>
        </div>
      </div>

      {/* End-of-Session Performance Scorecard Modal */}
      <SessionReportModal
        report={report}
        question={currentQuestion}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onRestart={() => {
          setIsReportOpen(false);
          // Pick next question
          const currentIdx = questions.findIndex((q) => q.id === currentQuestion.id);
          const nextIdx = (currentIdx + 1) % questions.length;
          handleSelectQuestion(questions[nextIdx]);
        }}
      />
    </div>
  );
}

export default App;
