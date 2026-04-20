import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { graphAlgorithms } from '../data/algorithms';
import { Play, RotateCcw, Info, ChevronDown, Network } from 'lucide-react';

interface GNode {
  id: string;
  x: number;
  y: number;
  label: string;
}

interface GEdge {
  from: string;
  to: string;
  weight: number;
}

const SPEED_OPTIONS = [
  { label: 'Slow', value: 600 },
  { label: 'Normal', value: 300 },
  { label: 'Fast', value: 100 },
];

const defaultNodes: GNode[] = [
  { id: 'A', x: 200, y: 80, label: 'A' },
  { id: 'B', x: 80, y: 180, label: 'B' },
  { id: 'C', x: 320, y: 180, label: 'C' },
  { id: 'D', x: 60, y: 300, label: 'D' },
  { id: 'E', x: 200, y: 280, label: 'E' },
  { id: 'F', x: 340, y: 300, label: 'F' },
  { id: 'G', x: 200, y: 400, label: 'G' },
];

const defaultEdges: GEdge[] = [
  { from: 'A', to: 'B', weight: 4 },
  { from: 'A', to: 'C', weight: 2 },
  { from: 'B', to: 'D', weight: 5 },
  { from: 'B', to: 'E', weight: 10 },
  { from: 'C', to: 'E', weight: 3 },
  { from: 'C', to: 'F', weight: 8 },
  { from: 'D', to: 'G', weight: 6 },
  { from: 'E', to: 'G', weight: 7 },
  { from: 'F', to: 'G', weight: 1 },
];

export default function GraphViz() {
  const [nodes, setNodes] = useState<GNode[]>(defaultNodes);
  const [edges, setEdges] = useState<GEdge[]>(defaultEdges);
  const [selectedAlgo, setSelectedAlgo] = useState(graphAlgorithms[0]);
  const [speed, setSpeed] = useState(300);
  const [isRunning, setIsRunning] = useState(false);
  const [visited, setVisited] = useState<string[]>([]);
  const [current, setCurrent] = useState<string | null>(null);
  const [activeEdge, setActiveEdge] = useState<{ from: string; to: string } | null>(null);
  const [result, setResult] = useState<string>('');
  const [distances, setDistances] = useState<Record<string, number>>({});
  const [showAlgoDropdown, setShowAlgoDropdown] = useState(false);
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [edgeFrom, setEdgeFrom] = useState('');
  const [edgeTo, setEdgeTo] = useState('');
  const [edgeWeight, setEdgeWeight] = useState('1');
  const [showAddNode, setShowAddNode] = useState(false);
  const [showAddEdge, setShowAddEdge] = useState(false);
  const [startNode, setStartNode] = useState('A');

  const stopRef = useRef(false);
  const speedRef = useRef(speed);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => { speedRef.current = speed; }, [speed]);

  const sleep = useCallback(() => {
    return new Promise<void>((resolve) => {
      if (stopRef.current) { resolve(); return; }
      setTimeout(resolve, speedRef.current);
    });
  }, []);

  const resetViz = useCallback(() => {
    setVisited([]);
    setCurrent(null);
    setActiveEdge(null);
    setResult('');
    setDistances({});
    stopRef.current = false;
  }, []);

  const handleReset = useCallback(() => {
    stopRef.current = true;
    setIsRunning(false);
    resetViz();
  }, [resetViz]);

  const handleDefaultGraph = useCallback(() => {
    stopRef.current = true;
    setIsRunning(false);
    resetViz();
    setNodes(defaultNodes);
    setEdges(defaultEdges);
    setStartNode('A');
  }, [resetViz]);

  const addNode = useCallback(() => {
    if (!newNodeLabel.trim() || nodes.find(n => n.id === newNodeLabel.trim())) return;
    const x = 60 + Math.random() * 300;
    const y = 60 + Math.random() * 360;
    setNodes(prev => [...prev, { id: newNodeLabel.trim(), x, y, label: newNodeLabel.trim() }]);
    setNewNodeLabel('');
    setShowAddNode(false);
  }, [newNodeLabel, nodes]);

  const addEdge = useCallback(() => {
    if (!edgeFrom || !edgeTo || !nodes.find(n => n.id === edgeFrom) || !nodes.find(n => n.id === edgeTo)) return;
    const w = parseInt(edgeWeight) || 1;
    setEdges(prev => [...prev, { from: edgeFrom, to: edgeTo, weight: w }]);
    setEdgeFrom('');
    setEdgeTo('');
    setEdgeWeight('1');
    setShowAddEdge(false);
  }, [edgeFrom, edgeTo, edgeWeight, nodes]);

  const removeNode = useCallback((id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setEdges(prev => prev.filter(e => e.from !== id && e.to !== id));
  }, []);

  const getAdjacencyList = useCallback(() => {
    const adj: Record<string, { to: string; weight: number }[]> = {};
    nodes.forEach(n => { adj[n.id] = []; });
    edges.forEach(e => {
      adj[e.from]?.push({ to: e.to, weight: e.weight });
      adj[e.to]?.push({ to: e.from, weight: e.weight });
    });
    return adj;
  }, [nodes, edges]);

  // BFS
  const runBFS = useCallback(async () => {
    const adj = getAdjacencyList();
    const vis = new Set<string>();
    const queue = [startNode];
    vis.add(startNode);
    const order: string[] = [];

    while (queue.length > 0) {
      if (stopRef.current) return;
      const node = queue.shift()!;
      setCurrent(node);
      order.push(node);
      setVisited([...vis]);
      await sleep();

      for (const neighbor of adj[node] || []) {
        if (!vis.has(neighbor.to)) {
          setActiveEdge({ from: node, to: neighbor.to });
          await sleep();
          vis.add(neighbor.to);
          queue.push(neighbor.to);
          setVisited([...vis]);
        }
      }
      setActiveEdge(null);
    }
    setCurrent(null);
    setResult(`BFS Order: ${order.join(' → ')}`);
  }, [getAdjacencyList, startNode, sleep]);

  // DFS
  const runDFS = useCallback(async () => {
    const adj = getAdjacencyList();
    const vis = new Set<string>();
    const order: string[] = [];

    const dfs = async (node: string) => {
      if (stopRef.current || vis.has(node)) return;
      vis.add(node);
      setCurrent(node);
      order.push(node);
      setVisited([...vis]);
      await sleep();

      for (const neighbor of adj[node] || []) {
        if (!vis.has(neighbor.to)) {
          setActiveEdge({ from: node, to: neighbor.to });
          await sleep();
          await dfs(neighbor.to);
        }
      }
      setActiveEdge(null);
    };

    await dfs(startNode);
    setCurrent(null);
    setResult(`DFS Order: ${order.join(' → ')}`);
  }, [getAdjacencyList, startNode, sleep]);

  // Dijkstra
  const runDijkstra = useCallback(async () => {
    const adj = getAdjacencyList();
    const dist: Record<string, number> = {};
    const vis = new Set<string>();
    nodes.forEach(n => { dist[n.id] = Infinity; });
    dist[startNode] = 0;

    while (true) {
      if (stopRef.current) return;
      let minDist = Infinity;
      let minNode: string | null = null;
      for (const n of nodes) {
        if (!vis.has(n.id) && dist[n.id] < minDist) {
          minDist = dist[n.id];
          minNode = n.id;
        }
      }
      if (!minNode) break;

      vis.add(minNode);
      setCurrent(minNode);
      setDistances({ ...dist });
      setVisited([...vis]);
      await sleep();

      for (const neighbor of adj[minNode] || []) {
        if (!vis.has(neighbor.to)) {
          setActiveEdge({ from: minNode, to: neighbor.to });
          await sleep();
          const newDist = dist[minNode] + neighbor.weight;
          if (newDist < dist[neighbor.to]) {
            dist[neighbor.to] = newDist;
            setDistances({ ...dist });
          }
        }
      }
      setActiveEdge(null);
    }

    setCurrent(null);
    const distStr = Object.entries(dist)
      .filter(([, v]) => v !== Infinity)
      .map(([k, v]) => `${k}:${v}`)
      .join(', ');
    setResult(`Distances from ${startNode}: ${distStr}`);
  }, [getAdjacencyList, startNode, nodes, sleep]);

  // Prim's MST
  const runPrim = useCallback(async () => {
    const adj = getAdjacencyList();
    const vis = new Set<string>();
    const mstEdges: GEdge[] = [];
    const key: Record<string, number> = {};
    const parent: Record<string, string | null> = {};
    nodes.forEach(n => { key[n.id] = Infinity; parent[n.id] = null; });
    key[startNode] = 0;

    for (let i = 0; i < nodes.length; i++) {
      if (stopRef.current) return;
      let minKey = Infinity;
      let minNode: string | null = null;
      for (const n of nodes) {
        if (!vis.has(n.id) && key[n.id] < minKey) {
          minKey = key[n.id];
          minNode = n.id;
        }
      }
      if (!minNode) break;

      vis.add(minNode);
      setCurrent(minNode);
      setVisited([...vis]);
      if (parent[minNode]) {
        const edge = edges.find(e =>
          (e.from === parent[minNode] && e.to === minNode) ||
          (e.to === parent[minNode] && e.from === minNode)
        );
        if (edge) mstEdges.push(edge);
        setActiveEdge({ from: parent[minNode]!, to: minNode });
      }
      await sleep();

      for (const neighbor of adj[minNode] || []) {
        if (!vis.has(neighbor.to) && neighbor.weight < key[neighbor.to]) {
          key[neighbor.to] = neighbor.weight;
          parent[neighbor.to] = minNode;
        }
      }
    }

    setCurrent(null);
    setActiveEdge(null);
    setResult(`MST Edges: ${mstEdges.map(e => `${e.from}-${e.to}(${e.weight})`).join(', ')}`);
  }, [getAdjacencyList, startNode, nodes, edges, sleep]);

  // Kruskal's MST
  const runKruskal = useCallback(async () => {
    const parent: Record<string, string> = {};
    const rank: Record<string, number> = {};
    nodes.forEach(n => { parent[n.id] = n.id; rank[n.id] = 0; });

    const find = (x: string): string => {
      if (parent[x] !== x) parent[x] = find(parent[x]);
      return parent[x];
    };

    const union = (x: string, y: string) => {
      const px = find(x), py = find(y);
      if (px === py) return false;
      if (rank[px] < rank[py]) parent[px] = py;
      else if (rank[px] > rank[py]) parent[py] = px;
      else { parent[py] = px; rank[px]++; }
      return true;
    };

    const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);
    const mstEdges: GEdge[] = [];
    const vis = new Set<string>();

    for (const edge of sortedEdges) {
      if (stopRef.current) return;
      setActiveEdge({ from: edge.from, to: edge.to });
      setCurrent(edge.from);
      await sleep();

      if (union(edge.from, edge.to)) {
        mstEdges.push(edge);
        vis.add(edge.from);
        vis.add(edge.to);
        setVisited([...vis]);
        await sleep();
      }
    }

    setCurrent(null);
    setActiveEdge(null);
    setResult(`MST Edges: ${mstEdges.map(e => `${e.from}-${e.to}(${e.weight})`).join(', ')}`);
  }, [edges, nodes, sleep]);

  const runAlgorithm = useCallback(async () => {
    if (isRunning) {
      stopRef.current = true;
      setIsRunning(false);
      return;
    }
    setIsRunning(true);
    resetViz();

    const algoMap: Record<string, () => Promise<void>> = {
      bfs: runBFS,
      dfs: runDFS,
      dijkstra: runDijkstra,
      prim: runPrim,
      kruskal: runKruskal,
    };

    const algo = algoMap[selectedAlgo.id];
    if (algo) await algo();
    setIsRunning(false);
  }, [isRunning, selectedAlgo, resetViz, runBFS, runDFS, runDijkstra, runPrim, runKruskal]);

  const getNodeColor = (id: string): string => {
    if (current === id) return '#ffe600';
    if (visited.includes(id)) return '#39ff14';
    return '#4d7cff';
  };

  const getNodeGlow = (id: string): string => {
    if (current === id) return '0 0 15px #ffe600, 0 0 30px #ffe600';
    if (visited.includes(id)) return '0 0 10px #39ff14';
    return '0 0 5px #4d7cff';
  };

  const isEdgeActive = (from: string, to: string): boolean => {
    if (!activeEdge) return false;
    return (activeEdge.from === from && activeEdge.to === to) ||
           (activeEdge.from === to && activeEdge.to === from);
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
              <Network size={14} className="text-neon-cyan" />
              <span className="text-neon-cyan">{selectedAlgo.name}</span>
              <ChevronDown size={14} className="text-text-muted" />
            </button>
            {showAlgoDropdown && (
              <div className="absolute top-full left-0 mt-2 z-[100] glass-card rounded-xl overflow-hidden min-w-[240px] border border-border-color shadow-2xl shadow-black/50">
                {graphAlgorithms.map(algo => (
                  <button
                    key={algo.id}
                    onClick={() => { setSelectedAlgo(algo); setShowAlgoDropdown(false); handleReset(); }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-bg-card-hover transition-colors flex items-center justify-between ${algo.id === selectedAlgo.id ? 'text-neon-cyan bg-neon-cyan/5' : 'text-text-primary'}`}
                  >
                    {algo.name}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${levelBg[algo.level]} ${levelColors[algo.level]}`}>{algo.level}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Start Node */}
          <div className="flex items-center gap-2">
            <span className="text-text-muted text-xs">Start:</span>
            <select
              value={startNode}
              onChange={e => setStartNode(e.target.value)}
              disabled={isRunning}
              className="px-3 py-2 bg-bg-primary rounded-lg border border-border-color text-neon-orange font-mono text-sm focus:border-neon-orange/50 focus:outline-none disabled:opacity-50"
            >
              {nodes.map(n => (
                <option key={n.id} value={n.id}>{n.label}</option>
              ))}
            </select>
          </div>

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

          <button onClick={() => setShowAddNode(!showAddNode)} disabled={isRunning} className="px-3 py-2 rounded-lg text-xs font-medium bg-neon-green/10 text-neon-green border border-neon-green/30 hover:bg-neon-green/20 transition-all disabled:opacity-50">
            + Node
          </button>
          <button onClick={() => setShowAddEdge(!showAddEdge)} disabled={isRunning} className="px-3 py-2 rounded-lg text-xs font-medium bg-neon-blue/10 text-neon-blue border border-neon-blue/30 hover:bg-neon-blue/20 transition-all disabled:opacity-50">
            + Edge
          </button>
          <button onClick={handleDefaultGraph} disabled={isRunning} className="p-2.5 rounded-xl bg-bg-secondary border border-border-color hover:border-neon-cyan/50 text-neon-cyan transition-all disabled:opacity-50">
            <RotateCcw size={16} />
          </button>
          <button onClick={runAlgorithm} className={`p-2.5 rounded-xl transition-all ${isRunning ? 'bg-neon-orange/20 text-neon-orange border border-neon-orange/40' : 'bg-neon-green/20 text-neon-green border border-neon-green/40 hover:bg-neon-green/30'}`}>
            {isRunning ? <RotateCcw size={16} /> : <Play size={16} />}
          </button>
        </div>

        {/* Add Node Panel */}
        {showAddNode && (
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border-color">
            <input
              type="text"
              value={newNodeLabel}
              onChange={e => setNewNodeLabel(e.target.value)}
              placeholder="Node label (e.g., H)"
              className="w-32 px-3 py-2 bg-bg-primary rounded-lg border border-border-color text-text-primary text-sm placeholder:text-text-muted focus:border-neon-green/50 focus:outline-none"
            />
            <button onClick={addNode} className="px-4 py-2 rounded-lg bg-neon-green/20 text-neon-green border border-neon-green/40 text-sm font-medium">Add</button>
          </div>
        )}

        {/* Add Edge Panel */}
        {showAddEdge && (
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border-color flex-wrap">
            <select value={edgeFrom} onChange={e => setEdgeFrom(e.target.value)} className="px-3 py-2 bg-bg-primary rounded-lg border border-border-color text-text-primary text-sm">
              <option value="">From</option>
              {nodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
            </select>
            <select value={edgeTo} onChange={e => setEdgeTo(e.target.value)} className="px-3 py-2 bg-bg-primary rounded-lg border border-border-color text-text-primary text-sm">
              <option value="">To</option>
              {nodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
            </select>
            <input type="number" value={edgeWeight} onChange={e => setEdgeWeight(e.target.value)} placeholder="Weight" className="w-20 px-3 py-2 bg-bg-primary rounded-lg border border-border-color text-text-primary text-sm" />
            <button onClick={addEdge} className="px-4 py-2 rounded-lg bg-neon-blue/20 text-neon-blue border border-neon-blue/40 text-sm font-medium">Add</button>
          </div>
        )}
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
        {Object.keys(distances).length > 0 && (
          <div className="text-sm text-text-muted">
            Distances: {Object.entries(distances).filter(([, v]) => v !== Infinity).map(([k, v]) => (
              <span key={k} className="text-neon-cyan font-mono mx-1">{k}={v}</span>
            ))}
          </div>
        )}
        {result && (
          <div className="text-xs text-neon-green font-medium max-w-md truncate">{result}</div>
        )}
      </div>

      {/* Graph Visualization */}
      <div className="flex-1 glass-card rounded-2xl p-4 relative overflow-hidden min-h-[350px]">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(rgba(77,124,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(77,124,255,0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        <svg ref={svgRef} className="w-full h-full relative z-10" viewBox="0 0 420 460">
          {/* Edges */}
          {edges.map(edge => {
            const fromNode = nodes.find(n => n.id === edge.from);
            const toNode = nodes.find(n => n.id === edge.to);
            if (!fromNode || !toNode) return null;
            const isActive = isEdgeActive(edge.from, edge.to);
            return (
              <g key={`${edge.from}-${edge.to}`}>
                <line
                  x1={fromNode.x} y1={fromNode.y}
                  x2={toNode.x} y2={toNode.y}
                  stroke={isActive ? '#ffe600' : '#2a2a5a'}
                  strokeWidth={isActive ? 3 : 1.5}
                  style={{
                    filter: isActive ? 'drop-shadow(0 0 6px #ffe600)' : 'none',
                    transition: 'all 0.2s',
                  }}
                />
                {/* Weight label */}
                <text
                  x={(fromNode.x + toNode.x) / 2}
                  y={(fromNode.y + toNode.y) / 2 - 6}
                  textAnchor="middle"
                  fill={isActive ? '#ffe600' : '#6666aa'}
                  fontSize="11"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {edge.weight}
                </text>
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map(node => (
            <g key={node.id}>
              <motion.circle
                cx={node.x}
                cy={node.y}
                r={22}
                fill={getNodeColor(node.id)}
                stroke="#0a0a1a"
                strokeWidth="2"
                style={{ filter: getNodeGlow(node.id) }}
                animate={{ r: current === node.id ? 26 : 22 }}
                transition={{ duration: 0.2 }}
              />
              <text
                x={node.x}
                y={node.y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#0a0a1a"
                fontSize="14"
                fontWeight="bold"
                fontFamily="monospace"
              >
                {node.label}
              </text>
              {/* Delete button */}
              {!isRunning && (
                <g
                  onClick={() => removeNode(node.id)}
                  className="cursor-pointer"
                  style={{ opacity: 0.5 }}
                >
                  <circle cx={node.x + 18} cy={node.y - 18} r={8} fill="#ff006e" />
                  <text x={node.x + 18} y={node.y - 17} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">×</text>
                </g>
              )}
            </g>
          ))}
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
