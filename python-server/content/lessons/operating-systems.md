---
id: operating-systems
title: Operating Systems
subject: cs
course: chapter-3
estimatedMinutes: 8
---

# Operating Systems

An **operating system** (OS) is the software that sits between hardware and applications. Its job is to manage the computer's resources, CPU, memory, disk, network, peripherals, and present a clean interface to programs and users. Linux, macOS, Windows, iOS, and Android are all operating systems.

## Processes

A **process** is an instance of a program in execution. When you open a browser, the OS creates a process for it. That process gets:

- Its own memory address space
- Its own program counter (where it is in the code)
- Its own file descriptors and resources

Two processes are isolated from each other by default, one can't reach into the other's memory. That isolation is what keeps a crashing app from taking down the whole computer.

The OS keeps a **process table** of every running process, along with each one's state (running, ready, blocked, ...).

## Threads

Inside a single process, you can have multiple **threads** of execution, independent flows of control that share the *same* memory. Threads are cheaper to create than processes and let one program use multiple CPU cores simultaneously.

```
Process (shared memory)
├── Thread A   running task X
├── Thread B   running task Y
└── Thread C   waiting for I/O
```

Shared memory is a double-edged sword: threads can communicate cheaply, but they can also stomp on each other's data. You need locks, mutexes, or message-passing to coordinate.

## CPU scheduling

There are usually more processes than CPU cores. The **scheduler** decides which process gets a core, and for how long. Common policies:

- **Round-robin**: give every ready process a fixed time slice, in turn.
- **Priority**: higher-priority processes preempt lower-priority ones.
- **Multilevel feedback queue**: interactive processes get short time slices; CPU-bound ones get longer ones less often.

Modern OS schedulers combine several strategies and respond to feedback from the running workload.

## Memory management

Physical RAM is a finite, scarce resource shared by every process. The OS provides each process with a **virtual address space**, an illusion that it has the whole memory to itself, addressable from zero. Behind the scenes, virtual addresses are mapped to physical addresses via **page tables**, and rarely-used pages can be evicted to disk (a **page file** or **swap**).

Virtual memory gives you three things at once:

- **Isolation**: process A's address 0x1000 is not process B's address 0x1000.
- **More memory than you have**: pages can swap to disk as needed.
- **Memory protection**: the OS can mark pages read-only, executable, etc.

## File systems

Beyond RAM, the OS manages persistent storage: organising bytes on disk into **files** and **directories**, providing a hierarchical namespace, tracking permissions, and arranging the bytes themselves for fast access (block layouts, indexes, journals).

## Deadlock

If two processes each hold a resource the other needs and refuse to give it up, neither can make progress: that's a **deadlock**. Classic example:

```
Process 1: holds lock A, waits for lock B
Process 2: holds lock B, waits for lock A
```

Strategies: detect deadlocks and kill a process; prevent them by always acquiring locks in a fixed order; avoid them by reserving resources up front.

## Common pitfalls

- **Confusing process and thread.** Processes have separate memory; threads share it. The choice affects everything from performance to debugging.
- **Assuming "the OS will sort it out."** The kernel handles fairness, but a runaway thread holding a lock will starve everything that needs that lock.
- **Treating disk and RAM as interchangeable.** Disk is about 100,000× slower than RAM. Programs that swap heavily feel hung.

---

_Adapted from [Wikipedia](https://en.wikipedia.org/wiki/Operating_system) (CC BY-SA 4.0)._
