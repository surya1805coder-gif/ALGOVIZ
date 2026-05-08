import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SortingViz from './components/SortingViz';
import SearchingViz from './components/SearchingViz';
import GraphViz from './components/GraphViz';
import TreeViz from './components/TreeViz';
import CodeConsole from './components/CodeConsole';
import Quiz from './components/Quiz';
import { allAlgorithms } from './data/algorithms';
import {
  Search,
  ArrowUpDown,
  Network,
  TreePine,
  BookOpen,
  ChevronRight,
  Sparkles,
  Zap,
  Layers,
  GitBranch,
  Code,

} from 'lucide-react';

type Tab = 'sorting' | 'searching' | 'graphs' | 'trees' | 'quiz' | 'reference';

const tabs = [
  { id: 'sorting' as Tab, label: 'Sorting', icon: ArrowUpDown, color: '#ff006e', gradient: 'from-neon-pink/20 to-neon-pink/5' },
  { id: 'searching' as Tab, label: 'Searching', icon: Search, color: '#00f5ff', gradient: 'from-neon-cyan/20 to-neon-cyan/5' },
  { id: 'graphs' as Tab, label: 'Graphs', icon: Network, color: '#39ff14', gradient: 'from-neon-green/20 to-neon-green/5' },
  { id: 'trees' as Tab, label: 'Trees', icon: TreePine, color: '#b347d9', gradient: 'from-neon-purple/20 to-neon-purple/5' },
  { id: 'quiz' as Tab, label: 'Quiz', icon: Code, color: '#ff6b00', gradient: 'from-neon-orange/20 to-neon-orange/5' },
  { id: 'reference' as Tab, label: 'Reference', icon: BookOpen, color: '#ffe600', gradient: 'from-neon-yellow/20 to-neon-yellow/5' },
];

// Reference data
const searchingRef = [
  { name: 'Linear Search', time: 'O(n)', space: 'O(1)', desc: 'Checks each element sequentially', level: '🟢' },
  { name: 'Binary Search', time: 'O(log n)', space: 'O(1)', desc: 'Halves search space each step (sorted)', level: '🟢' },
  { name: 'Jump Search', time: 'O(√n)', space: 'O(1)', desc: 'Jumps by √n steps then linear search', level: '🟡' },
  { name: 'Interpolation Search', time: 'O(log log n)', space: 'O(1)', desc: 'Estimates position for uniform data', level: '🟡' },
  { name: 'Exponential Search', time: 'O(log n)', space: 'O(1)', desc: 'Finds range then binary search', level: '🔴' },
  { name: 'Ternary Search', time: 'O(log₃ n)', space: 'O(1)', desc: 'Divides into 3 parts with 2 midpoints', level: '🔴' },
  { name: 'Fibonacci Search', time: 'O(log n)', space: 'O(1)', desc: 'Uses Fibonacci numbers to divide array', level: '🔴' },
];

const sortingRef = [
  { name: 'Bubble Sort', best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: '✅', level: '🟢' },
  { name: 'Selection Sort', best: 'O(n²)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: '❌', level: '🟢' },
  { name: 'Insertion Sort', best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: '✅', level: '🟢' },
  { name: 'Merge Sort', best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)', stable: '✅', level: '🟡' },
  { name: 'Quick Sort', best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n²)', space: 'O(log n)', stable: '❌', level: '🟡' },
  { name: 'Heap Sort', best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(1)', stable: '❌', level: '🟡' },
  { name: 'Counting Sort', best: 'O(n+k)', avg: 'O(n+k)', worst: 'O(n+k)', space: 'O(k)', stable: '✅', level: '🔴' },
  { name: 'Radix Sort', best: 'O(nk)', avg: 'O(nk)', worst: 'O(nk)', space: 'O(n+k)', stable: '✅', level: '🔴' },
  { name: 'Bucket Sort', best: 'O(n+k)', avg: 'O(n+k)', worst: 'O(n²)', space: 'O(n)', stable: '✅', level: '🔴' },
  { name: 'Shell Sort', best: 'O(n log n)', avg: 'O(n log² n)', worst: 'O(n²)', space: 'O(1)', stable: '❌', level: '🔴' },
  { name: 'Tim Sort', best: 'O(n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)', stable: '✅', level: '🔴' },
  { name: 'Cocktail Sort', best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: '✅', level: '🔴' },
];

const graphRef = [
  { name: 'BFS', time: 'O(V+E)', space: 'O(V)', desc: 'Level-by-level traversal using queue', level: '🟢' },
  { name: 'DFS', time: 'O(V+E)', space: 'O(V)', desc: 'Deep-first traversal using stack/recursion', level: '🟢' },
  { name: "Dijkstra's", time: 'O(E log V)', space: 'O(V)', desc: 'Shortest path (non-negative weights)', level: '🟡' },
  { name: "Bellman-Ford", time: 'O(VE)', space: 'O(V)', desc: 'Shortest path (negative weights allowed)', level: '🔴' },
  { name: "Floyd-Warshall", time: 'O(V³)', space: 'O(V²)', desc: 'All-pairs shortest path', level: '🔴' },
  { name: "A*", time: 'O(E log V)', space: 'O(V)', desc: 'Heuristic-based pathfinding (AI/Games)', level: '🔴' },
  { name: "Prim's MST", time: 'O(E log V)', space: 'O(V)', desc: 'Grows MST one vertex at a time', level: '🟡' },
  { name: "Kruskal's MST", time: 'O(E log E)', space: 'O(V)', desc: 'Adds smallest non-cycle edge', level: '🟡' },
  { name: "Topological Sort", time: 'O(V+E)', space: 'O(V)', desc: 'Linear ordering of DAG vertices', level: '🔴' },
  { name: "Ford-Fulkerson", time: 'O(E·f*)', space: 'O(V)', desc: 'Maximum flow in a network', level: '🔴' },
];

const treeRef = [
  { name: 'Inorder', time: 'O(n)', space: 'O(h)', desc: 'Left → Root → Right (sorted in BST)', level: '🟢' },
  { name: 'Preorder', time: 'O(n)', space: 'O(h)', desc: 'Root → Left → Right (copy tree)', level: '🟢' },
  { name: 'Postorder', time: 'O(n)', space: 'O(h)', desc: 'Left → Right → Root (delete tree)', level: '🟢' },
  { name: 'Level Order', time: 'O(n)', space: 'O(w)', desc: 'BFS level-by-level traversal', level: '🟢' },
  { name: 'BST Search', time: 'O(log n)', space: 'O(h)', desc: 'Binary search tree lookup', level: '🟢' },
  { name: 'BST Insert', time: 'O(log n)', space: 'O(h)', desc: 'Insert maintaining BST property', level: '🟢' },
  { name: 'AVL Tree', time: 'O(log n)', space: 'O(n)', desc: 'Self-balancing BST with rotations', level: '🟡' },
  { name: 'Red-Black Tree', time: 'O(log n)', space: 'O(n)', desc: 'Balanced BST with color properties', level: '🟡' },
  { name: 'Segment Tree', time: 'O(log n)', space: 'O(n)', desc: 'Range queries and point updates', level: '🔴' },
  { name: 'Trie', time: 'O(L)', space: 'O(ALPHABET·N)', desc: 'String searching and autocomplete', level: '🔴' },
  { name: 'Fenwick Tree (BIT)', time: 'O(log n)', space: 'O(n)', desc: 'Prefix sum queries and updates', level: '🔴' },
  { name: 'LCA', time: 'O(log n)', space: 'O(n log n)', desc: 'Lowest common ancestor of two nodes', level: '🔴' },
];

function ReferencePanel() {
  const [section, setSection] = useState<'searching' | 'sorting' | 'graphs' | 'trees'>('searching');

  return (
    <div className="flex flex-col h-full">
      {/* Section Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          { id: 'searching' as const, label: 'Searching', icon: Search, color: 'text-neon-cyan' },
          { id: 'sorting' as const, label: 'Sorting', icon: ArrowUpDown, color: 'text-neon-pink' },
          { id: 'graphs' as const, label: 'Graphs', icon: Network, color: 'text-neon-green' },
          { id: 'trees' as const, label: 'Trees', icon: TreePine, color: 'text-neon-purple' },
        ].map(s => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              section === s.id
                ? `bg-bg-card border border-border-color ${s.color}`
                : 'bg-bg-secondary text-text-muted border border-transparent hover:text-text-primary'
            }`}
          >
            <s.icon size={14} />
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        {section === 'searching' && (
          <div className="glass-card rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg-card/50">
                  <th className="px-4 py-3 text-left text-text-muted font-medium text-xs uppercase tracking-wider">Level</th>
                  <th className="px-4 py-3 text-left text-text-muted font-medium text-xs uppercase tracking-wider">Algorithm</th>
                  <th className="px-4 py-3 text-left text-text-muted font-medium text-xs uppercase tracking-wider">Time</th>
                  <th className="px-4 py-3 text-left text-text-muted font-medium text-xs uppercase tracking-wider">Space</th>
                  <th className="px-4 py-3 text-left text-text-muted font-medium text-xs uppercase tracking-wider hidden md:table-cell">Description</th>
                </tr>
              </thead>
              <tbody>
                {searchingRef.map((algo, i) => (
                  <tr key={i} className="border-t border-border-color/50 hover:bg-bg-card-hover/50 transition-colors">
                    <td className="px-4 py-3 text-lg">{algo.level}</td>
                    <td className="px-4 py-3 font-medium text-text-primary">{algo.name}</td>
                    <td className="px-4 py-3 font-mono text-neon-yellow">{algo.time}</td>
                    <td className="px-4 py-3 font-mono text-neon-purple">{algo.space}</td>
                    <td className="px-4 py-3 text-text-secondary hidden md:table-cell">{algo.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {section === 'sorting' && (
          <div className="glass-card rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg-card/50">
                  <th className="px-4 py-3 text-left text-text-muted font-medium text-xs uppercase tracking-wider">Level</th>
                  <th className="px-4 py-3 text-left text-text-muted font-medium text-xs uppercase tracking-wider">Algorithm</th>
                  <th className="px-4 py-3 text-left text-text-muted font-medium text-xs uppercase tracking-wider">Best</th>
                  <th className="px-4 py-3 text-left text-text-muted font-medium text-xs uppercase tracking-wider">Average</th>
                  <th className="px-4 py-3 text-left text-text-muted font-medium text-xs uppercase tracking-wider">Worst</th>
                  <th className="px-4 py-3 text-left text-text-muted font-medium text-xs uppercase tracking-wider">Space</th>
                  <th className="px-4 py-3 text-left text-text-muted font-medium text-xs uppercase tracking-wider">Stable</th>
                </tr>
              </thead>
              <tbody>
                {sortingRef.map((algo, i) => (
                  <tr key={i} className="border-t border-border-color/50 hover:bg-bg-card-hover/50 transition-colors">
                    <td className="px-4 py-3 text-lg">{algo.level}</td>
                    <td className="px-4 py-3 font-medium text-text-primary">{algo.name}</td>
                    <td className="px-4 py-3 font-mono text-neon-green text-xs">{algo.best}</td>
                    <td className="px-4 py-3 font-mono text-neon-yellow text-xs">{algo.avg}</td>
                    <td className="px-4 py-3 font-mono text-neon-red text-xs">{algo.worst}</td>
                    <td className="px-4 py-3 font-mono text-neon-purple text-xs">{algo.space}</td>
                    <td className="px-4 py-3 text-center">{algo.stable}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {section === 'graphs' && (
          <div className="glass-card rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg-card/50">
                  <th className="px-4 py-3 text-left text-text-muted font-medium text-xs uppercase tracking-wider">Level</th>
                  <th className="px-4 py-3 text-left text-text-muted font-medium text-xs uppercase tracking-wider">Algorithm</th>
                  <th className="px-4 py-3 text-left text-text-muted font-medium text-xs uppercase tracking-wider">Time</th>
                  <th className="px-4 py-3 text-left text-text-muted font-medium text-xs uppercase tracking-wider">Space</th>
                  <th className="px-4 py-3 text-left text-text-muted font-medium text-xs uppercase tracking-wider hidden md:table-cell">Use Case</th>
                </tr>
              </thead>
              <tbody>
                {graphRef.map((algo, i) => (
                  <tr key={i} className="border-t border-border-color/50 hover:bg-bg-card-hover/50 transition-colors">
                    <td className="px-4 py-3 text-lg">{algo.level}</td>
                    <td className="px-4 py-3 font-medium text-text-primary">{algo.name}</td>
                    <td className="px-4 py-3 font-mono text-neon-yellow">{algo.time}</td>
                    <td className="px-4 py-3 font-mono text-neon-purple">{algo.space}</td>
                    <td className="px-4 py-3 text-text-secondary hidden md:table-cell">{algo.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {section === 'trees' && (
          <div className="glass-card rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg-card/50">
                  <th className="px-4 py-3 text-left text-text-muted font-medium text-xs uppercase tracking-wider">Level</th>
                  <th className="px-4 py-3 text-left text-text-muted font-medium text-xs uppercase tracking-wider">Algorithm</th>
                  <th className="px-4 py-3 text-left text-text-muted font-medium text-xs uppercase tracking-wider">Time</th>
                  <th className="px-4 py-3 text-left text-text-muted font-medium text-xs uppercase tracking-wider">Space</th>
                  <th className="px-4 py-3 text-left text-text-muted font-medium text-xs uppercase tracking-wider hidden md:table-cell">Description</th>
                </tr>
              </thead>
              <tbody>
                {treeRef.map((algo, i) => (
                  <tr key={i} className="border-t border-border-color/50 hover:bg-bg-card-hover/50 transition-colors">
                    <td className="px-4 py-3 text-lg">{algo.level}</td>
                    <td className="px-4 py-3 font-medium text-text-primary">{algo.name}</td>
                    <td className="px-4 py-3 font-mono text-neon-yellow">{algo.time}</td>
                    <td className="px-4 py-3 font-mono text-neon-purple">{algo.space}</td>
                    <td className="px-4 py-3 text-text-secondary hidden md:table-cell">{algo.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Learning Priority */}
        <div className="mt-6 glass-card rounded-2xl p-6">
          <h3 className="text-neon-yellow font-bold text-sm mb-4 flex items-center gap-2">
            <Sparkles size={16} />
            Learning Priority Guide
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { level: '🟢 Beginner', items: ['Linear, Binary Search', 'Bubble, Selection, Insertion Sort', 'BFS, DFS', 'Tree Traversals, BST'] },
              { level: '🟡 Intermediate', items: ['Jump, Interpolation Search', 'Merge, Quick, Heap Sort', "Dijkstra, Kruskal, Prim's", 'AVL, Red-Black Trees'] },
              { level: '🔴 Advanced', items: ['Exponential, Fibonacci Search', 'Radix, Tim, Bucket Sort', 'Bellman-Ford, Floyd-Warshall, A*', 'Segment Tree, Trie, LCA'] },
            ].map((row, i) => (
              <div key={i} className="bg-bg-primary rounded-xl p-4 border border-border-color">
                <h4 className="font-bold text-sm mb-3">{row.level}</h4>
                <ul className="space-y-1.5">
                  {row.items.map((item, j) => (
                    <li key={j} className="text-xs text-text-secondary flex items-start gap-1.5">
                      <ChevronRight size={10} className="mt-0.5 text-text-muted flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Tip */}
        <div className="mt-4 p-4 rounded-xl bg-neon-cyan/5 border border-neon-cyan/20">
          <p className="text-xs text-text-secondary flex items-center gap-2">
            <Zap size={14} className="text-neon-cyan flex-shrink-0" />
            <span>Always learn the algorithm along with its <strong className="text-neon-cyan">Time & Space Complexity</strong> and <strong className="text-neon-cyan">when to use it</strong> for best results in both academics and interviews!</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('sorting');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [selectedAlgoId, setSelectedAlgoId] = useState('bubble');

  // Sync selected algorithm when tab changes
  useEffect(() => {
    if (activeTab === 'sorting') setSelectedAlgoId('bubble');
    else if (activeTab === 'searching') setSelectedAlgoId('linear');
    else if (activeTab === 'graphs') setSelectedAlgoId('bfs');
    else if (activeTab === 'trees') setSelectedAlgoId('inorder');
  }, [activeTab]);

  const selectedAlgo = allAlgorithms.find(a => a.id === selectedAlgoId) || allAlgorithms[0];

  return (
    <div className="h-screen flex flex-col bg-bg-primary overflow-hidden pb-10">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-border-color/50 bg-bg-secondary/50 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-bg-card transition-colors lg:hidden"
            >
              <Layers size={18} className="text-text-muted" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan via-neon-purple to-neon-pink flex items-center justify-center">
                <Code size={16} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent">
                  AlgoViz
                </h1>
                <p className="text-[10px] text-text-muted -mt-0.5 hidden sm:block">Interactive Algorithm Visualizer</p>
              </div>
            </div>
          </div>

          {/* Tab Navigation (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'text-text-primary'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-bg-card rounded-xl border border-border-color"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <tab.icon size={14} className="relative z-10" style={{ color: activeTab === tab.id ? tab.color : undefined }} />
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-text-muted px-2 py-1 rounded bg-bg-card border border-border-color">
              v2.0
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              />
              {/* Sidebar */}
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: 'spring', bounce: 0.15 }}
                className="fixed left-0 top-0 bottom-0 w-64 bg-bg-secondary border-r border-border-color z-50 lg:hidden flex flex-col"
              >
                <div className="p-4 border-b border-border-color">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan via-neon-purple to-neon-pink flex items-center justify-center">
                      <Code size={16} className="text-white" />
                    </div>
                    <h2 className="font-bold text-text-primary">AlgoViz</h2>
                  </div>
                </div>
                <nav className="flex-1 p-3 space-y-1">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                        activeTab === tab.id
                          ? `bg-gradient-to-r ${tab.gradient} border border-border-color`
                          : 'text-text-muted hover:text-text-primary hover:bg-bg-card'
                      }`}
                    >
                      <tab.icon size={16} style={{ color: tab.color }} />
                      <span className={activeTab === tab.id ? 'font-medium text-text-primary' : ''}>{tab.label}</span>
                      {activeTab === tab.id && <ChevronRight size={14} className="ml-auto text-text-muted" />}
                    </button>
                  ))}
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <div className="max-w-6xl mx-auto h-full flex flex-col">
            {/* Mobile Tab Indicator */}
            <div className="lg:hidden mb-4">
              <div className="flex items-center gap-2 text-sm">
                {(() => {
                  const tab = tabs.find(t => t.id === activeTab);
                  if (!tab) return null;
                  const Icon = tab.icon;
                  return <Icon size={16} style={{ color: tab.color }} />;
                })()}
                <span className="font-bold text-text-primary">{tabs.find(t => t.id === activeTab)?.label}</span>
                <span className="text-text-muted text-xs">Visualization</span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col"
              >
                {activeTab === 'sorting' && <SortingViz onAlgoChange={setSelectedAlgoId} />}
                {activeTab === 'searching' && <SearchingViz onAlgoChange={setSelectedAlgoId} />}
                {activeTab === 'graphs' && <GraphViz />}
                {activeTab === 'trees' && <TreeViz />}
                {activeTab === 'quiz' && <Quiz />}
                {activeTab === 'reference' && <ReferencePanel />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      <CodeConsole
        selectedAlgo={selectedAlgo}
        isOpen={consoleOpen}
        onToggle={() => setConsoleOpen(!consoleOpen)}
      />

      {/* Footer */}
      <footer className="flex-shrink-0 border-t border-border-color/30 bg-bg-secondary/30 px-4 py-2">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-[10px] text-text-muted">
          <div className="flex items-center gap-2">
            <GitBranch size={10} />
            <span>Built with React + TypeScript + Tailwind CSS</span>
          </div>
          <div className="flex items-center gap-3">
            <span>🟢 Beginner</span>
            <span>🟡 Intermediate</span>
            <span>🔴 Advanced</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
