export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type SupportedLanguage = 'python' | 'javascript' | 'typescript' | 'java' | 'cpp' | 'go';

export interface QuestionExample {
  input: string;
  output: string;
  explanation: string;
}

export interface Question {
  id: string;
  title: string;
  difficulty: Difficulty;
  difficultyColor: 'green' | 'orange' | 'red';
  category: string;
  description: string;
  examples: QuestionExample[];
  constraints: string[];
  starterCode: {
    python: string;
    javascript: string;
    typescript?: string;
    java?: string;
    cpp?: string;
    go?: string;
  };
  expectedComplexity: {
    time: string;
    space: string;
  };
  followUpQuestions: string[];
  rubric: Record<string, string>;
  companyTags?: string[];
}

export interface TranscriptEntry {
  id: string;
  text: string;
  isFinal: boolean;
  timestamp: string;
  confidence?: number;
}

export interface InterviewerTurn {
  stage: 'clarification' | 'approach' | 'complexity' | 'edge_cases' | 'ready_to_code';
  reasoning_critique: string;
  followup_question: string;
  edge_case_addressed: boolean;
  complexity_mentioned: boolean;
  suggested_action: 'continue_speaking' | 'ask_clarification' | 'start_coding';
}

export interface ReviewReport {
  overall_score: number;
  passed: boolean;
  summary: string;
  scores: {
    problem_solving: number;
    verbal_communication: number;
    code_correctness: number;
    code_quality: number;
    complexity_analysis: number;
  };
  strengths: string[];
  areas_for_improvement: string[];
  time_complexity_evaluation: {
    expected: string;
    candidate_stated: string;
    actual_code: string;
    verdict: 'optimal' | 'sub-optimal' | 'incorrect';
  };
  space_complexity_evaluation: {
    expected: string;
    candidate_stated: string;
    actual_code: string;
    verdict: 'optimal' | 'sub-optimal' | 'incorrect';
  };
  verbal_code_alignment: string;
}
