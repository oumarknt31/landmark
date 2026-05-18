---
id: intro-to-cs
title: Introduction to Computer Science
subject: cs
course: chapter-1
estimatedMinutes: 6
---

# Introduction to Computer Science

Computer science is the study of **computation**, what can be computed, how efficiently, and how to express those procedures so a machine can carry them out. It is *not* the same as learning to type, using Microsoft Word, or "knowing about computers". The hardware is a vehicle; computation is the destination.

## Binary: how machines store information

Computers represent everything (numbers, text, images, code) as sequences of two-state symbols: 0 and 1. Each symbol is a **bit**. Eight bits grouped together make one **byte**.

```
Decimal:    5
Binary:   101   (1 × 4) + (0 × 2) + (1 × 1)

Decimal:   13
Binary:  1101   (1 × 8) + (1 × 4) + (0 × 2) + (1 × 1)
```

Why binary? Because electrical circuits are easiest to build with two distinguishable states: voltage present or voltage absent. Every higher abstraction (integers, strings, video, Instagram) is built on this two-state foundation.

## Hardware and software

A modern computer has a few main parts:

- **CPU** (central processing unit): fetches instructions from memory and executes them, very quickly.
- **RAM** (random-access memory): fast, volatile storage for the program currently running and its data.
- **Storage** (disk, SSD): slower but persistent; survives power-off.
- **I/O** (input/output): keyboard, screen, network, USB devices.

**Software** is the instructions; **hardware** is the machine that runs them. A *program* is a sequence of those instructions written in a language a human can read.

## How code becomes machine instructions

Two main paths exist:

- A **compiler** translates the entire program into machine code ahead of time. C, C++, Rust, and Go work this way. The resulting binary is fast but tied to a specific platform.
- An **interpreter** reads source code at runtime, line by line, and executes it. Python and JavaScript work this way (in practice, both compile to an intermediate bytecode first, but execution is interpreted).

## Computational thinking

Most of what computer science teaches is a way of *thinking*:

- **Decomposition**: break a hard problem into smaller pieces.
- **Pattern recognition**: notice when one piece looks like another you've already solved.
- **Abstraction**: ignore details that don't matter for the current problem.
- **Algorithmic thinking**: express the solution as a precise sequence of steps.

You'll spend the rest of these chapters putting these into practice.

## Common pitfalls

- **Confusing "computer science" with "programming".** Programming is one tool; CS is a much wider field including theory, complexity, and the design of systems.
- **Skipping the binary intuition.** When something later surprises you ("why does 0.1 + 0.2 ≠ 0.3?"), the answer is almost always traceable back to how the machine represents data in bits.

---

_Adapted from [Wikipedia](https://en.wikipedia.org/wiki/Computer_science) (CC BY-SA 4.0)._
