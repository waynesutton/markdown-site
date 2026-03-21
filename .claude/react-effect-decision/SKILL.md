---
name: react-effect-decision
description: Combine React's official "You Might Not Need an Effect" guidance with this project's stricter no direct useEffect stance. Use when writing, reviewing, or refactoring React components that might reach for useEffect, derived state, event relays, reset logic, subscriptions, or client fetching.
---

# React effect decision

Default rule for this project: do not reach for direct `useEffect` first.

Most effect usage in React code is a sign that the component is syncing state that should be derived during render, routing an event through state, or resetting local state in a way React already models better.

This skill merges:

* React's official decision tree from "You Might Not Need an Effect"
* The project's stricter no direct `useEffect` preference

## Start here

Before writing any effect, ask these in order:

1. Can I calculate this from props or state during render
2. Is this triggered by a user action and better placed in the event handler
3. Am I trying to reset component state when identity changed and should use `key`
4. Is this an expensive pure calculation that should use `useMemo`
5. Is this an external subscription that should use `useSyncExternalStore` or a focused custom hook
6. Is this real external synchronization that must happen on mount or on dependency changes

If you answer yes to any of 1 through 5, do not write a direct `useEffect`.

## Project stance

React allows effects for real external synchronization. This project is stricter:

* Avoid direct `useEffect` in components whenever a clearer pattern exists
* Prefer derived values, event handlers, `key` remounts, memoization, query libraries, Convex hooks, and focused custom hooks
* If mount only external setup is truly needed, use an explicit `useMountEffect` wrapper instead of sprinkling raw `useEffect` through feature code

Example wrapper:

```ts
import { useEffect } from "react";

export function useMountEffect(effect: () => void | (() => void)) {
  useEffect(effect, []);
}
```

Use that only for one time external setup like DOM focus, third party widgets, or browser API listeners that belong to the component lifecycle.

## Decision guide

### 1. Derived state belongs in render

Bad smell:

* `useEffect(() => setX(deriveFromY(y)), [y])`
* State that only mirrors props or other state

Do this instead:

```tsx
function TodoList({ todos, showActive }: Props) {
  const activeTodos = todos.filter((todo) => !todo.completed);
  const visibleTodos = showActive ? activeTodos : todos;

  return <List items={visibleTodos} />;
}
```

If it can be calculated from existing inputs, keep it out of state.

### 2. Expensive pure calculations use `useMemo`

If the calculation is pure and expensive, memoize it instead of syncing it into state:

```tsx
const visibleTodos = useMemo(
  () => getVisibleTodos(todos, showActive),
  [todos, showActive],
);
```

Use memoization only when there is real repeated work to skip.

### 3. Event caused work belongs in the event handler

Bad smell:

* Set a flag in state
* Wait for an effect to notice the flag
* Reset the flag after the side effect runs

Do this instead:

```tsx
function PurchaseButton({ product }: Props) {
  async function handleClick() {
    await addToCart(product);
    showNotification(`Added ${product.name}`);
  }

  return <button onClick={handleClick}>Buy</button>;
}
```

If the work happens because the user clicked, submitted, dragged, or selected, keep it in the handler.

### 4. Reset with `key`, not effect choreography

Bad smell:

* `useEffect(() => setFormState(initialFromProps), [id])`

Do this instead:

```tsx
function EditContact({ contact, onSave }: Props) {
  return <EditContactForm key={contact.id} contact={contact} onSave={onSave} />;
}
```

If a different entity should feel like a fresh component instance, give the inner component a `key`.

### 5. Adjusting state from prop changes is a last resort

If you cannot derive it and do not want a full remount, adjust the state during render of the same component before children render stale data.

Prefer these, in order:

1. Derive it
2. Reset with `key`
3. Store an ID and derive the selected object from current inputs
4. Only then use a guarded render time adjustment pattern

### 6. Data fetching should use the app's data layer or a focused hook

Bad smell:

* Raw `fetch(...).then(setState)` inside a component effect
* Manual loading, retry, cancellation, and stale response handling in feature code

Preferred options:

* Use Convex React hooks where the data already lives in Convex
* Use the project's existing data abstraction or a query library for remote APIs
* If raw client fetching is unavoidable, isolate it inside a custom hook and handle stale response cleanup

Example custom hook pattern:

```tsx
function useSearchResults(url: string) {
  const [data, setData] = useState<Result[] | null>(null);

  useEffect(() => {
    let ignore = false;

    fetch(url)
      .then((response) => response.json())
      .then((json) => {
        if (!ignore) {
          setData(json);
        }
      });

    return () => {
      ignore = true;
    };
  }, [url]);

  return data;
}
```

That is still less preferred than a dedicated query layer, but better than scattering raw fetch effects across components.

### 7. External subscriptions should use `useSyncExternalStore`

For browser or third party stores, prefer the React built in subscription model:

```tsx
function useOnlineStatus() {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  );
}
```

This is clearer and safer than mirroring an external mutable source through ad hoc effect code.

### 8. True external synchronization is the narrow allowed case

An effect or `useMountEffect` is appropriate when the component must synchronize with something outside React:

* DOM focus or scroll positioning
* Third party widget setup and cleanup
* Browser API subscriptions
* Network synchronization that should happen because the component is on screen, not because a user event fired

When you use one, document the external system in a comment or nearby helper.

## Quick smell test

If you are about to write `useEffect`, check:

* Is this just derived state
* Is this event specific logic
* Is this a reset that should use `key`
* Is this a pure expensive calculation
* Is this a subscription better modeled with `useSyncExternalStore`
* Is this data loading that belongs in Convex, a query library, or a custom hook
* What external system am I synchronizing with

If you cannot name the external system, you probably do not need an effect.

## Code review prompts

Use these during review:

* What breaks if this effect is removed and the value is derived during render
* Is this component storing data that can be recomputed from props or state
* Why is this work not in the click, submit, or change handler that caused it
* Would `key={entityId}` remove the reset logic entirely
* Should this be a custom hook instead of inline effect code
* Is this component talking to an external system, or only to React state

## Summary

The safest path in this repo is simple:

* Derive during render when possible
* Handle user caused work in handlers
* Reset with `key`
* Memoize expensive pure work
* Use dedicated hooks for fetching and subscriptions
* Reserve effect style lifecycle code for real external synchronization

Sources:

* [React docs: You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
