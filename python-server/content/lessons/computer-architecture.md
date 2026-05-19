---
id: computer-architecture
title: Computer Organization & Architecture
subject: cs
course: chapter-2
estimatedMinutes: 7
---

# Computer Organization & Architecture

Underneath the abstraction of variables and functions, there is a physical machine made of transistors switching billions of times per second. Computer organisation is how those parts fit together; computer architecture is the interface the CPU presents to software.

## Logic gates

The smallest building block of digital hardware. A gate takes one or more binary inputs and produces a single binary output.

| Gate  | Output is 1 when…                  |
|-------|------------------------------------|
| AND   | both inputs are 1                  |
| OR    | at least one input is 1            |
| NOT   | the input is 0                     |
| XOR   | exactly one input is 1             |
| NAND  | inputs are *not* both 1            |

Combine gates and you can build arithmetic. A handful of NAND gates can implement any boolean function, which is why NAND is sometimes called *universal*.

## The CPU's main parts

A simplified CPU has:

- **Registers**: a small handful of ultra-fast storage cells (typically 32 or 64 of them, each one machine-word wide). These are where the CPU operates on values directly.
- **ALU** (Arithmetic Logic Unit): performs arithmetic (`add`, `sub`) and bitwise logic (`and`, `or`, `xor`) on register values.
- **Control Unit**: fetches the next instruction from memory and tells the ALU and registers what to do.
- **Cache**: a small amount of very fast memory that holds recently-used data from RAM.

The **fetch–decode–execute** cycle is the heartbeat:

```
1. Fetch the next instruction from memory.
2. Decode it (what operation? which registers?).
3. Execute it (the ALU or another unit does the work).
4. Write the result back if needed.
5. Repeat.
```

Each pass through this cycle takes one or more **clock cycles**. A modern CPU's clock runs in the gigahertz, billions of cycles per second.

## The memory hierarchy

Memory is a trade-off between size, speed, and cost. Faster memory is more expensive per byte, so we layer it:

```
       fastest, smallest                                    slowest, largest
┌──────────────┐    ┌────────────┐    ┌────────┐    ┌──────────────┐
│  Registers   │ →  │  L1 / L2   │ →  │  RAM   │ →  │  Disk / SSD  │
│  (~1 ns)     │    │  cache     │    │ ~100ns │    │   ms range   │
└──────────────┘    └────────────┘    └────────┘    └──────────────┘
```

Each level is roughly 10–100× slower than the one above. Programs that fit in cache run *much* faster than ones that don't, which is why the contiguous memory of an array often beats the pointer-chasing of a linked list in practice.

## Instruction sets

The CPU exposes a fixed vocabulary of operations: its **instruction set**. x86-64 (Intel/AMD desktop chips) and ARM64 (phones, Apple Silicon) are the two dominant families.

A program compiled for one architecture won't run on the other without re-compilation, the instructions are literally different. This is why Apple's switch from Intel to ARM required a translation layer (Rosetta 2) to keep older apps running.

## Common pitfalls

- **"Faster CPU = faster program."** Not always. Memory access patterns often dominate. A cache-friendly algorithm on a 2 GHz chip can outrun a careless one on a 5 GHz chip.
- **Treating registers and RAM as the same.** Registers live *inside* the CPU; RAM is a separate chip across a memory bus. The difference in access time is two orders of magnitude.

---

_Adapted from [Wikipedia](https://en.wikipedia.org/wiki/Computer_architecture) (CC BY-SA 4.0)._
