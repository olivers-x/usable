# `usable`

A tiny utility library for using async functions with React 19's [`use()`](https://react.dev/reference/react/use) API and Suspense.

## The Problem

React's `use(promise)` hook suspends a component until the promise resolves. But there's a catch:

- Creating a promise **inside** a component re-creates it on every render — React will suspend forever.
- Creating a promise **outside** a component starts fetching immediately, even if the data is never needed.

`usable` solves this with a **lazy promise** — it only starts executing when React first calls `.then()`, and memoizes the result for all subsequent renders.

## Installation

```bash
npm install @olivers-x/usable
```

> Requires React ≥ 19.

## Usage

```tsx
import { createUsable } from "@olivers-x/usable";
import { Suspense, use } from "react";

// Declared outside the component — lazy, won't fetch until used
const postUsable = createUsable(async () => {
  const res = await fetch("/api/posts/1");
  return res.json();
});

function Post() {
  const post = use(postUsable); // suspends until resolved
  return <h1>{post.title}</h1>;
}

function App() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <Post />
    </Suspense>
  );
}
```

The fetch runs exactly once — when `Post` first renders. Re-renders reuse the cached result.

## API

### `createUsable(factory)`

```ts
function createUsable<T>(factory: () => T | PromiseLike<T>): UsablePromise<T>;
```

Wraps an async factory function and returns a `UsablePromise`. The factory is not called until the promise is first awaited or passed to `use()`.

### `UsablePromise<T>`

Extends `Promise<T>`. The underlying task runs only once, on first `.then()` call. Safe to declare at module scope.

## How It Works

`UsablePromise` overrides `.then()` to defer execution. The first time `.then()` is called (by React's `use()`, `await`, or `.then()` chaining), the inner task runs and its promise is cached. All subsequent calls share that same promise.

## License

AGPL-3.0
