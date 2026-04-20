import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchingAlgorithms } from '../data/algorithms';
import { AlgorithmInfo, SearchStep } from '../types';
import { RotateCcw, Shuffle, Info, ChevronDown, Search, Target, SkipBack, SkipForward, List, Gauge, Code, Layers, GitBranch, Edit3 } from 'lucide-react';

const SPEED_OPTIONS = [
  { label: '🐢 Slow', value: 600 },
  { label: '🚶 Normal', value: 300 },
  { label: '⚡ Fast', value: 150 },
  { label: '🚀 Very Fast', value: 50 },
  { label: '⚡ Instant', value: 10 },
];

function generateArray(size: number): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 99) + 1);
}

function getSortedArray(size: number): number[] {
  return generateArray(size).sort((a, b) => a - b);
}

export default function SearchingViz() {
  const [array, setArray] = useState<number[]>(() => getSortedArray(20));
  const [target, setTarget] = useState<number>(0);
  const [current, setCurrent] = useState(-1);
  const [found, setFound] = useState(-1);
  const [checked, setChecked] = useState<number[]>([]);
  const [range, setRange] = useState<[number, number]>([-1, -1]);
  const [selectedAlgo, setSelectedAlgo] = useState<AlgorithmInfo>(searchingAlgorithms[0]);
  const [speed, setSpeed] = useState(300);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<string>('');
  const [comparisons, setComparisons] = useState(0);
  const [showAlgoDropdown, setShowAlgoDropdown] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [targetInput, setTargetInput] = useState('');
  const [needsSorted, setNeedsSorted] = useState(false);
  
  // Step-by-step state
  const [steps, setSteps] = useState<SearchStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isStepMode, setIsStepMode] = useState(false);

  const stopRef = useRef(false);
  const speedRef = useRef(speed);

  useEffect(() => { speedRef.current = speed; }, [speed]);

  const sleep = useCallback(() => {
    return new Promise<void>((resolve) => {
      const check = () => {
        if (stopRef.current) { resolve(); return; }
        setTimeout(resolve, speedRef.current);
      };
      check();
    });
  }, []);

  const resetState = useCallback(() => {
    setCurrent(-1);
    setFound(-1);
    setChecked([]);
    setRange([-1, -1]);
    setResult('');
    setComparisons(0);
    stopRef.current = false;
    setSteps([]);
    setCurrentStepIndex(-1);
    setIsStepMode(false);
  }, []);

  const handleNewArray = useCallback(() => {
    stopRef.current = true;
    setIsRunning(false);
    resetState();
    const sortedAlgos = ['binary', 'jump', 'interpolation', 'exponential', 'ternary'];
    const needSorted = sortedAlgos.includes(selectedAlgo.id);
    setNeedsSorted(needSorted);
    const newArr = needSorted ? getSortedArray(20) : generateArray(20);
    setArray(newArr);
    setTarget(newArr[Math.floor(Math.random() * newArr.length)]);
    setTargetInput(String(newArr[Math.floor(Math.random() * newArr.length)]));
  }, [selectedAlgo.id, resetState]);

  useEffect(() => {
    const sortedAlgos = ['binary', 'jump', 'interpolation', 'exponential', 'ternary'];
    const needSorted = sortedAlgos.includes(selectedAlgo.id);
    setNeedsSorted(needSorted);
    if (needSorted) {
      const sorted = [...array].sort((a, b) => a - b);
      setArray(sorted);
    }
    resetState();
  }, [selectedAlgo]);

  useEffect(() => {
    if (array.length > 0 && !isRunning) {
      const t = array[Math.floor(Math.random() * array.length)];
      setTarget(t);
      setTargetInput(String(t));
    }
  }, [array]);

  const handleCustomArray = useCallback(() => {
    const nums = customInput.split(/[\s,]+/).map(Number).filter(n => !isNaN(n) && n > 0 && n <= 100);
    if (nums.length > 0) {
      stopRef.current = true;
      setIsRunning(false);
      resetState();
      setArray(needsSorted ? nums.sort((a, b) => a - b) : nums);
      setShowCustomInput(false);
      setCustomInput('');
    }
  }, [customInput, needsSorted, resetState]);

  const handleTargetChange = useCallback((val: string) => {
    setTargetInput(val);
    const num = parseInt(val);
    if (!isNaN(num)) {
      setTarget(num);
      resetState();
    }
  }, [resetState]);

  // Add step to history
  const addStep = useCallback((type: 'compare' | 'found' | 'not-found' | 'range-update', indices: number[], description: string, arrayState: number[]) => {
    setSteps(prev => [...prev, {
      type,
      indices,
      description,
      arrayState: [...arrayState],
      timestamp: Date.now()
    }]);
  }, []);

  // Step navigation
  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex < -1 || stepIndex >= steps.length) return;
    
    setCurrentStepIndex(stepIndex);
    
    if (stepIndex === -1) {
      setCurrent(-1);
      setFound(-1);
      setChecked([]);
      setRange([-1, -1]);
      setResult('');
      setComparisons(0);
      return;
    }
    
    const step = steps[stepIndex];
    
    if (step.type === 'compare') {
      setCurrent(step.indices[0]);
      setChecked(prev => [...new Set([...prev, step.indices[0]])]);
      setComparisons(stepIndex + 1);
    } else if (step.type === 'found') {
      setFound(step.indices[0]);
      setResult(`Found at index ${step.indices[0]}`);
    } else if (step.type === 'not-found') {
      setResult('Not found');
    } else if (step.type === 'range-update') {
      setRange([step.indices[0], step.indices[1]]);
    }
  }, [steps]);

  const nextStep = useCallback(() => {
    goToStep(currentStepIndex + 1);
  }, [currentStepIndex, goToStep]);

  const prevStep = useCallback(() => {
    goToStep(currentStepIndex - 1);
  }, [currentStepIndex, goToStep]);

  // Search Algorithms
  const runLinearSearch = useCallback(async () => {
    for (let i = 0; i < array.length; i++) {
      if (stopRef.current) return;
      setCurrent(i);
      setComparisons(prev => prev + 1);
      addStep('compare', [i], `Checking index ${i}: ${array[i]}`, array);
      await sleep();
      setChecked(prev => [...prev, i]);
      
      if (array[i] === target) {
        setFound(i);
        addStep('found', [i], `Found ${target} at index ${i}!`, array);
        setResult(`Found at index ${i} after ${i + 1} comparisons`);
        return;
      }
    }
    addStep('not-found', [], `${target} not found in array`, array);
    setResult('Not found');
  }, [array, target, sleep, addStep]);

  const runBinarySearch = useCallback(async () => {
    let left = 0, right = array.length - 1;
    let comp = 0;
    
    while (left <= right && !stopRef.current) {
      const mid = Math.floor((left + right) / 2);
      setRange([left, right]);
      addStep('range-update', [left, right], `Search range: [${left}, ${right}]`, array);
      setCurrent(mid);
      setComparisons(++comp);
      addStep('compare', [mid], `Checking mid index ${mid}: ${array[mid]}`, array);
      await sleep();
      setChecked(prev => [...prev, mid]);
      
      if (array[mid] === target) {
        setFound(mid);
        addStep('found', [mid], `Found ${target} at index ${mid}!`, array);
        setResult(`Found at index ${mid} after ${comp} comparisons`);
        return;
      }
      
      if (array[mid] < target) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
    addStep('not-found', [], `${target} not found in array`, array);
    setResult('Not found');
  }, [array, target, sleep, addStep]);

  const runJumpSearch = useCallback(async () => {
    const n = array.length;
    const jump = Math.floor(Math.sqrt(n));
    let prev = 0, curr = 0;
    let comp = 0;

    while (curr < n && array[curr] < target && !stopRef.current) {
      setCurrent(curr);
      setComparisons(++comp);
      addStep('compare', [curr], `Jump check index ${curr}: ${array[curr]}`, array);
      await sleep();
      setChecked(prev => [...prev, curr]);
      prev = curr;
      curr += jump;
    }

    addStep('range-update', [prev, Math.min(curr, n - 1)], `Linear search from ${prev} to ${Math.min(curr, n - 1)}`, array);
    
    for (let i = prev; i < Math.min(curr, n); i++) {
      if (stopRef.current) return;
      setCurrent(i);
      setComparisons(++comp);
      addStep('compare', [i], `Checking index ${i}: ${array[i]}`, array);
      await sleep();
      setChecked(prev => [...prev, i]);
      
      if (array[i] === target) {
        setFound(i);
        addStep('found', [i], `Found ${target} at index ${i}!`, array);
        setResult(`Found at index ${i} after ${comp} comparisons`);
        return;
      }
    }
    addStep('not-found', [], `${target} not found in array`, array);
    setResult('Not found');
  }, [array, target, sleep, addStep]);

  const runInterpolationSearch = useCallback(async () => {
    let lo = 0, hi = array.length - 1;
    let comp = 0;

    while (lo <= hi && target >= array[lo] && target <= array[hi] && !stopRef.current) {
      const pos = lo + Math.floor(((target - array[lo]) * (hi - lo)) / (array[hi] - array[lo]));
      setRange([lo, hi]);
      addStep('range-update', [lo, hi], `Estimated position: ${pos}`, array);
      setCurrent(pos);
      setComparisons(++comp);
      addStep('compare', [pos], `Checking estimated index ${pos}: ${array[pos]}`, array);
      await sleep();
      setChecked(prev => [...prev, pos]);

      if (array[pos] === target) {
        setFound(pos);
        addStep('found', [pos], `Found ${target} at index ${pos}!`, array);
        setResult(`Found at index ${pos} after ${comp} comparisons`);
        return;
      }
      if (array[pos] < target) lo = pos + 1;
      else hi = pos - 1;
    }
    addStep('not-found', [], `${target} not found in array`, array);
    setResult('Not found');
  }, [array, target, sleep, addStep]);

  const runExponentialSearch = useCallback(async () => {
    let comp = 0;
    
    if (array[0] === target) {
      setFound(0);
      setResult(`Found at index 0 after 1 comparison`);
      return;
    }

    let bound = 1;
    while (bound < array.length && array[bound] < target && !stopRef.current) {
      setCurrent(bound);
      setComparisons(++comp);
      addStep('compare', [bound], `Bound check index ${bound}: ${array[bound]}`, array);
      await sleep();
      setChecked(prev => [...prev, bound]);
      bound *= 2;
    }

    const left = Math.floor(bound / 2);
    const right = Math.min(bound, array.length - 1);
    setRange([left, right]);
    addStep('range-update', [left, right], `Binary search from ${left} to ${right}`, array);
    
    let l = left, r = right;
    while (l <= r && !stopRef.current) {
      const mid = Math.floor((l + r) / 2);
      setCurrent(mid);
      setComparisons(++comp);
      addStep('compare', [mid], `Binary check index ${mid}: ${array[mid]}`, array);
      await sleep();
      setChecked(prev => [...prev, mid]);

      if (array[mid] === target) {
        setFound(mid);
        addStep('found', [mid], `Found ${target} at index ${mid}!`, array);
        setResult(`Found at index ${mid} after ${comp} comparisons`);
        return;
      }
      if (array[mid] < target) l = mid + 1;
      else r = mid - 1;
    }
    addStep('not-found', [], `${target} not found in array`, array);
    setResult('Not found');
  }, [array, target, sleep, addStep]);

  const runTernarySearch = useCallback(async () => {
    let l = 0, r = array.length - 1;
    let comp = 0;

    while (l <= r && !stopRef.current) {
      const mid1 = l + Math.floor((r - l) / 3);
      const mid2 = r - Math.floor((r - l) / 3);
      setRange([l, r]);
      addStep('range-update', [l, r], `Range [${l}, ${r}], mids at ${mid1} and ${mid2}`, array);
      
      setCurrent(mid1);
      setComparisons(++comp);
      addStep('compare', [mid1], `First mid index ${mid1}: ${array[mid1]}`, array);
      await sleep();
      setChecked(prev => [...prev, mid1]);

      if (array[mid1] === target) {
        setFound(mid1);
        addStep('found', [mid1], `Found ${target} at index ${mid1}!`, array);
        setResult(`Found at index ${mid1} after ${comp} comparisons`);
        return;
      }

      setCurrent(mid2);
      setComparisons(++comp);
      addStep('compare', [mid2], `Second mid index ${mid2}: ${array[mid2]}`, array);
      await sleep();
      setChecked(prev => [...prev, mid2]);

      if (array[mid2] === target) {
        setFound(mid2);
        addStep('found', [mid2], `Found ${target} at index ${mid2}!`, array);
        setResult(`Found at index ${mid2} after ${comp} comparisons`);
        return;
      }

      if (target < array[mid1]) r = mid1 - 1;
      else if (target > array[mid2]) l = mid2 + 1;
      else { l = mid1 + 1; r = mid2 - 1; }
    }
    addStep('not-found', [], `${target} not found in array`, array);
    setResult('Not found');
  }, [array, target, sleep, addStep]);

  const startSearch = useCallback(async () => {
    setIsRunning(true);
    resetState();
    
    switch(selectedAlgo.id) {
      case 'linear': await runLinearSearch(); break;
      case 'binary': await runBinarySearch(); break;
      case 'jump': await runJumpSearch(); break;
      case 'interpolation': await runInterpolationSearch(); break;
      case 'exponential': await runExponentialSearch(); break;
      case 'ternary': await runTernarySearch(); break;
    }
    
    setIsRunning(false);
  }, [selectedAlgo, runLinearSearch, runBinarySearch, runJumpSearch, runInterpolationSearch, runExponentialSearch, runTernarySearch, resetState]);

  const getCellColor = (idx: number) => {
    if (found === idx) return 'bg-neon-green border-neon-green text-bg-primary scale-110 z-10';
    if (current === idx) return 'bg-neon-yellow border-neon-yellow text-bg-primary scale-110 z-10';
    if (checked.includes(idx)) return 'bg-neon-cyan/40 border-neon-cyan/60';
    if (range[0] <= idx && idx <= range[1]) return 'bg-neon-purple/30 border-neon-purple/50';
    return 'bg-bg-secondary border-border-color hover:border-neon-cyan/50';
  };

  const getStepColor = (type: string) => {
    switch(type) {
      case 'compare': return 'border-neon-yellow bg-neon-yellow/10';
      case 'found': return 'border-neon-green bg-neon-green/10';
      case 'not-found': return 'border-neon-red bg-neon-red/10';
      case 'range-update': return 'border-neon-purple bg-neon-purple/10';
      default: return 'border-gray-600 bg-gray-800/50';
    }
  };

  return (
    <div className="h-full flex gap-4">
      {/* Left Column - Controls */}
      <div className="w-72 flex-shrink-0 flex flex-col gap-4 overflow-visible">
        {/* Algorithm Selection */}
        <div className="glass-card rounded-2xl p-4 overflow-visible relative z-20">
          <h3 className="text-sm font-semibold text-text-secondary mb-3 flex items-center gap-2">
            <Code size={16} className="text-neon-cyan" />
            Algorithm
          </h3>
          <div className="relative isolate overflow-visible">
            <button
              onClick={() => setShowAlgoDropdown(!showAlgoDropdown)}
              disabled={isRunning}
              className="w-full flex items-center justify-between px-4 py-3 bg-bg-secondary rounded-xl text-text-primary hover:bg-bg-card-hover transition-colors disabled:opacity-50"
            >
              <span className="font-medium">{selectedAlgo.name}</span>
              <ChevronDown size={18} className={`transition-transform ${showAlgoDropdown ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {showAlgoDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-bg-card border border-border-color rounded-xl overflow-hidden z-[100] max-h-80 overflow-y-auto shadow-2xl shadow-black/50"
                >
                  {searchingAlgorithms.map((algo) => (
                    <button
                      key={algo.id}
                      onClick={() => { setSelectedAlgo(algo); setShowAlgoDropdown(false); }}
                      className={`w-full px-4 py-3 text-left hover:bg-bg-secondary transition-colors ${
                        selectedAlgo.id === algo.id ? 'bg-neon-cyan/10 text-neon-cyan' : 'text-text-primary'
                      }`}
                    >
                      <div className="font-medium">{algo.name}</div>
                      <div className="text-xs text-text-muted">Time: {algo.timeComplexity.average}</div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Array Controls */}
        <div className="glass-card rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-text-secondary mb-3 flex items-center gap-2">
            <Layers size={16} className="text-neon-purple" />
            Array Settings
          </h3>
          
          <button
            onClick={handleNewArray}
            disabled={isRunning}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-bg-secondary rounded-xl text-text-primary hover:bg-bg-card-hover transition-colors disabled:opacity-50"
          >
            <Shuffle size={16} />
            Generate New Array
          </button>

          <button
            onClick={() => setShowCustomInput(!showCustomInput)}
            className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 bg-bg-secondary rounded-xl text-text-primary hover:bg-bg-card-hover transition-colors"
          >
            <Edit3 size={16} />
            Custom Array
          </button>

          {showCustomInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3"
            >
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="e.g., 10, 20, 30, 40, 50"
                className="w-full px-4 py-2.5 bg-bg-secondary rounded-xl text-text-primary placeholder-text-muted border border-border-color focus:border-neon-cyan outline-none"
              />
              <button
                onClick={handleCustomArray}
                disabled={isRunning}
                className="w-full mt-2 px-4 py-2 bg-neon-cyan text-bg-primary rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                Apply Array
              </button>
            </motion.div>
          )}

          {needsSorted && (
            <div className="mt-3 px-3 py-2 bg-neon-cyan/10 border border-neon-cyan/30 rounded-lg">
              <p className="text-xs text-neon-cyan">✓ Array will be auto-sorted</p>
            </div>
          )}
        </div>

        {/* Target Value */}
        <div className="glass-card rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-text-secondary mb-3 flex items-center gap-2">
            <Target size={16} className="text-neon-pink" />
            Target Value
          </h3>
          <div className="flex gap-2">
            <input
              type="number"
              value={targetInput}
              onChange={(e) => handleTargetChange(e.target.value)}
              className="flex-1 px-4 py-3 bg-bg-secondary rounded-xl text-text-primary border border-border-color focus:border-neon-pink outline-none text-center font-mono text-lg"
            />
          </div>
          <p className="text-xs text-text-muted mt-2 text-center">
            Searching for: <span className="text-neon-pink font-mono font-bold">{target}</span>
          </p>
        </div>

        {/* Navigation Controls */}
        <div className="glass-card rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-text-secondary mb-3 flex items-center gap-2">
            <GitBranch size={16} className="text-neon-green" />
            Navigation
          </h3>
          
          <button
            onClick={() => resetState()}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-bg-secondary rounded-xl text-text-primary hover:bg-bg-card-hover transition-colors text-sm mb-3"
          >
            <RotateCcw size={14} />
            Reset
          </button>

          {isStepMode && steps.length > 0 && (
            <div className="flex gap-2 mb-3">
              <button
                onClick={prevStep}
                disabled={currentStepIndex <= -1}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-bg-secondary rounded-xl text-text-primary hover:bg-bg-card-hover transition-colors disabled:opacity-30"
              >
                <SkipBack size={18} />
                Prev
              </button>
              <button
                onClick={nextStep}
                disabled={currentStepIndex >= steps.length - 1}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-neon-cyan text-bg-primary rounded-xl hover:opacity-90 transition-opacity disabled:opacity-30"
              >
                Next
                <SkipForward size={18} />
              </button>
            </div>
          )}

          {!isStepMode && (
            <button
              onClick={startSearch}
              disabled={isRunning}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 bg-gradient-to-r from-neon-cyan to-neon-blue text-white hover:opacity-90"
            >
              <Search size={18} />
              Start Search
            </button>
          )}
        </div>

        {/* Algorithm Info */}
        <div className="glass-card rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-text-secondary mb-3 flex items-center gap-2">
            <Info size={16} className="text-neon-yellow" />
            Complexity
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">Time</span>
              <span className="font-mono text-neon-cyan">{selectedAlgo.timeComplexity.average}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Space</span>
              <span className="font-mono text-neon-purple">{selectedAlgo.spaceComplexity}</span>
            </div>
          </div>
          <p className="text-xs text-text-muted mt-3">{selectedAlgo.description}</p>
        </div>
      </div>

      {/* Middle Column - Visualization */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Stats Bar */}
        <div className="flex gap-4">
          <div className="glass-card rounded-xl px-6 py-3 flex-1">
            <div className="text-xs text-text-muted">Comparisons</div>
            <div className="text-2xl font-bold text-neon-yellow font-mono">{comparisons}</div>
          </div>
          <div className="glass-card rounded-xl px-6 py-3 flex-1">
            <div className="text-xs text-text-muted">Array Size</div>
            <div className="text-2xl font-bold text-neon-cyan font-mono">{array.length}</div>
          </div>
          <div className="glass-card rounded-xl px-6 py-3 flex-1">
            <div className="text-xs text-text-muted">Checked</div>
            <div className="text-2xl font-bold text-neon-purple font-mono">{checked.length}</div>
          </div>
          {steps.length > 0 && (
            <div className="glass-card rounded-xl px-6 py-3 flex-1">
              <div className="text-xs text-text-muted">Step</div>
              <div className="text-2xl font-bold text-neon-pink font-mono">
                {currentStepIndex + 1} / {steps.length}
              </div>
            </div>
          )}
        </div>

        {/* Result */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-center py-4 rounded-xl font-semibold text-lg ${
              found >= 0 ? 'bg-neon-green/20 border border-neon-green/50 text-neon-green' : 'bg-neon-red/20 border border-neon-red/50 text-neon-red'
            }`}
          >
            {result}
          </motion.div>
        )}

        {/* Visualization Area */}
        <div className="flex-1 glass-card rounded-2xl p-6">
          <div className="flex flex-wrap gap-2 justify-center items-center">
            {array.map((value, idx) => (
              <motion.div
                key={idx}
                className={`w-12 h-12 flex items-center justify-center rounded-lg border-2 font-mono font-bold text-sm transition-all duration-200 ${getCellColor(idx)}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.02 }}
              >
                {value}
              </motion.div>
            ))}
          </div>
          
          {/* Index labels */}
          <div className="flex flex-wrap gap-2 justify-center items-center mt-4">
            {array.map((_, idx) => (
              <div key={idx} className="w-12 text-center text-xs text-text-muted font-mono">
                [{idx}]
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 py-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-bg-secondary border border-border-color rounded" />
            <span className="text-sm text-text-muted">Unchecked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-neon-purple/30 border border-neon-purple/50 rounded" />
            <span className="text-sm text-text-muted">In Range</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-neon-cyan/40 border border-neon-cyan/60 rounded" />
            <span className="text-sm text-text-muted">Checked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-neon-yellow rounded" />
            <span className="text-sm text-text-muted">Current</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-neon-green rounded" />
            <span className="text-sm text-text-muted">Found</span>
          </div>
        </div>
      </div>

      {/* Right Column - Speed Control & Steps */}
      <div className="w-80 flex-shrink-0 flex flex-col gap-4">
        {/* Speed Control */}
        <div className="glass-card rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-text-secondary mb-3 flex items-center gap-2">
            <Gauge size={16} className="text-neon-orange" />
            Animation Speed
          </h3>
          <div className="space-y-2">
            {SPEED_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSpeed(opt.value)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                  speed === opt.value
                    ? 'bg-neon-orange/20 border border-neon-orange text-neon-orange'
                    : 'bg-bg-secondary text-text-muted hover:text-text-primary'
                }`}
              >
                <span className="font-medium">{opt.label}</span>
                <span className="font-mono text-xs">{opt.value}ms</span>
              </button>
            ))}
          </div>
        </div>

        {/* Step History */}
        <div className="glass-card rounded-2xl p-4 flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-text-secondary flex items-center gap-2">
              <List size={16} className="text-neon-purple" />
              Step History
            </h3>
            {steps.length > 0 && (
              <span className="text-xs text-text-muted">{steps.length} steps</span>
            )}
          </div>
          
          {steps.length > 0 ? (
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {steps.map((step, idx) => (
                <motion.div
                  key={idx}
                  onClick={() => goToStep(idx)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    idx === currentStepIndex
                      ? getStepColor(step.type) + ' scale-102 shadow-lg'
                      : 'border-border-color bg-bg-secondary hover:bg-bg-card-hover'
                  }`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.01 }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold uppercase ${
                      idx === currentStepIndex ? 'text-white' : 'text-text-muted'
                    }`}>
                      Step {idx + 1}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      step.type === 'compare' ? 'bg-neon-yellow/20 text-neon-yellow' :
                      step.type === 'found' ? 'bg-neon-green/20 text-neon-green' :
                      step.type === 'not-found' ? 'bg-neon-red/20 text-neon-red' :
                      'bg-neon-purple/20 text-neon-purple'
                    }`}>
                      {step.type}
                    </span>
                  </div>
                  <p className={`text-sm ${idx === currentStepIndex ? 'text-white' : 'text-text-primary'}`}>
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <Search size={48} className="mx-auto mb-3 text-text-muted opacity-30" />
                <p className="text-text-muted text-sm">
                  Click "Start Search" to see the search process step-by-step
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
