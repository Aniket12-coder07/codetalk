import React from 'react';
import { Bot, HelpCircle, Sparkles, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { InterviewerTurn } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

interface InterviewerPanelProps {
  currentTurn: InterviewerTurn | null;
  isLoading: boolean;
  onAskInterviewer: () => void;
  canAsk: boolean;
}

const stageColorMap: Record<string, 'blue' | 'yellow' | 'orange' | 'purple' | 'green'> = {
  clarification: 'blue',
  approach: 'yellow',
  complexity: 'orange',
  edge_cases: 'purple',
  ready_to_code: 'green',
};

const stageLabelMap: Record<string, string> = {
  clarification: '1. Problem Clarification',
  approach: '2. High-Level Approach',
  complexity: '3. Complexity Analysis',
  edge_cases: '4. Edge Case Scenarios',
  ready_to_code: '5. Ready to Implement Code',
};

export const InterviewerPanel: React.FC<InterviewerPanelProps> = ({
  currentTurn,
  isLoading,
  onAskInterviewer,
  canAsk,
}) => {
  return (
    <Card
      tabColor="purple"
      tabLabel="AI Interviewer Dialogue"
      tabIcon={<Bot className="w-3.5 h-3.5" />}
      className="flex flex-col h-full"
    >
      {/* Header with Stage & Manual Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b-3 border-black/10">
        <div className="flex items-center gap-2">
          {currentTurn ? (
            <Badge color={stageColorMap[currentTurn.stage] || 'purple'} className="uppercase">
              {stageLabelMap[currentTurn.stage] || currentTurn.stage}
            </Badge>
          ) : (
            <Badge color="gray">Awaiting Reasoning</Badge>
          )}
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={onAskInterviewer}
          disabled={isLoading || !canAsk}
          className="flex items-center gap-1.5"
        >
          {isLoading ? (
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 animate-spin" /> Claude Thinking...
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" /> Ask Follow-up
            </span>
          )}
        </Button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4 min-h-[180px]">
        {currentTurn ? (
          <>
            {/* Direct Interviewer Question Bubble */}
            <div className="bg-white border-3 border-black rounded-[18px] p-4 shadow-neo space-y-2">
              <div className="flex items-center gap-2 text-xs font-black text-neo-purple uppercase tracking-wider">
                <Bot className="w-4 h-4 text-black" />
                <span>Interviewer Prompt:</span>
              </div>
              <p className="text-base font-black text-black leading-snug">
                "{currentTurn.followup_question}"
              </p>
            </div>

            {/* Candidate Verbal Critique Card */}
            <div className="bg-cream-100 border-2 border-black rounded-[14px] p-3 shadow-neo-sm">
              <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-neo-orange" /> Reasoning Evaluation:
              </h4>
              <p className="text-xs font-bold text-gray-800 leading-relaxed">
                {currentTurn.reasoning_critique}
              </p>
            </div>

            {/* Checklist items: Complexity & Edge Cases */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold border-2 border-black ${
                  currentTurn.complexity_mentioned
                    ? 'bg-neo-green/30 text-black'
                    : 'bg-cream-200 text-gray-600'
                }`}
              >
                {currentTurn.complexity_mentioned ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-gray-400" />
                )}
                Complexity Mentioned
              </span>

              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold border-2 border-black ${
                  currentTurn.edge_case_addressed
                    ? 'bg-neo-green/30 text-black'
                    : 'bg-cream-200 text-gray-600'
                }`}
              >
                {currentTurn.edge_case_addressed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-gray-400" />
                )}
                Edge Cases Addressed
              </span>

              {currentTurn.suggested_action === 'start_coding' && (
                <Badge color="green" className="flex items-center gap-1">
                  Ready to Code <ArrowRight className="w-3 h-3" />
                </Badge>
              )}
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-black/30 rounded-xl bg-white/60">
            <Bot className="w-8 h-8 text-neo-purple mb-2" />
            <p className="text-sm font-bold text-gray-800">
              The interviewer is listening.
            </p>
            <p className="text-xs text-gray-500 max-w-xs mt-1">
              Explain how you plan to solve the problem. Claude will critique your reasoning and probe your approach.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
