import React from 'react';
import { BookOpen, Sparkles, AlertTriangle } from 'lucide-react';
import { Question } from '../types';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

interface QuestionCardProps {
  question: Question;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question }) => {
  return (
    <Card
      tabColor={question.difficultyColor}
      tabLabel={`${question.difficulty} • ${question.category}`}
      tabIcon={<BookOpen className="w-3.5 h-3.5" />}
      className="h-full flex flex-col"
    >
      {/* Question Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b-3 border-black/10">
        <h2 className="text-xl font-black text-black tracking-tight font-sans">
          {question.title}
        </h2>
        <div className="flex items-center gap-2">
          <Badge color="gray" className="font-mono">
            Time: {question.expectedComplexity.time}
          </Badge>
          <Badge color="gray" className="font-mono">
            Space: {question.expectedComplexity.space}
          </Badge>
        </div>
      </div>

      {/* Spoken Reminder Callout */}
      <div className="bg-neo-yellow/20 border-3 border-black rounded-[14px] p-3 mb-4 flex items-start gap-2.5">
        <Sparkles className="w-5 h-5 text-neo-orange shrink-0 mt-0.5" strokeWidth={2.5} />
        <p className="text-xs font-bold text-black leading-relaxed">
          <strong className="underline font-black">Interviewer Expectation:</strong> State your understanding and compare brute-force vs optimal approaches verbally <span className="underline">before</span> typing code.
        </p>
      </div>

      {/* Problem Description */}
      <div className="overflow-y-auto max-h-[380px] pr-2 space-y-4 text-sm font-medium text-gray-800 leading-relaxed">
        <div className="whitespace-pre-line font-bold text-gray-900">
          {question.description}
        </div>

        {/* Examples */}
        <div className="space-y-3">
          <h3 className="text-xs font-black text-black uppercase tracking-wider">
            Examples:
          </h3>
          {question.examples.map((ex, idx) => (
            <div
              key={idx}
              className="bg-white border-2 border-black rounded-xl p-3 shadow-neo-sm space-y-1 font-mono text-xs"
            >
              <div>
                <span className="font-bold text-gray-500">Input: </span>
                <span className="font-bold text-black">{ex.input}</span>
              </div>
              <div>
                <span className="font-bold text-gray-500">Output: </span>
                <span className="font-bold text-black">{ex.output}</span>
              </div>
              {ex.explanation && (
                <div className="pt-1 text-gray-600 font-sans text-xs italic font-medium">
                  {ex.explanation}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Constraints */}
        {question.constraints && question.constraints.length > 0 && (
          <div className="pt-2">
            <h3 className="text-xs font-black text-black uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-neo-orange" /> Constraints:
            </h3>
            <ul className="list-disc list-inside space-y-1 font-mono text-xs text-gray-700">
              {question.constraints.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
};
