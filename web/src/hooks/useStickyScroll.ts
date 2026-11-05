"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";

const NEAR_BOTTOM_PX = 48;

/**
 * Pins a scroll area to the bottom while content streams in. If the reader
 * scrolls up, pinning pauses and `pinned` turns false so a "Scroll to bottom"
 * button can be shown (handbook §6.2).
 */
export function useStickyScroll(contentSignal: unknown) {
  const ref = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(true);

  const onScroll = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setPinned(el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX);
  }, []);

  useLayoutEffect(() => {
    const el = ref.current;
    if (el && pinned) el.scrollTop = el.scrollHeight;
  }, [contentSignal, pinned]);

  const scrollToBottom = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    setPinned(true);
  }, []);

  return { ref, pinned, onScroll, scrollToBottom };
}
