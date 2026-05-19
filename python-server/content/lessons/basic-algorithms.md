---
id: basic-algorithms
title: Basic Algorithms
subject: cs
course: chapter-1
estimatedMinutes: 7
---

# Basic Algorithms

An **algorithm** is a finite, precise sequence of steps that solves a problem or computes a result. The recipe for chocolate-chip cookies is an algorithm. Long division is an algorithm. So is `sort(my_list)`. Algorithms exist apart from code: the same algorithm can be expressed in Python, in C++, in pseudocode, or in English.

## Pseudocode

Before you write real code, sketch your algorithm in informal "almost-code". This is **pseudocode**: a language-independent way to describe the steps.

```
Algorithm: find the maximum value in a list
1. If the list is empty, return None.
2. Set best to the first element.
3. For each remaining element:
   3a. If the element is greater than best, set best to the element.
4. Return best.
```

In Python the same algorithm:

```python
def find_max(items):
    if not items:
        return None
    best = items[0]
    for x in items[1:]:
        if x > best:
            best = x
    return best
```

## A handful of foundational algorithms

**Counting**: walk through a collection and count items that match a condition.

```python
def count_positive(nums):
    total = 0
    for n in nums:
        if n > 0:
            total += 1
    return total
```

**Filtering**: produce a new collection containing only items that match a condition.

```python
def evens(nums):
    return [n for n in nums if n % 2 == 0]
```

**Mapping**: apply a transformation to every item.

```python
def doubled(nums):
    return [n * 2 for n in nums]
```

**Searching**: find a specific element (or determine it isn't there).

```python
def contains(items, target):
    for x in items:
        if x == target:
            return True
    return False
```

## How fast is fast?

When the input is small, almost any algorithm works. The question becomes important when input grows. **Linear search**, checking every element in turn, does work proportional to the size of the input. Doubling the input doubles the work. We say it runs in time **O(n)**. You'll see a lot more of this notation in Chapter 3.

For now, the intuition: count the steps your algorithm takes in the worst case, and notice how that count grows with input size. If you double the input and the steps double, that's linear (good). If they quadruple, that's quadratic (often a sign you can do better).

## Common pitfalls

- **Edge cases.** Empty input, a single element, duplicates, negative numbers. The first version of your algorithm is usually wrong on at least one of these.
- **Reinventing built-ins.** Most languages have `max`, `sum`, `sort`, `filter` already. Write them once to understand them, then use the library version.
- **Optimising before measuring.** Make it correct first. Make it fast only after profiling shows it's slow.

---

_Adapted from [Wikipedia](https://en.wikipedia.org/wiki/Algorithm) (CC BY-SA 4.0)._
