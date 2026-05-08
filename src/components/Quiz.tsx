import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, CheckCircle2, XCircle, RefreshCcw, Award } from 'lucide-react';

interface Question {
  id: number;
  text: string;
  options: string[];
  correct: number;
  explanation: string;
}

const sortingQuiz: Question[] = [
  {
    id: 1,
    text: "What is the worst-case time complexity of Bubble Sort?",
    options: ["O(n)", "O(n log n)", "O(n²)", "O(1)"],
    correct: 2,
    explanation: "In the worst case (a reverse-sorted array), Bubble Sort must perform a comparison and potentially a swap for every pair of elements, resulting in n * (n-1) / 2 operations, which is O(n²)."
  },
  {
    id: 2,
    text: "Which sorting algorithm is generally considered the fastest for large, random datasets?",
    options: ["Selection Sort", "Bubble Sort", "Insertion Sort", "Quick Sort"],
    correct: 3,
    explanation: "Quick Sort has an average time complexity of O(n log n) and is often faster in practice than other O(n log n) algorithms like Merge Sort due to smaller constant factors."
  },
  {
    id: 3,
    text: "What does it mean for a sorting algorithm to be 'stable'?",
    options: [
      "It always takes the same amount of time.",
      "It maintains the relative order of equal elements.",
      "It uses O(1) extra space.",
      "It never crashes."
    ],
    correct: 1,
    explanation: "Stability means that if two elements have the same value, their relative order in the output will be the same as it was in the input."
  }
];

export default function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const handleOptionClick = (index: number) => {
    if (showResult) return;
    setSelectedOption(index);
    setShowResult(true);
    if (index === sortingQuiz[currentQuestion].correct) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < sortingQuiz.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      setIsFinished(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedOption(null);
    setShowResult(false);
    setScore(0);
    setIsFinished(false);
  };

  if (isFinished) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <Award size={64} className="mx-auto text-neon-yellow mb-4" />
        <h2 className="text-2xl font-bold text-text-primary mb-2">Quiz Complete!</h2>
        <p className="text-text-secondary mb-6">
          You scored <span className="text-neon-cyan font-bold">{score}</span> out of <span className="font-bold">{sortingQuiz.length}</span>
        </p>
        <button
          onClick={resetQuiz}
          className="flex items-center gap-2 px-6 py-3 bg-neon-cyan text-bg-primary rounded-xl font-bold mx-auto hover:opacity-90 transition-opacity"
        >
          <RefreshCcw size={18} />
          Try Again
        </button>
      </div>
    );
  }

  const q = sortingQuiz[currentQuestion];

  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-semibold text-text-secondary flex items-center gap-2">
          <HelpCircle size={16} className="text-neon-purple" />
          Algorithm Quiz
        </h3>
        <span className="text-xs text-text-muted">
          Question {currentQuestion + 1} of {sortingQuiz.length}
        </span>
      </div>

      <div className="flex-1">
        <h4 className="text-lg font-medium text-text-primary mb-6">{q.text}</h4>
        <div className="space-y-3">
          {q.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleOptionClick(idx)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                showResult
                  ? idx === q.correct
                    ? 'border-neon-green bg-neon-green/10 text-neon-green'
                    : idx === selectedOption
                    ? 'border-neon-red bg-neon-red/10 text-neon-red'
                    : 'border-border-color opacity-50'
                  : 'border-border-color bg-bg-secondary hover:border-neon-purple hover:bg-bg-card-hover'
              }`}
            >
              <div className="flex justify-between items-center">
                <span>{option}</span>
                {showResult && idx === q.correct && <CheckCircle2 size={18} />}
                {showResult && idx === selectedOption && idx !== q.correct && <XCircle size={18} />}
              </div>
            </button>
          ))}
        </div>

        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 p-4 bg-bg-primary rounded-xl border border-border-color"
            >
              <p className="text-sm text-text-secondary">
                <span className="font-bold text-neon-yellow">Explanation:</span> {q.explanation}
              </p>
              <button
                onClick={handleNext}
                className="mt-4 w-full py-2 bg-neon-purple text-white rounded-lg font-bold hover:opacity-90 transition-opacity"
              >
                {currentQuestion === sortingQuiz.length - 1 ? 'Finish' : 'Next Question'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
