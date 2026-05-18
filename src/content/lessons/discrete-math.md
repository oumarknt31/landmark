---
id: discrete-math
title: Discrete Mathematics
subject: cs
course: chapter-2
estimatedMinutes: 7
---

# Discrete Mathematics

Discrete maths is the maths of **countable, distinct objects**, integers, sets, graphs, logical statements. As opposed to continuous maths (calculus, real analysis), which deals with smooth curves and infinitesimal change. Almost all of computer science rests on discrete maths.

## Sets

A **set** is a collection of distinct objects with no notion of order:

```
A = {1, 2, 3, 4}
B = {3, 4, 5, 6}
```

The main operations:

- **Union**: `A ∪ B = {1, 2, 3, 4, 5, 6}`, everything in either.
- **Intersection**: `A ∩ B = {3, 4}`, everything in both.
- **Difference**: `A − B = {1, 2}`, in A but not B.
- **Cardinality**: `|A| = 4`, the number of elements.

Sets are the foundation of relational databases (a table is a set of rows), type systems, and many algorithms (deduplication, membership tests).

## Combinatorics

Combinatorics counts how many ways something can happen.

**Factorial**: `n!` is the product of all positive integers from 1 to *n*. `5! = 5 × 4 × 3 × 2 × 1 = 120`.

**Permutation**: ordered arrangements of *k* items chosen from *n*. There are `n! / (n − k)!` permutations.

**Combination**: unordered selections of *k* items from *n*. There are `n! / (k! · (n − k)!)` combinations.

The difference matters: "How many 3-letter codes can I make from 26 letters?" is permutations (BCD ≠ DCB). "How many 3-person teams can I form from 26 people?" is combinations (the team is the same regardless of order).

## Graphs

A **graph** is a set of vertices (nodes) and a set of edges (connections between pairs of vertices). Graph theory is the maths of networks, roads, social connections, dependencies, the internet itself.

```
   A
  / \
 B---C
 |   |
 D---E
```

Graphs can be:

- **Directed** (edges have a direction) or **undirected**.
- **Weighted** (edges carry numbers, like distances) or unweighted.
- **Cyclic** or **acyclic** (a directed acyclic graph, or DAG, is everywhere, build systems, version control, neural networks).

A **tree** is a connected, acyclic, undirected graph. We touch graph algorithms in Chapter 3.

## Logic

The **boolean** values are *true* and *false*. Standard logical operations:

- **AND** (∧): true only when both inputs are true.
- **OR** (∨): true when at least one input is true.
- **NOT** (¬): inverts a value.

Combine these and you can express any logical statement. Every conditional you write in code (`if`/`while`) is a boolean expression. Every digital circuit is a network of AND/OR/NOT gates.

## Common pitfalls

- **Confusing sets and sequences.** `{1, 2, 3}` and `[1, 2, 3]` are different things. Sets have no duplicates and no order; lists have both.
- **Permutation vs combination.** Read the problem carefully: does order matter?
- **Implicit subgraph assumptions.** When working with graphs, write down whether yours is directed, weighted, cyclic. Bugs hide in the assumptions you forgot to state.

---

_Adapted from [Wikipedia](https://en.wikipedia.org/wiki/Discrete_mathematics) (CC BY-SA 4.0)._
