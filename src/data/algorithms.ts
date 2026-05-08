import { AlgorithmInfo } from '../types';
import { bubbleSortCode, binarySearchCode, insertionSortCode, mergeSortCode, quickSortCode } from './implementations';

export const searchingAlgorithms: AlgorithmInfo[] = [
  {
    id: 'linear',
    name: 'Linear Search',
    category: 'searching',
    timeComplexity: { best: 'O(1)', average: 'O(n)', worst: 'O(n)' },
    spaceComplexity: 'O(1)',
    description: 'Sequentially checks each element one by one until the target is found or the end is reached.',
    level: 'beginner',
    pseudocode: [
      'for each item in list:',
      '  if item == target:',
      '    return index',
      'return -1'
    ],
    implementations: {
      python: "def linear_search(arr, x):\n    for i in range(len(arr)):\n        if arr[i] == x:\n            return i\n    return -1",
      java: "public int linearSearch(int arr[], int x) {\n    for (int i = 0; i < arr.length; i++) {\n        if (arr[i] == x) return i;\n    }\n    return -1;\n}",
      c: "int linearSearch(int arr[], int n, int x) {\n    for (int i = 0; i < n; i++) {\n        if (arr[i] == x) return i;\n    }\n    return -1;\n}"
    }
  },
  {
    id: 'binary',
    name: 'Binary Search',
    category: 'searching',
    timeComplexity: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)' },
    spaceComplexity: 'O(1)',
    description: 'Divides a sorted list in half repeatedly, eliminating half the remaining elements each step.',
    level: 'beginner',
    pseudocode: [
      'low = 0, high = n-1',
      'while low <= high:',
      '  mid = (low + high) / 2',
      '  if arr[mid] == target:',
      '    return mid',
      '  if arr[mid] < target:',
      '    low = mid + 1',
      '  else:',
      '    high = mid - 1',
      'return -1'
    ],
    implementations: binarySearchCode
  },
  { id: 'jump', name: 'Jump Search', category: 'searching', timeComplexity: { best: 'O(1)', average: 'O(√n)', worst: 'O(√n)' }, spaceComplexity: 'O(1)', description: 'Jumps ahead by fixed steps (√n), then performs linear search in the identified block.', level: 'intermediate' },
  { id: 'interpolation', name: 'Interpolation Search', category: 'searching', timeComplexity: { best: 'O(1)', average: 'O(log log n)', worst: 'O(n)' }, spaceComplexity: 'O(1)', description: 'Improved binary search for uniformly distributed data. Estimates position using interpolation formula.', level: 'intermediate' },
  { id: 'exponential', name: 'Exponential Search', category: 'searching', timeComplexity: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)' }, spaceComplexity: 'O(1)', description: 'Finds a range where the element may exist by doubling index, then applies binary search.', level: 'advanced' },
  { id: 'ternary', name: 'Ternary Search', category: 'searching', timeComplexity: { best: 'O(1)', average: 'O(log₃ n)', worst: 'O(log₃ n)' }, spaceComplexity: 'O(1)', description: 'Divides the array into three parts instead of two, using two midpoints.', level: 'advanced' },
];

export const sortingAlgorithms: AlgorithmInfo[] = [
  {
    id: 'bubble',
    name: 'Bubble Sort',
    category: 'sorting',
    timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
    spaceComplexity: 'O(1)',
    stable: true,
    description: 'Repeatedly steps through the list, compares adjacent elements and swaps them if in wrong order.',
    level: 'beginner',
    pseudocode: [
      'for i from 0 to n-1:',
      '  for j from 0 to n-i-1:',
      '    if arr[j] > arr[j+1]:',
      '      swap(arr[j], arr[j+1])'
    ],
    implementations: bubbleSortCode
  },
  {
    id: 'selection',
    name: 'Selection Sort',
    category: 'sorting',
    timeComplexity: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)' },
    spaceComplexity: 'O(1)',
    stable: false,
    description: 'Finds the minimum element and places it at the beginning. Repeats for remaining unsorted portion.',
    level: 'beginner',
    pseudocode: [
      'for i from 0 to n-1:',
      '  min_idx = i',
      '  for j from i+1 to n:',
      '    if arr[j] < arr[min_idx]:',
      '      min_idx = j',
      '  swap(arr[i], arr[min_idx])'
    ],
    implementations: {
      python: "def selection_sort(arr):\n    for i in range(len(arr)):\n        min_idx = i\n        for j in range(i+1, len(arr)):\n            if arr[j] < arr[min_idx]:\n                min_idx = j\n        arr[i], arr[min_idx] = arr[min_idx], arr[i]",
      java: "void sort(int arr[]) {\n    int n = arr.length;\n    for (int i = 0; i < n-1; i++) {\n        int min_idx = i;\n        for (int j = i+1; j < n; j++)\n            if (arr[j] < arr[min_idx])\n                min_idx = j;\n        int temp = arr[min_idx];\n        arr[min_idx] = arr[i];\n        arr[i] = temp;\n    }\n}",
      c: "void selectionSort(int arr[], int n) {\n    int i, j, min_idx;\n    for (i = 0; i < n-1; i++) {\n        min_idx = i;\n        for (j = i+1; j < n; j++)\n            if (arr[j] < arr[min_idx])\n                min_idx = j;\n        int temp = arr[min_idx];\n        arr[min_idx] = arr[i];\n        arr[i] = temp;\n    }\n}"
    }
  },
  {
    id: 'insertion',
    name: 'Insertion Sort',
    category: 'sorting',
    timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
    spaceComplexity: 'O(1)',
    stable: true,
    description: 'Builds sorted array one element at a time by inserting each element into its correct position.',
    level: 'beginner',
    pseudocode: [
      'for i from 1 to n:',
      '  key = arr[i]',
      '  j = i - 1',
      '  while j >= 0 and arr[j] > key:',
      '    arr[j + 1] = arr[j]',
      '    j = j - 1',
      '  arr[j + 1] = key'
    ],
    implementations: insertionSortCode
  },
  {
    id: 'merge',
    name: 'Merge Sort',
    category: 'sorting',
    timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
    spaceComplexity: 'O(n)',
    stable: true,
    description: 'Divides array in half, recursively sorts each half, then merges the sorted halves.',
    level: 'intermediate',
    pseudocode: [
      'if length > 1:',
      '  mid = length / 2',
      '  L = sort(left_half)',
      '  R = sort(right_half)',
      '  merge(L, R)'
    ],
    implementations: mergeSortCode
  },
  {
    id: 'quick',
    name: 'Quick Sort',
    category: 'sorting',
    timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)' },
    spaceComplexity: 'O(log n)',
    stable: false,
    description: 'Picks a pivot, partitions array around pivot, then recursively sorts each partition.',
    level: 'intermediate',
    pseudocode: [
      'pivot = arr[high]',
      'partition index = low',
      'for j from low to high-1:',
      '  if arr[j] < pivot:',
      '    swap(arr[j], arr[partition index])',
      '    partition index++',
      'swap(arr[partition index], arr[high])',
      'quick_sort(low, pi-1)',
      'quick_sort(pi+1, high)'
    ],
    implementations: quickSortCode
  },
  {
    id: 'heap',
    name: 'Heap Sort',
    category: 'sorting',
    timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
    spaceComplexity: 'O(1)',
    stable: false,
    description: 'Builds a max heap, then repeatedly extracts the maximum element to build sorted array.',
    level: 'intermediate',
    pseudocode: [
      'for i from n/2-1 down to 0:',
      '  heapify(n, i)',
      'for i from n-1 down to 0:',
      '  swap(arr[0], arr[i])',
      '  heapify(i, 0)'
    ]
  },
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
