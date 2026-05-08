export type AlgorithmCategory = 'searching' | 'sorting' | 'graphs' | 'trees';

export interface AlgorithmInfo {
  name: string;
  id: string;
  category: AlgorithmCategory;
  timeComplexity: { best: string; average: string; worst: string };
  spaceComplexity: string;
  stable?: boolean;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  pseudocode?: string[];
  implementations?: {
    python: string;
    java: string;
    c: string;
  };
}

export interface GraphNode {
  id: string;
  x: number;
  y: number;
  label: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  weight: number;
}

export interface TreeNode {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
  x?: number;
  y?: number;
}

export type SortState = {
  array: number[];
  comparing: number[];
  swapping: number[];
  sorted: number[];
  active: number[];
};

export type SearchState = {
  array: number[];
  current: number;
  found: number;
  range: [number, number];
  checked: number[];
};

export interface SortingStep {
  type: 'compare' | 'swap' | 'sorted';
  indices: number[];
  description: string;
  arrayState: number[];
  timestamp: number;
}

export interface SearchStep {
  type: 'compare' | 'found' | 'not-found' | 'range-update';
  indices: number[];
  description: string;
  arrayState: number[];
  timestamp: number;
}

export interface GraphStep {
  type: 'visit' | 'process' | 'complete';
  nodeId: string;
  description: string;
  timestamp: number;
}

export interface TreeStep {
  type: 'visit' | 'process' | 'complete';
  value: number;
  description: string;
  timestamp: number;
}
