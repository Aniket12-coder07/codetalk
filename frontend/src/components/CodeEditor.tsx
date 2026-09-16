import React from 'react';
import Editor from '@monaco-editor/react';
import { Code2, RotateCcw, Send } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { IconButton } from './ui/IconButton';

interface CodeEditorProps {
  code: string;
  onChange: (val: string) => void;
  language: 'python' | 'javascript';
  onLanguageChange: (lang: 'python' | 'javascript') => void;
  onResetCode: () => void;
  onSubmitCode: () => void;
  isSubmitting?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  language,
  onLanguageChange,
  onResetCode,
  onSubmitCode,
  isSubmitting = false,
}) => {
  return (
    <Card
      tabColor="gray"
      tabLabel={`Solution Code (${language.toUpperCase()})`}
      tabIcon={<Code2 className="w-3.5 h-3.5" />}
      className="flex flex-col h-full"
    >
      {/* Editor Header Bar */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b-3 border-black/10">
        <div className="flex items-center gap-2">
          {/* Language Selector Tabs */}
          <div className="flex items-center border-2 border-black rounded-xl overflow-hidden shadow-neo-sm bg-white">
            <button
              onClick={() => onLanguageChange('python')}
              className={`px-3 py-1 text-xs font-black transition-all ${
                language === 'python'
                  ? 'bg-neo-yellow text-black'
                  : 'bg-white text-gray-700 hover:bg-cream-100'
              }`}
            >
              Python
            </button>
            <button
              onClick={() => onLanguageChange('javascript')}
              className={`px-3 py-1 text-xs font-black border-l-2 border-black transition-all ${
                language === 'javascript'
                  ? 'bg-neo-yellow text-black'
                  : 'bg-white text-gray-700 hover:bg-cream-100'
              }`}
            >
              JavaScript
            </button>
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
      <div className="flex-1 min-h-[360px] border-3 border-black rounded-[16px] overflow-hidden shadow-neo-sm bg-[#1e1e1e]">
        <Editor
          height="100%"
          language={language}
          value={code}
          theme="vs-dark"
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
