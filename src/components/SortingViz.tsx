import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sortingAlgorithms } from '../data/algorithms';
import { AlgorithmInfo, SortingStep } from '../types';
import { Play, Pause, RotateCcw, Shuffle, Info, ChevronDown, SkipBack, SkipForward, List, Gauge, Code, Layers, GitBranch, Edit3 } from 'lucide-react';

const SPEED_OPTIONS = [
  { label: '🐢 Slow', value: 500 },
  { label: '🚶 Normal', value: 200 },
  { label: '⚡ Fast', value: 80 },
  { label: '🚀 Very Fast', value: 30 },
  { label: '⚡ Instant', value: 5 },
];

const SIZE_OPTIONS = [
  { label: '10', value: 10 },
  { label: '25', value: 25 },
  { label: '50', value: 50 },
  { label: '75', value: 75 },
  { label: '100', value: 100 },
];

function generateArray(size: number): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 95) + 5);
}

export default function SortingViz() {
  const [array, setArray] = useState<number[]>(() => generateArray(25));
  const [comparing, setComparing] = useState<number[]>([]);
  const [swapping, setSwapping] = useState<number[]>([]);
  const [sorted, setSorted] = useState<number[]>([]);
  const [selectedAlgo, setSelectedAlgo] = useState<AlgorithmInfo>(sortingAlgorithms[0]);
  const [speed, setSpeed] = useState(200);
  const [size, setSize] = useState(25);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [comparisons, setComparisons] = useState(0);
  const [swaps, setSwaps] = useState(0);
  const [showAlgoDropdown, setShowAlgoDropdown] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  
  // Step-by-step state
  const [steps, setSteps] = useState<SortingStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isStepMode, setIsStepMode] = useState(false);

  const stopRef = useRef(false);
  const pauseRef = useRef(false);
  const speedRef = useRef(speed);

  useEffect(() => { speedRef.current = speed; }, [speed]);

  const sleep = useCallback(() => {
    return new Promise<void>((resolve) => {
      const check = () => {
        if (stopRef.current) { resolve(); return; }
        if (pauseRef.current) { setTimeout(check, 50); return; }
        setTimeout(resolve, speedRef.current);
      };
      check();
    });
  }, []);

  const resetState = useCallback(() => {
    setComparing([]);
    setSwapping([]);
    setSorted([]);
    setComparisons(0);
    setSwaps(0);
    stopRef.current = false;
    pauseRef.current = false;
    setIsPaused(false);
    setSteps([]);
    setCurrentStepIndex(-1);
    setIsStepMode(false);
  }, []);

  const handleNewArray = useCallback(() => {
    stopRef.current = true;
    setIsRunning(false);
    resetState();
    const newArr = generateArray(size);
    setArray(newArr);
  }, [size, resetState]);

  const handleCustomArray = useCallback(() => {
    const nums = customInput.split(/[\s,]+/).map(Number).filter(n => !isNaN(n) && n > 0 && n <= 100);
    if (nums.length > 0) {
      stopRef.current = true;
      setIsRunning(false);
      resetState();
      setArray(nums);
      setSize(nums.length);
      setShowCustomInput(false);
      setCustomInput('');
    }
  }, [customInput, resetState]);

  const handleSizeChange = useCallback((newSize: number) => {
    setSize(newSize);
    stopRef.current = true;
    setIsRunning(false);
    resetState();
    setArray(generateArray(newSize));
  }, [resetState]);

  const togglePause = useCallback(() => {
    pauseRef.current = !pauseRef.current;
    setIsPaused(!isPaused);
  }, [isPaused]);

  // Stop handler - kept for future use
  const handleStop = useCallback(() => {
    stopRef.current = true;
    setIsRunning(false);
    resetState();
  }, [resetState]);
  void(handleStop);

  // Add step to history
  const addStep = useCallback((type: 'compare' | 'swap' | 'sorted', indices: number[], description: string, arrayState: number[]) => {
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
      setArray(generateArray(size));
      setComparing([]);
      setSwapping([]);
      setSorted([]);
      return;
    }
    
    const step = steps[stepIndex];
    setArray(step.arrayState);
    
    if (step.type === 'compare') {
      setComparing(step.indices);
      setSwapping([]);
    } else if (step.type === 'swap') {
      setComparing([]);
      setSwapping(step.indices);
    } else if (step.type === 'sorted') {
      setComparing([]);
      setSwapping([]);
      setSorted(step.indices);
    }
  }, [steps, size]);

  const nextStep = useCallback(() => {
    goToStep(currentStepIndex + 1);
  }, [currentStepIndex, goToStep]);

  const prevStep = useCallback(() => {
    goToStep(currentStepIndex - 1);
  }, [currentStepIndex, goToStep]);

  // Generate all steps for step-by-step mode
  const generateSteps = useCallback(async () => {
    const arr = [...array];
    const generatedSteps: SortingStep[] = [];
    let comp = 0, sw = 0;

    const addGeneratedStep = (type: 'compare' | 'swap' | 'sorted', indices: number[], description: string) => {
      generatedSteps.push({
        type,
        indices,
        description,
        arrayState: [...arr],
        timestamp: Date.now()
      });
    };

    // Algorithm selection
    switch(selectedAlgo.id) {
      case 'bubble':
        for (let i = 0; i < arr.length; i++) {
          for (let j = 0; j < arr.length - i - 1; j++) {
            addGeneratedStep('compare', [j, j + 1], `Compare ${arr[j]} and ${arr[j + 1]}`);
            comp++;
            if (arr[j] > arr[j + 1]) {
              [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
              addGeneratedStep('swap', [j, j + 1], `Swap ${arr[j + 1]} and ${arr[j]}`);
              sw++;
            }
          }
          addGeneratedStep('sorted', [arr.length - 1 - i], `Element ${arr[arr.length - 1 - i]} is sorted`);
        }
        break;
      
      case 'selection':
        for (let i = 0; i < arr.length - 1; i++) {
          let minIdx = i;
          for (let j = i + 1; j < arr.length; j++) {
            addGeneratedStep('compare', [minIdx, j], `Compare ${arr[minIdx]} and ${arr[j]}`);
            comp++;
            if (arr[j] < arr[minIdx]) {
              minIdx = j;
            }
          }
          if (minIdx !== i) {
            [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
            addGeneratedStep('swap', [i, minIdx], `Swap ${arr[minIdx]} and ${arr[i]}`);
            sw++;
          }
          addGeneratedStep('sorted', [i], `Element ${arr[i]} is sorted`);
        }
        addGeneratedStep('sorted', [arr.length - 1], `Element ${arr[arr.length - 1]} is sorted`);
        break;
      
      case 'insertion':
        for (let i = 1; i < arr.length; i++) {
          let key = arr[i];
          let j = i - 1;
          addGeneratedStep('compare', [i], `Selecting ${key} to insert`);
          while (j >= 0 && arr[j] > key) {
            addGeneratedStep('compare', [j, j + 1], `Compare ${arr[j]} and ${key}`);
            comp++;
            arr[j + 1] = arr[j];
            addGeneratedStep('swap', [j, j + 1], `Shift ${arr[j]} right`);
            sw++;
            j--;
          }
          arr[j + 1] = key;
        }
        addGeneratedStep('sorted', Array.from({ length: arr.length }, (_, i) => i), 'Array is fully sorted');
        break;
    }

    setSteps(generatedSteps);
    setIsStepMode(true);
    setCurrentStepIndex(-1);
  }, [array, selectedAlgo]);

  // Sorting Algorithms with step recording
  const runBubbleSort = useCallback(async () => {
    const arr = [...array];
    let comp = 0, sw = 0;
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr.length - i - 1; j++) {
        if (stopRef.current) return;
        setComparing([j, j + 1]);
        comp++;
        setComparisons(comp);
        addStep('compare', [j, j + 1], `Compare ${arr[j]} and ${arr[j + 1]}`, arr);
        await sleep();
        if (arr[j] > arr[j + 1]) {
          setSwapping([j, j + 1]);
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          sw++;
          setSwaps(sw);
          setArray([...arr]);
          addStep('swap', [j, j + 1], `Swap ${arr[j + 1]} and ${arr[j]}`, arr);
          await sleep();
          setSwapping([]);
        }
        setComparing([]);
      }
      setSorted(prev => [...prev, arr.length - 1 - i]);
      addStep('sorted', [arr.length - 1 - i], `Element ${arr[arr.length - 1 - i]} is sorted`, arr);
    }
  }, [array, sleep, addStep]);

  const runSelectionSort = useCallback(async () => {
    const arr = [...array];
    let comp = 0, sw = 0;
    for (let i = 0; i < arr.length - 1; i++) {
      let minIdx = i;
      setComparing([i]);
      for (let j = i + 1; j < arr.length; j++) {
        if (stopRef.current) return;
        setComparing([minIdx, j]);
        comp++;
        setComparisons(comp);
        addStep('compare', [minIdx, j], `Compare ${arr[minIdx]} and ${arr[j]}`, arr);
        await sleep();
        if (arr[j] < arr[minIdx]) {
          minIdx = j;
        }
      }
      if (minIdx !== i) {
        setSwapping([i, minIdx]);
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        sw++;
        setSwaps(sw);
        setArray([...arr]);
        addStep('swap', [i, minIdx], `Swap ${arr[minIdx]} and ${arr[i]}`, arr);
        await sleep();
        setSwapping([]);
      }
      setComparing([]);
      setSorted(prev => [...prev, i]);
      addStep('sorted', [i], `Element ${arr[i]} is sorted`, arr);
    }
    setSorted(prev => [...prev, arr.length - 1]);
  }, [array, sleep, addStep]);

  const runInsertionSort = useCallback(async () => {
    const arr = [...array];
    let comp = 0, sw = 0;
    for (let i = 1; i < arr.length; i++) {
      let key = arr[i];
      let j = i - 1;
      setComparing([i]);
      addStep('compare', [i], `Selecting ${key} to insert`, arr);
      await sleep();
      while (j >= 0 && arr[j] > key) {
        if (stopRef.current) return;
        setComparing([j, j + 1]);
        comp++;
        setComparisons(comp);
        setSwapping([j, j + 1]);
        arr[j + 1] = arr[j];
        sw++;
        setSwaps(sw);
        setArray([...arr]);
        addStep('swap', [j, j + 1], `Shift ${arr[j]} right`, arr);
        await sleep();
        setSwapping([]);
        j--;
      }
      arr[j + 1] = key;
      setArray([...arr]);
      setComparing([]);
    }
    setSorted(Array.from({ length: arr.length }, (_, i) => i));
    addStep('sorted', Array.from({ length: arr.length }, (_, i) => i), 'Array is fully sorted', arr);
  }, [array, sleep, addStep]);

  const runMergeSort = useCallback(async () => {
    const arr = [...array];
    let comp = 0, sw = 0;

    const merge = async (l: number, m: number, r: number) => {
      const left = arr.slice(l, m + 1);
      const right = arr.slice(m + 1, r + 1);
      let i = 0, j = 0, k = l;
      
      while (i < left.length && j < right.length) {
        if (stopRef.current) return;
        setComparing([l + i, m + 1 + j]);
        comp++;
        setComparisons(comp);
        addStep('compare', [l + i, m + 1 + j], `Compare ${left[i]} and ${right[j]}`, arr);
        await sleep();
        
        if (left[i] <= right[j]) {
          arr[k] = left[i];
          i++;
        } else {
          arr[k] = right[j];
          j++;
        }
        sw++;
        setSwaps(sw);
        setArray([...arr]);
        addStep('swap', [k], `Place ${arr[k]} at position ${k}`, arr);
        k++;
      }
      
      while (i < left.length) {
        arr[k] = left[i];
        setArray([...arr]);
        i++; k++;
      }
      while (j < right.length) {
        arr[k] = right[j];
        setArray([...arr]);
        j++; k++;
      }
    };

    const sort = async (l: number, r: number) => {
      if (l >= r || stopRef.current) return;
      const m = Math.floor((l + r) / 2);
      await sort(l, m);
      await sort(m + 1, r);
      await merge(l, m, r);
    };

    await sort(0, arr.length - 1);
    setSorted(Array.from({ length: arr.length }, (_, i) => i));
  }, [array, sleep, addStep]);

  const runQuickSort = useCallback(async () => {
    const arr = [...array];
    let comp = 0, sw = 0;

    const partition = async (low: number, high: number): Promise<number> => {
      const pivot = arr[high];
      let i = low - 1;
      
      for (let j = low; j < high; j++) {
        if (stopRef.current) return -1;
        setComparing([j, high]);
        comp++;
        setComparisons(comp);
        addStep('compare', [j, high], `Compare ${arr[j]} with pivot ${pivot}`, arr);
        await sleep();
        
        if (arr[j] < pivot) {
          i++;
          if (i !== j) {
            setSwapping([i, j]);
            [arr[i], arr[j]] = [arr[j], arr[i]];
            sw++;
            setSwaps(sw);
            setArray([...arr]);
            addStep('swap', [i, j], `Swap ${arr[j]} and ${arr[i]}`, arr);
            await sleep();
            setSwapping([]);
          }
        }
      }
      
      setSwapping([i + 1, high]);
      [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
      sw++;
      setSwaps(sw);
      setArray([...arr]);
      addStep('swap', [i + 1, high], `Place pivot ${pivot} in correct position`, arr);
      await sleep();
      setSwapping([]);
      
      return i + 1;
    };

    const sort = async (low: number, high: number) => {
      if (low < high && !stopRef.current) {
        const pi = await partition(low, high);
        if (pi !== -1) {
          setSorted(prev => [...prev, pi]);
          await sort(low, pi - 1);
          await sort(pi + 1, high);
        }
      }
    };

    await sort(0, arr.length - 1);
    setSorted(Array.from({ length: arr.length }, (_, i) => i));
  }, [array, sleep, addStep]);

  const runHeapSort = useCallback(async () => {
    const arr = [...array];
    let comp = 0, sw = 0;
    const n = arr.length;

    const heapify = async (n: number, i: number) => {
      let largest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      
      if (left < n) {
        setComparing([largest, left]);
        comp++;
        setComparisons(comp);
        addStep('compare', [largest, left], `Compare root ${arr[largest]} with left child ${arr[left]}`, arr);
        await sleep();
        if (arr[left] > arr[largest]) largest = left;
      }
      
      if (right < n) {
        setComparing([largest, right]);
        comp++;
        setComparisons(comp);
        addStep('compare', [largest, right], `Compare root ${arr[largest]} with right child ${arr[right]}`, arr);
        await sleep();
        if (arr[right] > arr[largest]) largest = right;
      }
      
      if (largest !== i) {
        setSwapping([i, largest]);
        [arr[i], arr[largest]] = [arr[largest], arr[i]];
        sw++;
        setSwaps(sw);
        setArray([...arr]);
        addStep('swap', [i, largest], `Swap ${arr[largest]} and ${arr[i]}`, arr);
        await sleep();
        setSwapping([]);
        await heapify(n, largest);
      }
    };

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      if (stopRef.current) return;
      await heapify(n, i);
    }

    for (let i = n - 1; i > 0; i--) {
      if (stopRef.current) return;
      setSwapping([0, i]);
      [arr[0], arr[i]] = [arr[i], arr[0]];
      sw++;
      setSwaps(sw);
      setArray([...arr]);
      addStep('swap', [0, i], `Move root ${arr[i]} to end`, arr);
      await sleep();
      setSwapping([]);
      setSorted(prev => [...prev, i]);
      await heapify(i, 0);
    }
    setSorted(Array.from({ length: arr.length }, (_, i) => i));
  }, [array, sleep, addStep]);

  const startSort = useCallback(async () => {
    setIsRunning(true);
    resetState();
    
    switch(selectedAlgo.id) {
      case 'bubble': await runBubbleSort(); break;
      case 'selection': await runSelectionSort(); break;
      case 'insertion': await runInsertionSort(); break;
      case 'merge': await runMergeSort(); break;
      case 'quick': await runQuickSort(); break;
      case 'heap': await runHeapSort(); break;
    }
    
    setIsRunning(false);
    setComparing([]);
    setSwapping([]);
  }, [selectedAlgo, runBubbleSort, runSelectionSort, runInsertionSort, runMergeSort, runQuickSort, runHeapSort, resetState]);

  const getBarColor = (idx: number) => {
    if (sorted.includes(idx)) return 'bg-neon-green';
    if (swapping.includes(idx)) return 'bg-neon-pink';
    if (comparing.includes(idx)) return 'bg-neon-yellow';
    return 'bg-neon-cyan/60';
  };

  const getStepColor = (type: string) => {
    switch(type) {
      case 'compare': return 'border-neon-yellow bg-neon-yellow/10';
      case 'swap': return 'border-neon-pink bg-neon-pink/10';
      case 'sorted': return 'border-neon-green bg-neon-green/10';
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
            <Code size={16} className="text-neon-pink" />
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
                  {sortingAlgorithms.map((algo) => (
                    <button
                      key={algo.id}
                      onClick={() => { setSelectedAlgo(algo); setShowAlgoDropdown(false); }}
                      className={`w-full px-4 py-3 text-left hover:bg-bg-secondary transition-colors ${
                        selectedAlgo.id === algo.id ? 'bg-neon-pink/10 text-neon-pink' : 'text-text-primary'
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
            <Layers size={16} className="text-neon-cyan" />
            Array Settings
          </h3>
          
          <div className="mb-3">
            <label className="text-xs text-text-muted mb-1 block">Size</label>
            <div className="flex gap-2 flex-wrap">
              {SIZE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSizeChange(opt.value)}
                  disabled={isRunning}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    size === opt.value
                      ? 'bg-neon-cyan text-bg-primary'
                      : 'bg-bg-secondary text-text-muted hover:text-text-primary'
                  } disabled:opacity-50`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

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
                placeholder="e.g., 64, 34, 25, 12, 22"
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
        </div>

        {/* Navigation Controls */}
        <div className="glass-card rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-text-secondary mb-3 flex items-center gap-2">
            <GitBranch size={16} className="text-neon-green" />
            Navigation
          </h3>
          
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={() => { resetState(); setArray(generateArray(size)); }}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-bg-secondary rounded-xl text-text-primary hover:bg-bg-card-hover transition-colors text-sm"
            >
              <RotateCcw size={14} />
              Reset
            </button>
            <button
              onClick={generateSteps}
              disabled={isRunning || steps.length > 0}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-neon-purple/20 text-neon-purple rounded-xl hover:bg-neon-purple/30 transition-colors text-sm disabled:opacity-50"
            >
              <List size={14} />
              Prep Steps
            </button>
          </div>

          {isStepMode && steps.length > 0 && (
            <div className="flex gap-2">
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
              onClick={isRunning ? togglePause : startSort}
              disabled={isStepMode && steps.length > 0}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 ${
                isPaused
                  ? 'bg-neon-yellow text-bg-primary'
                  : isRunning
                  ? 'bg-neon-pink text-white'
                  : 'bg-gradient-to-r from-neon-pink to-neon-orange text-white hover:opacity-90'
              }`}
            >
              {isRunning ? (isPaused ? <Play size={18} /> : <Pause size={18} />) : <Play size={18} />}
              {isRunning ? (isPaused ? 'Resume' : 'Pause') : 'Start Sorting'}
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
              <span className="text-text-muted">Best Case</span>
              <span className="font-mono text-neon-green">{selectedAlgo.timeComplexity.best}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Average</span>
              <span className="font-mono text-neon-yellow">{selectedAlgo.timeComplexity.average}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Worst Case</span>
              <span className="font-mono text-neon-red">{selectedAlgo.timeComplexity.worst}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Space</span>
              <span className="font-mono text-neon-purple">{selectedAlgo.spaceComplexity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Stable</span>
              <span>{selectedAlgo.stable ? '✅ Yes' : '❌ No'}</span>
            </div>
          </div>
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
            <div className="text-xs text-text-muted">Swaps</div>
            <div className="text-2xl font-bold text-neon-pink font-mono">{swaps}</div>
          </div>
          <div className="glass-card rounded-xl px-6 py-3 flex-1">
            <div className="text-xs text-text-muted">Array Size</div>
            <div className="text-2xl font-bold text-neon-cyan font-mono">{array.length}</div>
          </div>
          {isStepMode && steps.length > 0 && (
            <div className="glass-card rounded-xl px-6 py-3 flex-1">
              <div className="text-xs text-text-muted">Step</div>
              <div className="text-2xl font-bold text-neon-purple font-mono">
                {currentStepIndex + 1} / {steps.length}
              </div>
            </div>
          )}
        </div>

        {/* Visualization Area */}
        <div className="flex-1 glass-card rounded-2xl p-6 flex items-end justify-center">
          <div className="flex items-end gap-0.5 h-full w-full max-w-5xl">
            {array.map((value, idx) => (
              <motion.div
                key={idx}
                className={`${getBarColor(idx)} rounded-t-sm relative group`}
                style={{ height: `${value}%`, flex: 1 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.002 }}
              >
                {array.length <= 30 && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-mono text-text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    {value}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 py-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-neon-cyan/60 rounded" />
            <span className="text-sm text-text-muted">Unsorted</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-neon-yellow rounded" />
            <span className="text-sm text-text-muted">Comparing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-neon-pink rounded" />
            <span className="text-sm text-text-muted">Swapping</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-neon-green rounded" />
            <span className="text-sm text-text-muted">Sorted</span>
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
          
          {(isStepMode || steps.length > 0) ? (
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
                      step.type === 'swap' ? 'bg-neon-pink/20 text-neon-pink' :
                      'bg-neon-green/20 text-neon-green'
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
                <List size={48} className="mx-auto mb-3 text-text-muted opacity-30" />
                <p className="text-text-muted text-sm">
                  Click "Start Sorting" to see steps<br />
                  or "Prep Steps" for manual navigation
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
