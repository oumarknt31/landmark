---
id: oop
title: Object-Oriented Programming
subject: cs
course: chapter-2
estimatedMinutes: 8
---

# Object-Oriented Programming

OOP is a way of organising code around **objects**, bundles of data with methods that operate on that data. It's not the only paradigm (functional, procedural, and logic programming are alternatives) but it's the dominant one in most production codebases.

## Classes and objects

A **class** is a blueprint. An **object** is a specific instance of that blueprint.

```python
class Dog:
    def __init__(self, name, breed):
        self.name = name        # attribute
        self.breed = breed

    def bark(self):             # method
        return f"{self.name} says woof."

rex = Dog("Rex", "Beagle")      # rex is an instance of Dog
print(rex.bark())               # → "Rex says woof."
```

Every dog has a name and a breed; every dog can bark. The class describes those facts in one place; the object is a particular dog filled in with specific values.

## Inheritance

A class can **inherit** from another, reusing and extending its behaviour:

```python
class GuideDog(Dog):
    def __init__(self, name, breed, handler):
        super().__init__(name, breed)
        self.handler = handler

    def guide(self):
        return f"{self.name} guides {self.handler}."

luna = GuideDog("Luna", "Labrador", "Ada")
print(luna.bark())   # inherited from Dog
print(luna.guide())  # specific to GuideDog
```

Inheritance is the "is-a" relationship: a `GuideDog` *is a* `Dog`.

## Encapsulation

**Encapsulation** is the practice of bundling data with the code that operates on it, and *hiding* the internal details from the outside world. Callers interact through a clean surface (the public methods), without depending on how things are stored internally.

```python
class BankAccount:
    def __init__(self):
        self._balance = 0          # underscore signals "private"

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("Amount must be positive.")
        self._balance += amount

    def get_balance(self):
        return self._balance
```

The outside world doesn't reach into `_balance` directly, it goes through `deposit` and `get_balance`. You can later change the internal representation (maybe `_balance` becomes a list of transactions) without breaking any callers.

## Polymorphism

**Polymorphism** lets objects of different classes be used through a shared interface, with the right behaviour selected at runtime.

```python
class Cat:
    def speak(self): return "meow"

class Cow:
    def speak(self): return "moo"

for animal in [Cat(), Cow(), Dog("Rex", "Beagle")]:
    print(animal.speak() if hasattr(animal, "speak") else animal.bark())
```

A function that takes "anything that has a `.speak()` method" works on Cat, Cow, and any future class you add. This is what makes OOP code extensible.

## Common pitfalls

- **Inheritance overuse.** Deep inheritance hierarchies (A → B → C → D → E) become hard to follow. Prefer *composition* (one class *has-a* another) over inheritance for code reuse.
- **God objects.** A class that does everything has no clear responsibility and becomes a junk drawer. Each class should have one nameable job.
- **Mutating shared state.** When multiple objects share a reference to the same mutable thing, a change in one ripples into all. Be deliberate about who owns what.

---

_Adapted from [Wikipedia](https://en.wikipedia.org/wiki/Object-oriented_programming) (CC BY-SA 4.0)._
