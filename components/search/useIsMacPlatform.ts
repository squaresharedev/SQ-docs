"use client";

/**
 * Copy of Store/src/lib/hooks/useIsMacPlatform.ts
 * Changes: none (pure hook, no Store-specific dependencies).
 *
 * Which modifier key label to show for a keyboard shortcut: the command symbol
 * on a Mac, Ctrl elsewhere. A browser fact read through useSyncExternalStore
 * rather than a useState + useEffect pair: the server snapshot returns null
 * (unknown), the client snapshot returns the real answer, and nothing here
 * ever calls setState from inside an effect. That keeps hydration honest:
 * showing the wrong modifier for a frame would be worse than showing none.
 */
import { useSyncExternalStore } from "react";

const NEVER_CHANGES = () => () => {};
const readIsMac = () => /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent);
const UNKNOWN_ON_SERVER = () => null;

export function useIsMacPlatform(): boolean | null {
  return useSyncExternalStore(NEVER_CHANGES, readIsMac, UNKNOWN_ON_SERVER);
}
