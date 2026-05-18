---
id: data-structures
title: Data Structures
subject: cs
course: chapter-2
estimatedMinutes: 8
---

# Data Structures

A **data structure** is a way of organising data so that it can be accessed and modified efficiently. Different structures have different strengths; picking the right one is often the difference between an O(n) algorithm and an O(1) one.

## Arrays

An array stores elements next to each other in memory, indexed by integer position.

```
index:    0    1    2    3    4
value:  [ 7 | 3 | 12 | 8 | 5 ]
```

- Access by index: **O(1)**.
- Insertion or deletion at the middle: **O(n)**, everything after the position has to shift.

Most languages provide a **dynamic array** that automatically resizes (Python's `list`, JavaScript's `Array`, Java's `ArrayList`). Appending at the end is **O(1) amortised**, most appends are constant-time; occasionally the array doubles in capacity.

## Linked lists

A linked list is a chain of nodes; each node carries a value and a pointer to the next node.

```
[7 | →] → [3 | →] → [12 | →] → [8 | →] → [5 | ⌀]
```

- Access by index: **O(n)**, you have to walk from the head.
- Insertion or deletion at a known node: **O(1)**, just rewire the pointers.

Linked lists win when you do many insertions and deletions and rarely need random access. They lose at sequential reads (pointer-chasing is unfriendly to the CPU's cache).

## Stacks

A **stack** is a Last-In-First-Out (LIFO) collection. You push items on top and pop from the top.

```
push 7  → [ 7 ]
push 3  → [ 7, 3 ]
push 12 → [ 7, 3, 12 ]
pop     → returns 12 → [ 7, 3 ]
```

Stacks back function calls (the *call stack*), undo functionality, expression evaluation, and many algorithms (DFS, balanced-bracket checking). Both `push` and `pop` are **O(1)**.

## Queues

A **queue** is a First-In-First-Out (FIFO) collection. You enqueue at the back and dequeue from the front.

```
enqueue 7  → [ 7 ]
enqueue 3  → [ 7, 3 ]
enqueue 12 → [ 7, 3, 12 ]
dequeue    → returns 7 → [ 3, 12 ]
```

Queues back print spoolers, task schedulers, BFS, and any "process in order" workflow. A naive array-backed queue is **O(n)** per dequeue, so production implementations use a deque or a circular buffer to make both ends **O(1)**.

## Choosing the right structure

| You need to…                        | Reach for     |
|------------------------------------|---------------|
| Random access by index             | Array         |
| Insert/delete a lot in the middle  | Linked list   |
| Last-in-first-out                  | Stack         |
| First-in-first-out                 | Queue         |
| Fast lookup by key                 | Hash map      |
| Order plus log-n lookup            | Balanced tree |

## Common pitfalls

- **Defaulting to linked lists.** Most production code is array-backed; the cache-friendliness of contiguous memory beats the theoretical O(1) insert advantage in practice.
- **Using a list as a queue.** `list.pop(0)` in Python is O(n). Use `collections.deque`.
- **Forgetting empty-checks.** Popping from an empty stack or dequeuing from an empty queue throws an exception in most languages.

---

_Adapted from [Wikipedia](https://en.wikipedia.org/wiki/Data_structure) (CC BY-SA 4.0)._
