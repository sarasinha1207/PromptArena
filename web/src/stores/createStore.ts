import { useSyncExternalStore } from "react";

type Listener = () => void;

export interface Store<T> {
  getState(): T;
  setState(patch: Partial<T> | ((state: T) => Partial<T>)): void;
  subscribe(listener: Listener): () => void;
}

/**
 * Minimal external store so WebSocket handlers (outside React) can update
 * state that components read. Selectors must return primitives or stable refs.
 */
export function createStore<T extends object>(initial: T): Store<T> {
  let state = initial;
  const listeners = new Set<Listener>();

  return {
    getState: () => state,
    setState(patch) {
      const next = typeof patch === "function" ? patch(state) : patch;
      state = { ...state, ...next };
      listeners.forEach((listener) => listener());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export function useStore<T, S>(store: Store<T>, selector: (state: T) => S): S {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),
    () => selector(store.getState()),
  );
}
