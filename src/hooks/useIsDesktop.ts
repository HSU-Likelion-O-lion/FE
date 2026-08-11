import { useSyncExternalStore } from "react";
import { DESKTOP_MEDIA } from "../lib/breakpoints";

function subscribe(onStoreChange: () => void) {
  const mql = window.matchMedia(DESKTOP_MEDIA);
  mql.addEventListener("change", onStoreChange);
  return () => mql.removeEventListener("change", onStoreChange);
}

function getSnapshot() {
  return window.matchMedia(DESKTOP_MEDIA).matches;
}

function getServerSnapshot() {
  return false;
}

/** 뷰포트 ≥431px 이면 true (웹 UI) */
export function useIsDesktop() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
