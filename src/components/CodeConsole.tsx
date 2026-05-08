import React, { useState, useEffect } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/themes/prism-tomorrow.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, X, ChevronUp, ChevronDown, RotateCcw, Trash2, Copy, Check } from 'lucide-react';
import { AlgorithmInfo } from '../types';

interface CodeConsoleProps {
  selectedAlgo: AlgorithmInfo;
  isOpen: boolean;
  onToggle: () => void;
}

type Language = 'python' | 'java' | 'c';

export default function CodeConsole({ selectedAlgo, isOpen, onToggle }: CodeConsoleProps) {
  const [language, setLanguage] = useState<Language>('python');
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (selectedAlgo.implementations) {
      setCode(selectedAlgo.implementations[language] || '// No implementation available');
    } else {
      setCode('// Implementation details coming soon for this algorithm');
    }
  }, [selectedAlgo, language]);

  const handleReset = () => {
    if (selectedAlgo.implementations) {
      setCode(selectedAlgo.implementations[language] || '');
    }
  };

  const handleClear = () => {
    setCode('');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div className="max-w-6xl mx-auto px-4 lg:px-6 pointer-events-auto">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              onClick={onToggle}
              className="flex items-center gap-2 px-6 py-2.5 bg-bg-secondary border border-border-color border-b-0 rounded-t-xl text-sm font-medium text-text-primary hover:bg-bg-card-hover transition-all mx-auto shadow-2xl"
            >
              <Terminal size={16} className="text-neon-cyan" />
              Coding Console
              <ChevronUp size={16} className="text-text-muted" />
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`bg-bg-secondary border-x border-t border-border-color rounded-t-2xl shadow-2xl overflow-hidden flex flex-col ${isMobile ? 'h-[80vh]' : 'h-[500px]'}`}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border-color bg-bg-card/50">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Terminal size={18} className="text-neon-cyan" />
                    <span className="font-bold text-sm tracking-tight">Console v1.0</span>
                  </div>

                  <div className="flex bg-bg-primary rounded-lg p-1 border border-border-color">
                    {(['python', 'java', 'c'] as Language[]).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setLanguage(lang)}
                        className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-all ${
                          language === lang
                            ? 'bg-bg-secondary text-neon-cyan shadow-sm'
                            : 'text-text-muted hover:text-text-primary'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="p-2 hover:bg-bg-primary rounded-lg text-text-muted hover:text-text-primary transition-colors relative"
                    title="Copy Code"
                  >
                    {copied ? <Check size={16} className="text-neon-green" /> : <Copy size={16} />}
                  </button>
                  <button
                    onClick={handleReset}
                    className="p-2 hover:bg-bg-primary rounded-lg text-text-muted hover:text-text-primary transition-colors"
                    title="Reset to Default"
                  >
                    <RotateCcw size={16} />
                  </button>
                  <button
                    onClick={handleClear}
                    className="p-2 hover:bg-bg-primary rounded-lg text-text-muted hover:text-text-primary transition-colors"
                    title="Clear Console"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="w-px h-4 bg-border-color mx-1" />
                  <button
                    onClick={onToggle}
                    className="p-2 hover:bg-bg-primary rounded-lg text-text-muted hover:text-text-primary transition-colors"
                  >
                    <ChevronDown size={18} />
                  </button>
                </div>
              </div>

              {/* Editor Area */}
              <div className="flex-1 overflow-auto bg-[#0d1117] relative group">
                <Editor
                  value={code}
                  onValueChange={setCode}
                  highlight={(code) => Prism.highlight(code, Prism.languages[language === 'python' ? 'python' : (language === 'java' ? 'java' : 'c')], language)}
                  padding={20}
                  style={{
                    fontFamily: '"Fira Code", "Fira Mono", monospace',
                    fontSize: 14,
                    minHeight: '100%',
                    backgroundColor: 'transparent',
                  }}
                  className="outline-none"
                />
              </div>

              {/* Status Bar */}
              <div className="px-4 py-2 bg-bg-card/50 border-t border-border-color flex justify-between items-center text-[10px] text-text-muted">
                <div className="flex items-center gap-4">
                  <span>Language: <span className="text-neon-cyan uppercase">{language}</span></span>
                  <span>Lines: {code.split('\n').length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                  <span>Ready to practice</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
