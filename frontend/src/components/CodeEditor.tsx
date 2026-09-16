import React from 'react';
import Editor from '@monaco-editor/react';
import { Code2, RotateCcw, Send } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { IconButton } from './ui/IconButton';
import { SupportedLanguage } from '../types';

interface CodeEditorProps {
  code: string;
  onChange: (val: string) => void;
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onResetCode: () => void;
  onSubmitCode: () => void;
  isSubmitting?: boolean;
  isDarkMode?: boolean;
}

const LANGUAGES: { id: SupportedLanguage; label: string; badge: string }[] = [
  { id: 'python', label: 'Python', badge: 'PY' },
  { id: 'javascript', label: 'JavaScript', badge: 'JS' },
  { id: 'typescript', label: 'TypeScript', badge: 'TS' },
  { id: 'java', label: 'Java', badge: 'JAVA' },
  { id: 'cpp', label: 'C++', badge: 'C++' },
  { id: 'go', label: 'Go', badge: 'GO' },
];

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  language,
  onLanguageChange,
  onResetCode,
  onSubmitCode,
  isSubmitting = false,
  isDarkMode = false,
}) => {
  return (
    <Card
      tabColor="gray"
      tabLabel={`Solution Code (${language.toUpperCase()})`}
      tabIcon={<Code2 className="w-3.5 h-3.5" />}
      className="flex flex-col h-full"
    >
      {/* Editor Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b-3 border-black/10 dark:border-white/10">
        <div className="flex flex-wrap items-center gap-2">
          {/* 6-Language Selector Tabs */}
          <div className="flex items-center border-2 border-black dark:border-white/80 rounded-xl overflow-hidden shadow-neo-sm bg-white dark:bg-zinc-800">
            {LANGUAGES.map((lang, idx) => (
              <button
                key={lang.id}
                onClick={() => onLanguageChange(lang.id)}
                className={`px-2.5 py-1 text-xs font-black transition-all cursor-pointer ${
                  idx > 0 ? 'border-l-2 border-black dark:border-white/80' : ''
                } ${
                  language === lang.id
                    ? 'bg-neo-yellow text-black'
                    : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-cream-100 dark:hover:bg-zinc-700'
                }`}
              >
                <span className="hidden sm:inline">{lang.label}</span>
                <span className="sm:hidden">{lang.badge}</span>
              </button>
            ))}
          </div>

          <IconButton
            icon={<RotateCcw className="w-4 h-4" />}
            tooltip="Reset to starter code"
            onClick={onResetCode}
          />
        </div>

        {/* Submit Button */}
        <Button
          variant="success"
          size="sm"
          onClick={onSubmitCode}
          disabled={isSubmitting || !code.trim()}
          className="flex items-center gap-1.5"
        >
          {isSubmitting ? (
            <span>Reviewing...</span>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" strokeWidth={2.5} />
              <span>Submit Solution</span>
            </>
          )}
        </Button>
      </div>

      {/* Embedded Monaco Editor Container */}
      <div className="flex-1 min-h-[360px] border-3 border-black dark:border-white/80 rounded-[16px] overflow-hidden shadow-neo-sm dark:shadow-[3px_3px_0px_0px_#000000] bg-[#1e1e1e]">
        <Editor
          height="100%"
          language={language === 'cpp' ? 'cpp' : language}
          value={code}
          theme={isDarkMode ? 'vs-dark' : 'vs-dark'}
          onChange={(val) => onChange(val || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            fontLigatures: true,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>
    </Card>
  );
};
