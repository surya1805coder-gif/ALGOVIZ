import { AlgorithmInfo } from '../types';

export const searchingAlgorithms: AlgorithmInfo[] = [
  { id: 'linear', name: 'Linear Search', category: 'searching', timeComplexity: { best: 'O(1)', average: 'O(n)', worst: 'O(n)' }, spaceComplexity: 'O(1)', description: 'Sequentially checks each element one by one until the target is found or the end is reached.', level: 'beginner' },
  { id: 'binary', name: 'Binary Search', category: 'searching', timeComplexity: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)' }, spaceComplexity: 'O(1)', description: 'Divides a sorted list in half repeatedly, eliminating half the remaining elements each step.', level: 'beginner' },
  { id: 'jump', name: 'Jump Search', category: 'searching', timeComplexity: { best: 'O(1)', average: 'O(√n)', worst: 'O(√n)' }, spaceComplexity: 'O(1)', description: 'Jumps ahead by fixed steps (√n), then performs linear search in the identified block.', level: 'intermediate' },
  { id: 'interpolation', name: 'Interpolation Search', category: 'searching', timeComplexity: { best: 'O(1)', average: 'O(log log n)', worst: 'O(n)' }, spaceComplexity: 'O(1)', description: 'Improved binary search for uniformly distributed data. Estimates position using interpolation formula.', level: 'intermediate' },
  { id: 'exponential', name: 'Exponential Search', category: 'searching', timeComplexity: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)' }, spaceComplexity: 'O(1)', description: 'Finds a range where the element may exist by doubling index, then applies binary search.', level: 'advanced' },
  { id: 'ternary', name: 'Ternary Search', category: 'searching', timeComplexity: { best: 'O(1)', average: 'O(log₃ n)', worst: 'O(log₃ n)' }, spaceComplexity: 'O(1)', description: 'Divides the array into three parts instead of two, using two midpoints.', level: 'advanced' },
];

export const sortingAlgorithms: AlgorithmInfo[] = [
  { id: 'bubble', name: 'Bubble Sort', category: 'sorting', timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' }, spaceComplexity: 'O(1)', stable: true, description: 'Repeatedly steps through the list, compares adjacent elements and swaps them if in wrong order.', level: 'beginner' },
  { id: 'selection', name: 'Selection Sort', category: 'sorting', timeComplexity: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)' }, spaceComplexity: 'O(1)', stable: false, description: 'Finds the minimum element and places it at the beginning. Repeats for remaining unsorted portion.', level: 'beginner' },
  { id: 'insertion', name: 'Insertion Sort', category: 'sorting', timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' }, spaceComplexity: 'O(1)', stable: true, description: 'Builds sorted array one element at a time by inserting each element into its correct position.', level: 'beginner' },
  { id: 'merge', name: 'Merge Sort', category: 'sorting', timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' }, spaceComplexity: 'O(n)', stable: true, description: 'Divides array in half, recursively sorts each half, then merges the sorted halves.', level: 'intermediate' },
  { id: 'quick', name: 'Quick Sort', category: 'sorting', timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)' }, spaceComplexity: 'O(log n)', stable: false, description: 'Picks a pivot, partitions array around pivot, then recursively sorts each partition.', level: 'intermediate' },
  { id: 'heap', name: 'Heap Sort', category: 'sorting', timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' }, spaceComplexity: 'O(1)', stable: false, description: 'Builds a max heap, then repeatedly extracts the maximum element to build sorted array.', level: 'intermediate' },
  { id: 'shell', name: 'Shell Sort', category: 'sorting', timeComplexity: { best: 'O(n log n)', average: 'O(n log² n)', worst: 'O(n²)' }, spaceComplexity: 'O(1)', stable: false, description: 'Generalization of insertion sort that allows exchange of elements that are far apart.', level: 'advanced' },
  { id: 'cocktail', name: 'Cocktail Shaker Sort', category: 'sorting', timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' }, spaceComplexity: 'O(1)', stable: true, description: 'Bidirectional bubble sort that alternates direction each pass.', level: 'advanced' },
];

export const graphAlgorithms: AlgorithmInfo[] = [
  { id: 'bfs', name: 'Breadth-First Search', category: 'graphs', timeComplexity: { best: 'O(V+E)', average: 'O(V+E)', worst: 'O(V+E)' }, spaceComplexity: 'O(V)', description: 'Explores neighbors level by level using a queue. Finds shortest path in unweighted graphs.', level: 'beginner' },
  { id: 'dfs', name: 'Depth-First Search', category: 'graphs', timeComplexity: { best: 'O(V+E)', average: 'O(V+E)', worst: 'O(V+E)' }, spaceComplexity: 'O(V)', description: 'Explores as deep as possible before backtracking using a stack/recursion.', level: 'beginner' },
  { id: 'dijkstra', name: "Dijkstra's Algorithm", category: 'graphs', timeComplexity: { best: 'O(E log V)', average: 'O(E log V)', worst: 'O(V²)' }, spaceComplexity: 'O(V)', description: 'Finds shortest path from source to all vertices with non-negative weights.', level: 'intermediate' },
  { id: 'prim', name: "Prim's Algorithm", category: 'graphs', timeComplexity: { best: 'O(E log V)', average: 'O(E log V)', worst: 'O(V²)' }, spaceComplexity: 'O(V)', description: 'Grows a Minimum Spanning Tree one vertex at a time by adding cheapest connecting edge.', level: 'intermediate' },
  { id: 'kruskal', name: "Kruskal's Algorithm", category: 'graphs', timeComplexity: { best: 'O(E log E)', average: 'O(E log E)', worst: 'O(E log E)' }, spaceComplexity: 'O(V)', description: 'Finds MST by adding smallest edge that does not form a cycle.', level: 'intermediate' },
];

export const treeAlgorithms: AlgorithmInfo[] = [
  { id: 'inorder', name: 'Inorder Traversal', category: 'trees', timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' }, spaceComplexity: 'O(h)', description: 'Left → Root → Right. Returns sorted output in a BST.', level: 'beginner' },
  { id: 'preorder', name: 'Preorder Traversal', category: 'trees', timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' }, spaceComplexity: 'O(h)', description: 'Root → Left → Right. Useful for copying a tree.', level: 'beginner' },
  { id: 'postorder', name: 'Postorder Traversal', category: 'trees', timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' }, spaceComplexity: 'O(h)', description: 'Left → Right → Root. Useful for deleting a tree.', level: 'beginner' },
  { id: 'levelorder', name: 'Level Order (BFS)', category: 'trees', timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' }, spaceComplexity: 'O(w)', description: 'Visits nodes level by level from left to right using a queue.', level: 'beginner' },
  { id: 'bst-search', name: 'BST Search', category: 'trees', timeComplexity: { best: 'O(1)', average: 'O(log n)', worst: 'O(n)' }, spaceComplexity: 'O(h)', description: 'Searches for a value in a Binary Search Tree by comparing and going left or right.', level: 'beginner' },
  { id: 'bst-insert', name: 'BST Insert', category: 'trees', timeComplexity: { best: 'O(1)', average: 'O(log n)', worst: 'O(n)' }, spaceComplexity: 'O(h)', description: 'Inserts a value into a BST maintaining the BST property.', level: 'beginner' },
];

export const allAlgorithms = [...searchingAlgorithms, ...sortingAlgorithms, ...graphAlgorithms, ...treeAlgorithms];
