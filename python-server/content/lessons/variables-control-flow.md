---
id: variables-control-flow
title: Variables & Control Flow
subject: cs
course: chapter-1
estimatedMinutes: 7
---

# Variables & Control Flow

A program would be tedious indeed if it executed every line in strict order and stored nothing along the way. **Variables** let you remember values; **control flow** lets you choose which lines run and which lines run repeatedly.

## Variables

A variable is a named reference to a value stored in memory. In Python you create one by assignment:

```python
age = 21
name = "Ada"
is_student = True
```

You can use the variable later by name, and reassign it whenever you like:

```python
age = age + 1   # now 22
```

The variable's **scope** is the region of the program where it is visible. Variables defined inside a function are local to that function; variables defined outside are global. Local trumps global where they overlap.

## Conditionals: branching

Use `if`, `elif`, and `else` to choose between branches.

```python
def grade(score):
    if score >= 90:
        return "A"
    elif score >= 80:
        return "B"
    elif score >= 70:
        return "C"
    else:
        return "F"
```

A condition is anything that evaluates to true or false: comparisons (`>`, `<=`, `==`, `!=`), boolean operators (`and`, `or`, `not`), or any truthy/falsy value.

## Loops: repetition

A **for loop** iterates over a known sequence:

```python
for n in range(5):
    print(n)        # 0, 1, 2, 3, 4

for word in ["red", "blue", "green"]:
    print(word.upper())
```

A **while loop** repeats as long as a condition stays true:

```python
attempts = 0
while attempts < 3:
    print("Try again.")
    attempts += 1
```

Use `for` when the number of iterations is known; `while` when it depends on a condition that changes inside the loop.

## Break and continue

Inside a loop:

- `break` exits the innermost loop immediately.
- `continue` skips the rest of the current iteration and starts the next one.

```python
for n in range(20):
    if n % 2 == 1:
        continue          # skip odd numbers
    if n > 10:
        break             # stop entirely past 10
    print(n)              # prints 0, 2, 4, 6, 8, 10
```

## Common pitfalls

- **Infinite loops.** A `while` loop whose condition never becomes false runs forever. Make sure something inside the loop changes the condition.
- **Off-by-one errors.** `range(5)` produces `0, 1, 2, 3, 4`, five values, but the highest is 4. Most beginner bugs are off-by-one.
- **Variable shadowing.** Re-using a name like `list` or `str` shadows Python's built-ins inside that scope. Pick distinct names.

---

_Adapted from [Wikipedia](https://en.wikipedia.org/wiki/Control_flow) (CC BY-SA 4.0)._
