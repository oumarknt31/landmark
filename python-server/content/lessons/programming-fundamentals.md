---
id: programming-fundamentals
title: Programming Fundamentals
subject: cs
course: chapter-1
estimatedMinutes: 6
---

# Programming Fundamentals

A **program** is a sequence of instructions that a computer carries out. The act of writing those instructions is **programming**. Modern programmers almost never write directly in machine code; we write in a *high-level language* (Python, JavaScript, Java, C++, ...) that abstracts away CPU registers and memory addresses, and let a compiler or interpreter handle the translation.

## High-level vs low-level

A small example. To compute *5 + 3* and store the result, in Python you write:

```python
result = 5 + 3
```

In assembly (a low-level language close to the machine), the same idea is several lines of register manipulation:

```
MOV  R1, #5
MOV  R2, #3
ADD  R3, R1, R2
```

High-level languages trade a tiny amount of speed for an enormous amount of programmer productivity. Most code in industry is high-level.

## Statements and expressions

Two basic units:

- An **expression** evaluates to a value. `5 + 3`, `len(name)`, `x > 10` are all expressions.
- A **statement** does something. `result = 5 + 3` is a statement that performs an assignment.

```python
x = 7              # statement (assignment)
y = (x + 1) * 2    # statement; the right side is an expression
print(y)           # statement; print(...) is also an expression that returns None
```

## Comments

Comments are notes for humans; the interpreter ignores them. In Python:

```python
# This is a single-line comment.
x = 42           # End-of-line comment.

"""
This is a multi-line string used informally as a doc comment.
"""
```

Write comments to explain *why*, not *what*. The code already says what; the comment should say why.

## Python: indentation as structure

Where many languages use `{ }` to group code, Python uses **indentation**. Every block (the body of an `if`, a `for`, a function) is offset by the same number of spaces.

```python
if temperature > 30:
    print("It's hot.")
    print("Drink water.")
print("Have a good day.")   # not indented → outside the if
```

This forces visually-consistent code by design. Mixing tabs and spaces will trigger an `IndentationError`.

## Common pitfalls

- **Treating Python like C.** Python's indentation rule and dynamic typing surprise people coming from braces-and-types languages. Lean into the conventions; don't fight them.
- **Comments that lie.** A wrong comment is worse than no comment. When you change code, change its comments too.
- **Confusing `=` and `==`.** `=` assigns a value to a variable. `==` tests whether two values are equal. Most languages keep this distinction.

---

_Adapted from [Wikipedia](https://en.wikipedia.org/wiki/Programming_language) (CC BY-SA 4.0) and the [Python documentation](https://docs.python.org/3/tutorial/) (PSF License)._
