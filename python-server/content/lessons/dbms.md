---
id: dbms
title: Database Management Systems
subject: cs
course: chapter-3
estimatedMinutes: 8
---

# Database Management Systems

A **database** is structured storage for data; a **database management system** (DBMS) is the software that mediates access to it. The classic model is **relational**, data lives in tables with rigid schemas, and you query it with SQL.

## Tables, rows, columns

A relational table has a fixed set of named **columns**, each with a specified type, and any number of **rows** (also called *records* or *tuples*).

```
users
+----+----------+-----+
| id | name     | age |
+----+----------+-----+
|  1 | Ada      |  36 |
|  2 | Alan     |  41 |
|  3 | Grace    |  85 |
+----+----------+-----+
```

The table has three columns (`id`, `name`, `age`) and three rows. The schema, column names and types, is decided up front and enforced by the database.

## Primary keys and foreign keys

A **primary key** is a column (or combination of columns) whose value uniquely identifies each row. `id` is a typical primary key.

A **foreign key** is a column that references the primary key of another table. This is how relationships are modelled:

```
orders
+----+---------+----------+
| id | user_id | amount   |
+----+---------+----------+
| 10 |       1 |  $19.99  |
| 11 |       1 |   $4.50  |
| 12 |       3 |  $99.00  |
+----+---------+----------+
```

`orders.user_id` is a foreign key into `users.id`. The database can now enforce referential integrity (you can't insert an order with a `user_id` that doesn't exist) and you can ask cross-table questions with **joins**.

## SQL

**SQL** (Structured Query Language) is the language used to query relational databases. A small tour:

```sql
-- Read
SELECT name, age FROM users WHERE age > 30 ORDER BY age DESC;

-- Write
INSERT INTO users (name, age) VALUES ('Dennis', 70);

-- Update
UPDATE users SET age = 86 WHERE name = 'Grace';

-- Delete
DELETE FROM users WHERE id = 2;

-- Join across tables
SELECT users.name, orders.amount
FROM users
JOIN orders ON orders.user_id = users.id
WHERE orders.amount > 10;
```

`SELECT` reads; `INSERT`/`UPDATE`/`DELETE` write. `JOIN` combines rows from multiple tables on a matching column.

## Normalisation

**Normalisation** is the process of structuring tables to eliminate redundancy and reduce inconsistency. The idea: every fact should be stored in exactly one place.

```
-- Denormalised (bad): user's email appears in every order row.
orders: [order_id, user_email, amount]

-- Normalised (better): orders points to user; email lives once in users.
users:  [user_id, email]
orders: [order_id, user_id, amount]
```

Now updating a user's email is one row, not hundreds.

The trade-off: more joins to answer questions. Heavy read systems sometimes deliberately *denormalise* for speed and accept the consistency cost.

## ACID

Relational databases give you four guarantees, known as **ACID**:

- **Atomicity**: a transaction either fully happens or doesn't happen at all.
- **Consistency**: the database moves from one valid state to another.
- **Isolation**: concurrent transactions don't see each other's partial work.
- **Durability**: committed data survives crashes.

These properties make relational databases trustworthy as a system of record.

## Common pitfalls

- **SQL injection.** Concatenating user input into SQL strings is a classic vulnerability. Always use parameterised queries.
- **N+1 query problem.** Loading 100 users and then querying each one's orders separately is 101 round-trips. Use a join or a batch fetch.
- **Reaching for NoSQL "because scale".** Modern Postgres scales to terabytes. Pick relational unless you have a *specific* reason not to.

---

_Adapted from [Wikipedia](https://en.wikipedia.org/wiki/Database) (CC BY-SA 4.0)._
