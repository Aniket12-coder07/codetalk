import React from 'react';
import { X, ThumbsUp, Target, RotateCcw } from 'lucide-react';
import { ReviewReport, Question } from '../types';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

interface SessionReportModalProps {
  report: ReviewReport | null;
  question: Question;
  isOpen: boolean;
  onClose: () => void;
  onRestart: () => void;
}

export const SessionReportModal: React.FC<SessionReportModalProps> = ({
  report,
  question,
  isOpen,
  onClose,
  onRestart,
}) => {
  if (!isOpen || !report) return null;

  const isPositive = report.passed && report.overall_score >= 70;
  const borderColor = isPositive ? 'border-neo-green' : 'border-neo-orange';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-3xl bg-cream-50 border-4 ${borderColor} rounded-[24px] shadow-neo-xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-10 h-10 bg-white border-3 border-black rounded-[14px] shadow-neo-sm flex items-center justify-center hover:bg-cream-100 neo-pressable cursor-pointer"
        >
          <X className="w-5 h-5 text-black" strokeWidth={3} />
        </button>

        {/* Top Header */}
        <div className="flex flex-wrap items-center gap-4 mb-6 pb-4 border-b-4 border-black/10">
          <div
            className={`w-20 h-20 rounded-[20px] border-4 border-black flex flex-col items-center justify-center shadow-neo ${
              isPositive ? 'bg-neo-green text-black' : 'bg-neo-orange text-black'
            }`}
          >
            <span className="text-2xl font-black leading-none font-sans">
              {report.overall_score}
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider mt-0.5">
              Score / 100
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-black font-sans">
                Interview Performance Report
              </h2>
              <Badge color={isPositive ? 'green' : 'orange'} className="uppercase">
                {isPositive ? 'Strong Hire' : 'Needs Practice'}
              </Badge>
            </div>
            <p className="text-sm font-bold text-gray-700 mt-1">
              Problem: {question.title} ({question.difficulty})
            </p>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="bg-white border-3 border-black rounded-[18px] p-4 shadow-neo mb-6">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 mb-1">
            Executive Assessment:
          </h3>
          <p className="text-sm font-bold text-black leading-relaxed">
            {report.summary}
          </p>
        </div>

        {/* Rubric Score Breakdown Bars */}
        <div className="bg-cream-100 border-3 border-black rounded-[18px] p-5 shadow-neo mb-6">
          <h3 className="text-sm font-black uppercase tracking-wider text-black mb-3">
            Core Competency Breakdown
          </h3>
          <div className="space-y-3 font-sans">
            {Object.entries(report.scores).map(([category, score]) => {
              const label = category
                .split('_')
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ');
              return (
                <div key={category} className="space-y-1">
                  <div className="flex justify-between text-xs font-black text-black">
                    <span>{label}</span>
                    <span className="tabular-nums font-mono">{score}/100</span>
                  </div>
                  <div className="w-full h-3 bg-white border-2 border-black rounded-full overflow-hidden">
                    <div
                      style={{ width: `${score}%` }}
                      className={`h-full border-r-2 border-black transition-all duration-500 ${
                        score >= 80
                          ? 'bg-neo-green'
                          : score >= 60
                          ? 'bg-neo-yellow'
                          : 'bg-neo-red'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Strengths & Improvement Areas Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Strengths */}
          <div className="bg-white border-3 border-black rounded-[18px] p-4 shadow-neo">
            <h4 className="text-xs font-black uppercase tracking-wider text-black mb-2 flex items-center gap-1.5">
              <ThumbsUp className="w-4 h-4 text-neo-green" strokeWidth={3} />
              Demonstrated Strengths
            </h4>
            <ul className="space-y-2 text-xs font-bold text-gray-800">
              {report.strengths.map((str, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-neo-green font-black">✔</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Areas for Improvement */}
          <div className="bg-white border-3 border-black rounded-[18px] p-4 shadow-neo">
            <h4 className="text-xs font-black uppercase tracking-wider text-black mb-2 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-neo-orange" strokeWidth={3} />
              Growth Opportunities
            </h4>
            <ul className="space-y-2 text-xs font-bold text-gray-800">
              {report.areas_for_improvement.map((area, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-neo-orange font-black">➤</span>
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Complexity Evaluation Table */}
        <div className="bg-white border-3 border-black rounded-[18px] p-4 shadow-neo mb-6 overflow-x-auto">
          <h4 className="text-xs font-black uppercase tracking-wider text-black mb-2">
            Time & Space Complexity Audit
          </h4>
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b-2 border-black text-left font-black">
                <th className="pb-2">Metric</th>
                <th className="pb-2">Target</th>
                <th className="pb-2">Spoken Aloud</th>
                <th className="pb-2">Code Actual</th>
                <th className="pb-2">Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10 font-bold">
              <tr>
                <td className="py-2 text-black">Time</td>
                <td className="py-2 text-gray-600">{report.time_complexity_evaluation.expected}</td>
                <td className="py-2 text-black">{report.time_complexity_evaluation.candidate_stated}</td>
                <td className="py-2 text-black">{report.time_complexity_evaluation.actual_code}</td>
                <td className="py-2">
                  <Badge color={report.time_complexity_evaluation.verdict === 'optimal' ? 'green' : 'orange'}>
                    {report.time_complexity_evaluation.verdict}
                  </Badge>
                </td>
              </tr>
              <tr>
                <td className="py-2 text-black">Space</td>
                <td className="py-2 text-gray-600">{report.space_complexity_evaluation.expected}</td>
                <td className="py-2 text-black">{report.space_complexity_evaluation.candidate_stated}</td>
                <td className="py-2 text-black">{report.space_complexity_evaluation.actual_code}</td>
                <td className="py-2">
                  <Badge color={report.space_complexity_evaluation.verdict === 'optimal' ? 'green' : 'orange'}>
                    {report.space_complexity_evaluation.verdict}
                  </Badge>
                </td>
              </tr>
            </tbody>
          </table>
          <p className="mt-2 text-xs font-sans font-bold text-gray-600">
            <strong>Verbal-Code Alignment:</strong> {report.verbal_code_alignment}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
          <Button variant="secondary" size="md" onClick={onClose}>
            Back to Editor
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={onRestart}
            className="flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" /> Next Interview Session
          </Button>
        </div>
      </div>
    </div>
  );
};
