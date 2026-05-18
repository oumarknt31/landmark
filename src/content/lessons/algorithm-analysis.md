---
id: algorithm-analysis
title: Design & Analysis of Algorithms
subject: cs
course: chapter-3
estimatedMinutes: 8
---

# Design & Analysis of Algorithms

Two algorithms can both produce the right answer; one might take a microsecond, the other a year. Algorithm analysis is the discipline of predicting *how an algorithm scales* as the input grows, so we can pick the right one before we hit the wall.

## Big O notation

Big O describes how the work an algorithm does grows as the input size *n* grows. We focus on the dominant term and ignore constants, because for large *n*, that's what matters.

| Notation     | Name         | Example                                |
|--------------|--------------|----------------------------------------|
| O(1)         | constant     | Access an array element by index       |
| O(log n)     | logarithmic  | Binary search in a sorted array        |
| O(n)         | linear       | Linear scan through a list             |
| O(n log n)   | linearithmic | Merge sort, heap sort                  |
| O(n²)        | quadratic    | A nested loop over the same array      |
| O(2ⁿ)        | exponential  | Naïve recursion over every subset      |

The intuition: O(1) ignores input size. O(n) doubles when input doubles. O(n²) quadruples when input doubles. O(2ⁿ) doubles for every *single additional element*.

## Searching

**Linear search** walks through the input one element at a time:

```python
def linear_search(items, target):
    for i, x in enumerate(items):
        if x == target:
            return i
    return -1
```

Worst case: **O(n)**. Best case: **O(1)** if the target is first.

**Binary search** requires a *sorted* input. It looks at the middle element, eliminates half the remaining range, and recurses:

```python
def binary_search(items, target):
    lo, hi = 0, len(items) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if items[mid] == target:
            return mid
        if items[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1
```

Each step halves the search space, giving **O(log n)**, a billion-item array takes about 30 comparisons.

## Sorting

Common comparison sorts and their costs:

| Algorithm      | Best case | Average    | Worst case | Space | Stable |
|----------------|-----------|------------|------------|-------|--------|
| Bubble sort    | O(n)      | O(n²)      | O(n²)      | O(1)  | yes    |
| Insertion sort | O(n)      | O(n²)      | O(n²)      | O(1)  | yes    |
| Merge sort     | O(n log n)| O(n log n) | O(n log n) | O(n)  | yes    |
| Quicksort      | O(n log n)| O(n log n) | O(n²)      | O(log n) | no  |
| Heap sort      | O(n log n)| O(n log n) | O(n log n) | O(1)  | no     |

In practice, language standard libraries use **adaptive hybrids** (Python's Timsort, V8's TimSort, C++ introsort) that combine algorithms to win in the common case.

## Space–time trade-offs

You can often trade memory for speed (or vice versa). Memoising a recursive function turns exponential time into linear time, at the cost of storing intermediate results. Caching a database query result trades RAM for fewer round-trips.

Pick the trade-off your problem demands. On a constrained device, optimise for memory. On a typical server, optimise for time.

## Common pitfalls

- **Premature optimisation.** Code that's correct, readable, and merely "fast enough" beats clever-but-fragile code that's still in development.
- **Confusing average and worst case.** Quicksort is fast on random data but quadratic on pre-sorted input with a naïve pivot. Know which case your input lives in.
- **Ignoring constants.** O(n) "beats" O(n²) only for large *n*. For tiny inputs (say, n ≤ 20), insertion sort outpaces merge sort because its constant factors are smaller.

---

_Adapted from [Wikipedia](https://en.wikipedia.org/wiki/Analysis_of_algorithms) (CC BY-SA 4.0)._
