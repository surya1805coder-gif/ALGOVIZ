import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { treeAlgorithms } from '../data/algorithms';
import { Play, RotateCcw, Info, ChevronDown, Plus, TreePine } from 'lucide-react';

interface TNode {
  value: number;
  left: TNode | null;
  right: TNode | null;
}

interface PositionedNode {
  value: number;
  x: number;
  y: number;
  left: PositionedNode | null;
  right: PositionedNode | null;
}

const SPEED_OPTIONS = [
  { label: 'Slow', value: 600 },
  { label: 'Normal', value: 300 },
  { label: 'Fast', value: 100 },
];

function insertBST(root: TNode | null, value: number): TNode {
  if (!root) return { value, left: null, right: null };
  if (value < root.value) root.left = insertBST(root.left, value);
  else if (value > root.value) root.right = insertBST(root.right, value);
  return root;
}

function buildDefaultTree(): TNode {
  const values = [50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 45, 55, 65, 75, 90];
  let root: TNode | null = null;
  for (const v of values) {
    root = insertBST(root, v);
  }
  return root!;
}

function positionTree(root: TNode | null, width: number): PositionedNode | null {
  if (!root) return null;
  const levels: TNode[][] = [];
  const queue: (TNode | null)[] = [root];

  while (queue.length > 0) {
    const levelSize = queue.length;
    const level: TNode[] = [];
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      if (node) {
        level.push(node);
        queue.push(node.left);
        queue.push(node.right);
      } else {
        queue.push(null);
        queue.push(null);
      }
    }
    if (level.length === 0) break;
    levels.push(level);
    if (levels.length > 6) break;
  }

  // Assign positions using recursive layout
  const nodePositions = new Map<TNode, { x: number; y: number }>();
  const levelHeight = 70;
  const startY = 40;

  function assignX(node: TNode | null, left: number, right: number, depth: number): number {
    if (!node) return (left + right) / 2;
    const x = (left + right) / 2;
    nodePositions.set(node, { x, y: startY + depth * levelHeight });
    const mid = (left + right) / 2;
    assignX(node.left, left, mid, depth + 1);
    assignX(node.right, mid, right, depth + 1);
    return x;
  }

  assignX(root, 30, width - 30, 0);

  function buildPos(node: TNode | null): PositionedNode | null {
    if (!node) return null;
    const pos = nodePositions.get(node)!;
    return {
      value: node.value,
      x: pos.x,
      y: pos.y,
      left: buildPos(node.left),
      right: buildPos(node.right),
    };
  }

  return buildPos(root);
}

export default function TreeViz() {
  const [root, setRoot] = useState<TNode | null>(buildDefaultTree);
  const [selectedAlgo, setSelectedAlgo] = useState(treeAlgorithms[0]);
  const [speed, setSpeed] = useState(300);
  const [isRunning, setIsRunning] = useState(false);
  const [visited, setVisited] = useState<number[]>([]);
  const [current, setCurrent] = useState<number | null>(null);
  const [result, setResult] = useState<string>('');
  const [showAlgoDropdown, setShowAlgoDropdown] = useState(false);
  const [insertValue, setInsertValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [svgWidth, setSvgWidth] = useState(700);
  const containerRef = useRef<HTMLDivElement>(null);
  const stopRef = useRef(false);
  const speedRef = useRef(speed);

  useEffect(() => { speedRef.current = speed; }, [speed]);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setSvgWidth(containerRef.current.clientWidth - 32);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const sleep = useCallback(() => {
    return new Promise<void>((resolve) => {
      if (stopRef.current) { resolve(); return; }
      setTimeout(resolve, speedRef.current);
    });
  }, []);

  const resetViz = useCallback(() => {
    setVisited([]);
    setCurrent(null);
    setResult('');
    stopRef.current = false;
  }, []);

  const handleInsert = useCallback(() => {
    const val = parseInt(insertValue);
    if (isNaN(val)) return;
    stopRef.current = true;
    setIsRunning(false);
    resetViz();
    setRoot(prev => insertBST(prev, val));
    setInsertValue('');
  }, [insertValue, resetViz]);

  const handleNewTree = useCallback(() => {
    stopRef.current = true;
    setIsRunning(false);
    resetViz();
    const values = Array.from({ length: 12 }, () => Math.floor(Math.random() * 99) + 1);
    let newRoot: TNode | null = null;
    for (const v of values) {
      newRoot = insertBST(newRoot, v);
    }
    setRoot(newRoot);
  }, [resetViz]);

  // Collect all node values for position lookup
  const getAllNodes = useCallback((node: TNode | null): TNode[] => {
    if (!node) return [];
    return [node, ...getAllNodes(node.left), ...getAllNodes(node.right)];
  }, []);

  // Traversals
  const runInorder = useCallback(async () => {
    const order: number[] = [];
    const traverse = async (node: TNode | null) => {
      if (!node || stopRef.current) return;
      await traverse(node.left);
      if (stopRef.current) return;
      setCurrent(node.value);
      await sleep();
      order.push(node.value);
      setVisited([...order]);
      await traverse(node.right);
    };
    await traverse(root);
    setCurrent(null);
    setResult(`Inorder: ${order.join(' → ')}`);
  }, [root, sleep]);

  const runPreorder = useCallback(async () => {
    const order: number[] = [];
    const traverse = async (node: TNode | null) => {
      if (!node || stopRef.current) return;
      setCurrent(node.value);
      await sleep();
      order.push(node.value);
      setVisited([...order]);
      await traverse(node.left);
      await traverse(node.right);
    };
    await traverse(root);
    setCurrent(null);
    setResult(`Preorder: ${order.join(' → ')}`);
  }, [root, sleep]);

  const runPostorder = useCallback(async () => {
    const order: number[] = [];
    const traverse = async (node: TNode | null) => {
      if (!node || stopRef.current) return;
      await traverse(node.left);
      await traverse(node.right);
      if (stopRef.current) return;
      setCurrent(node.value);
      await sleep();
      order.push(node.value);
      setVisited([...order]);
    };
    await traverse(root);
    setCurrent(null);
    setResult(`Postorder: ${order.join(' → ')}`);
  }, [root, sleep]);

  const runLevelOrder = useCallback(async () => {
    if (!root) return;
    const order: number[] = [];
    const queue: TNode[] = [root];
    while (queue.length > 0) {
      if (stopRef.current) return;
      const node = queue.shift()!;
      setCurrent(node.value);
      await sleep();
      order.push(node.value);
      setVisited([...order]);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    setCurrent(null);
    setResult(`Level Order: ${order.join(' → ')}`);
  }, [root, sleep]);

  const runBSTSearch = useCallback(async () => {
    const target = parseInt(searchValue);
    if (isNaN(target) || !root) return;
    let node = root;
    const path: number[] = [];
    while (node) {
      if (stopRef.current) return;
      setCurrent(node.value);
      path.push(node.value);
      setVisited([...path]);
      await sleep();
      if (node.value === target) {
        setCurrent(null);
        setResult(`Found ${target}! Path: ${path.join(' → ')}`);
        return;
      } else if (target < node.value) {
        node = node.left!;
      } else {
        node = node.right!;
      }
    }
    setCurrent(null);
    setResult(`${target} not found in BST`);
  }, [root, searchValue, sleep]);

  const runBSTInsert = useCallback(async () => {
    const val = parseInt(insertValue);
    if (isNaN(val) || !root) return;

    // Animate the insertion path
    const path: number[] = [];
    let node: TNode | null = root;
    while (node) {
      if (stopRef.current) return;
      setCurrent(node.value);
      path.push(node.value);
      setVisited([...path]);
      await sleep();
      if (val < node.value) {
        if (!node.left) break;
        node = node.left;
      } else if (val > node.value) {
        if (!node.right) break;
        node = node.right;
      } else {
        setCurrent(null);
        setResult(`${val} already exists in BST`);
        return;
      }
    }

    // Insert
    setRoot(prev => insertBST(prev, val));
    setCurrent(null);
    setResult(`Inserted ${val}! Path: ${path.join(' → ')}`);
    setInsertValue('');
  }, [root, insertValue, sleep]);

  const runAlgorithm = useCallback(async () => {
    if (isRunning) {
      stopRef.current = true;
      setIsRunning(false);
      return;
    }

    if (selectedAlgo.id === 'bst-search' && !searchValue) return;
    if (selectedAlgo.id === 'bst-insert' && !insertValue) return;

    setIsRunning(true);
    resetViz();

    const algoMap: Record<string, () => Promise<void>> = {
      inorder: runInorder,
      preorder: runPreorder,
      postorder: runPostorder,
      levelorder: runLevelOrder,
      'bst-search': runBSTSearch,
      'bst-insert': runBSTInsert,
    };

    const algo = algoMap[selectedAlgo.id];
    if (algo) await algo();
    setIsRunning(false);
  }, [isRunning, selectedAlgo, searchValue, insertValue, resetViz, runInorder, runPreorder, runPostorder, runLevelOrder, runBSTSearch, runBSTInsert]);

  const positionedTree = positionTree(root, svgWidth);

  const getNodeColor = (value: number): string => {
    if (current === value) return '#ffe600';
    if (visited.includes(value)) return '#39ff14';
    return '#4d7cff';
  };

  const getNodeGlow = (value: number): string => {
    if (current === value) return '0 0 15px #ffe600, 0 0 30px #ffe600';
    if (visited.includes(value)) return '0 0 8px #39ff14';
    return '0 0 5px #4d7cff';
  };

  // Render tree edges and nodes
  const renderTree = (node: PositionedNode | null): React.ReactElement[] => {
    if (!node) return [];
    const elements: React.ReactElement[] = [];

    if (node.left) {
      elements.push(
        <line
          key={`edge-${node.value}-${node.left.value}`}
          x1={node.x} y1={node.y}
          x2={node.left.x} y2={node.left.y}
          stroke={visited.includes(node.value) && visited.includes(node.left.value) ? '#39ff1455' : '#2a2a5a'}
          strokeWidth="2"
          style={{ transition: 'stroke 0.3s' }}
        />
      );
      elements.push(...renderTree(node.left));
    }
    if (node.right) {
      elements.push(
        <line
          key={`edge-${node.value}-${node.right.value}`}
          x1={node.x} y1={node.y}
          x2={node.right.x} y2={node.right.y}
          stroke={visited.includes(node.value) && visited.includes(node.right.value) ? '#39ff1455' : '#2a2a5a'}
          strokeWidth="2"
          style={{ transition: 'stroke 0.3s' }}
        />
      );
      elements.push(...renderTree(node.right));
    }

    elements.push(
      <g key={`node-${node.value}`}>
        <motion.circle
          cx={node.x}
          cy={node.y}
          r={18}
          fill={getNodeColor(node.value)}
          stroke="#0a0a1a"
          strokeWidth="2"
          style={{ filter: getNodeGlow(node.value) }}
          animate={{ r: current === node.value ? 22 : 18 }}
          transition={{ duration: 0.2 }}
        />
        <text
          x={node.x}
          y={node.y + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#0a0a1a"
          fontSize="11"
          fontWeight="bold"
          fontFamily="monospace"
        >
          {node.value}
        </text>
      </g>
    );

    return elements;
  };

  const levelColors: Record<string, string> = {
    beginner: 'text-neon-green',
    intermediate: 'text-neon-yellow',
    advanced: 'text-neon-red',
  };

  const levelBg: Record<string, string> = {
    beginner: 'bg-neon-green/10 border-neon-green/30',
    intermediate: 'bg-neon-yellow/10 border-neon-yellow/30',
    advanced: 'bg-neon-red/10 border-neon-red/30',
  };

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="glass-card rounded-2xl p-4 mb-4 relative z-20 overflow-visible">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative isolate overflow-visible">
            <button
              onClick={() => setShowAlgoDropdown(!showAlgoDropdown)}
              className="flex items-center gap-2 px-4 py-2.5 bg-bg-secondary rounded-xl border border-border-color hover:border-neon-cyan/50 transition-all text-sm font-medium"
            >
              <TreePine size={14} className="text-neon-cyan" />
              <span className="text-neon-cyan">{selectedAlgo.name}</span>
              <ChevronDown size={14} className="text-text-muted" />
            </button>
            {showAlgoDropdown && (
              <div className="absolute top-full left-0 mt-2 z-[100] glass-card rounded-xl overflow-hidden min-w-[240px] border border-border-color shadow-2xl shadow-black/50">
                {treeAlgorithms.map(algo => (
                  <button
                    key={algo.id}
                    onClick={() => { setSelectedAlgo(algo); setShowAlgoDropdown(false); stopRef.current = true; setIsRunning(false); resetViz(); }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-bg-card-hover transition-colors flex items-center justify-between ${algo.id === selectedAlgo.id ? 'text-neon-cyan bg-neon-cyan/5' : 'text-text-primary'}`}
                  >
                    {algo.name}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${levelBg[algo.level]} ${levelColors[algo.level]}`}>{algo.level}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Input */}
          {selectedAlgo.id === 'bst-search' && (
            <div className="flex items-center gap-2">
              <span className="text-text-muted text-xs">Search:</span>
              <input
                type="number"
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                disabled={isRunning}
                className="w-20 px-3 py-2 bg-bg-primary rounded-lg border border-border-color text-neon-orange font-mono text-sm text-center focus:border-neon-orange/50 focus:outline-none disabled:opacity-50"
                placeholder="50"
              />
            </div>
          )}

          {/* Insert Input */}
          {selectedAlgo.id === 'bst-insert' && (
            <div className="flex items-center gap-2">
              <span className="text-text-muted text-xs">Insert:</span>
              <input
                type="number"
                value={insertValue}
                onChange={e => setInsertValue(e.target.value)}
                disabled={isRunning}
                className="w-20 px-3 py-2 bg-bg-primary rounded-lg border border-border-color text-neon-green font-mono text-sm text-center focus:border-neon-green/50 focus:outline-none disabled:opacity-50"
                placeholder="42"
              />
            </div>
          )}

          {/* Speed */}
          <div className="flex items-center gap-1.5">
            {SPEED_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSpeed(opt.value)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${speed === opt.value ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple/40' : 'bg-bg-secondary text-text-muted border border-border-color hover:text-text-primary'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          {/* Quick Insert (always visible) */}
          {selectedAlgo.id !== 'bst-insert' && (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={insertValue}
                onChange={e => setInsertValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleInsert()}
                disabled={isRunning}
                className="w-20 px-3 py-2 bg-bg-primary rounded-lg border border-border-color text-neon-green font-mono text-sm text-center focus:border-neon-green/50 focus:outline-none disabled:opacity-50"
                placeholder="+ value"
              />
              <button onClick={handleInsert} disabled={isRunning || !insertValue} className="p-2 rounded-lg bg-neon-green/10 text-neon-green border border-neon-green/30 hover:bg-neon-green/20 transition-all disabled:opacity-50">
                <Plus size={14} />
              </button>
            </div>
          )}

          <button onClick={handleNewTree} disabled={isRunning} className="p-2.5 rounded-xl bg-bg-secondary border border-border-color hover:border-neon-cyan/50 text-neon-cyan transition-all disabled:opacity-50">
            <RotateCcw size={16} />
          </button>
          <button onClick={runAlgorithm} className={`p-2.5 rounded-xl transition-all ${isRunning ? 'bg-neon-orange/20 text-neon-orange border border-neon-orange/40' : 'bg-neon-green/20 text-neon-green border border-neon-green/40 hover:bg-neon-green/30'}`}>
            {isRunning ? <RotateCcw size={16} /> : <Play size={16} />}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 mb-4 px-2 flex-wrap">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 rounded-full bg-neon-yellow" />
          <span className="text-text-muted">Current</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 rounded-full bg-neon-green" />
          <span className="text-text-muted">Visited</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 rounded-full bg-neon-blue" />
          <span className="text-text-muted">Unvisited</span>
        </div>
        <div className="flex-1" />
        <div className="text-sm text-text-muted">
          Nodes: <span className="text-neon-cyan font-mono font-bold">{getAllNodes(root).length}</span>
        </div>
        {result && (
          <div className="text-xs text-neon-green font-medium max-w-lg truncate">{result}</div>
        )}
      </div>

      {/* Tree Visualization */}
      <div ref={containerRef} className="flex-1 glass-card rounded-2xl p-4 relative overflow-hidden min-h-[350px]">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(rgba(77,124,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(77,124,255,0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        <svg className="w-full h-full relative z-10" viewBox={`0 0 ${svgWidth} 480`} preserveAspectRatio="xMidYMid meet">
          {positionedTree ? renderTree(positionedTree) : (
            <text x={svgWidth / 2} y={240} textAnchor="middle" fill="#6666aa" fontSize="16">Empty tree — insert values to begin</text>
          )}
        </svg>
      </div>

      {/* Info Panel */}
      <div className="glass-card rounded-2xl p-4 mt-4">
        <div className="flex items-start gap-3">
          <Info size={18} className="text-neon-cyan mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-neon-cyan font-bold text-sm mb-1">{selectedAlgo.name}</h3>
            <p className="text-text-secondary text-xs mb-3">{selectedAlgo.description}</p>
            <div className="flex flex-wrap gap-3">
              <div className="px-3 py-1.5 rounded-lg bg-bg-primary border border-border-color">
                <span className="text-[10px] text-text-muted uppercase tracking-wider">Time</span>
                <span className="text-neon-yellow font-mono text-xs ml-2">{selectedAlgo.timeComplexity.average}</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-bg-primary border border-border-color">
                <span className="text-[10px] text-text-muted uppercase tracking-wider">Space</span>
                <span className="text-neon-purple font-mono text-xs ml-2">{selectedAlgo.spaceComplexity}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
