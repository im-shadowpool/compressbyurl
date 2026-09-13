"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
} from "react";

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

const subscribeToPopoverSupport = () => () => undefined;

function supportsPopover() {
  return typeof HTMLElement !== "undefined" && "showPopover" in HTMLElement.prototype;
}

export interface AnchoredPopoverOptions {
  open: boolean;
  onClose: () => void;
  getAnchor: () => HTMLElement | null;
  gap?: number;
  margin?: number;
  matchAnchorWidth?: boolean;
  maxWidth?: number;
  minWidth?: number;
}

export function useAnchoredPopover({
  open,
  onClose,
  getAnchor,
  gap = 8,
  margin = 12,
  matchAnchorWidth = false,
  maxWidth,
  minWidth,
}: AnchoredPopoverOptions) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const getAnchorRef = useRef(getAnchor);
  const popoverSupported = useSyncExternalStore(
    subscribeToPopoverSupport,
    supportsPopover,
    () => false,
  );

  useEffect(() => {
    onCloseRef.current = onClose;
    getAnchorRef.current = getAnchor;
  });

  const position = useCallback(() => {
    const anchor = getAnchorRef.current();
    const panel = panelRef.current;
    if (!anchor || !panel) return;

    const rect = anchor.getBoundingClientRect();
    let width = matchAnchorWidth ? rect.width : panel.offsetWidth;
    if (minWidth) width = Math.max(width, minWidth);
    if (maxWidth) width = Math.min(width, maxWidth);
    width = Math.min(width, window.innerWidth - margin * 2);
    panel.style.width = `${width}px`;

    const height = panel.offsetHeight;
    const left = Math.min(
      Math.max(margin, rect.left),
      Math.max(margin, window.innerWidth - width - margin),
    );
    const fitsBelow = rect.bottom + gap + height <= window.innerHeight - margin;
    const top = Math.max(margin, fitsBelow ? rect.bottom + gap : rect.top - gap - height);

    panel.style.left = `${left}px`;
    panel.style.top = `${top}px`;
    panel.dataset.placement = fitsBelow ? "below" : "above";
  }, [gap, margin, matchAnchorWidth, maxWidth, minWidth]);

  useIsomorphicLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    if (!popoverSupported) {
      if (open) position();
      return;
    }

    if (open) {
      if (!panel.matches(":popover-open")) panel.showPopover();
      position();
    } else if (panel.matches(":popover-open")) {
      panel.hidePopover();
    }
  }, [open, popoverSupported, position]);

  useEffect(() => {
    if (!open) return;

    const reposition = () => position();
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [open, position]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node | null;
      if (!target) return;
      if (panelRef.current?.contains(target)) return;
      if (getAnchorRef.current()?.contains(target)) return;
      onCloseRef.current();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCloseRef.current();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return { panelRef, popoverSupported };
}
