"use client";

import { useSyncExternalStore } from "react";
import { EMPTY_PROGRESS, parseProgress, type ProgressData } from "./progress";

const KEY = "qizil-qalam:progress:v1";
const listeners = new Set<() => void>();
let cache: ProgressData | null = null;

function read(): ProgressData {
  if (cache) return cache;
  try {
    cache = parseProgress(window.localStorage.getItem(KEY));
  } catch {
    cache = EMPTY_PROGRESS; // maxfiy rejim yoki bloklangan xotira
  }
  return cache;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Holatni yangilab, saqlaydi va obunachilarga xabar beradi. */
export function updateProgress(fn: (data: ProgressData) => ProgressData): void {
  const next = fn(read());
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Xotira to'lgan yoki yopiq: ilova baribir sessiya davomida ishlaydi
  }
  listeners.forEach((l) => l());
}

export function resetProgress(): void {
  updateProgress(() => EMPTY_PROGRESS);
}

export function useProgress(): ProgressData {
  return useSyncExternalStore(subscribe, read, () => EMPTY_PROGRESS);
}

/** Server va mijoz birinchi chizilishi bir xil bo'lishi uchun: true bo'lsa saqlangan ma'lumot yuklangan. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
