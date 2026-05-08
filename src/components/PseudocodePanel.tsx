import React from 'react';
import { motion } from 'framer-motion';
import { Code } from 'lucide-react';

interface PseudocodePanelProps {
  pseudocode: string[];
  currentLine?: number;
}

export default function PseudocodePanel({ pseudocode, currentLine }: PseudocodePanelProps) {
  if (!pseudocode || pseudocode.length === 0) return null;

  return (
    <div className="glass-card rounded-2xl p-4 flex flex-col h-full overflow-hidden">
      <h3 className="text-sm font-semibold text-text-secondary mb-3 flex items-center gap-2">
        <Code size={16} className="text-neon-cyan" />
        Pseudocode
      </h3>
      <div className="flex-1 overflow-y-auto font-mono text-sm space-y-1">
        {pseudocode.map((line, idx) => (
          <motion.div
            key={idx}
            className={`px-3 py-1 rounded transition-colors ${
              currentLine === idx
                ? 'bg-neon-cyan/20 text-neon-cyan border-l-2 border-neon-cyan'
                : 'text-text-muted hover:text-text-secondary'
            }`}
            animate={currentLine === idx ? { x: 5 } : { x: 0 }}
          >
            <pre className="whitespace-pre-wrap">{line}</pre>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
