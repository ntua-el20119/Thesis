"use client";

import { useCallback, useMemo, useState } from "react";
import { methodology } from "@/lib/types";

/**
 * usePhaseExpansion
 * -----------------
 * Encapsulates the UI state for expanding/collapsing methodology phases.
 * - `expanded`: record of phase -> boolean (true = expanded).
 * - `initPhaseExpansion()`: resets all phases to collapsed (false), using the
 *   current keys of `methodology` as the single source of truth.
 * - `togglePhase(phase)`: convenience helper to flip a single phase.
 *
 * This mirrors the logic that previously lived inline in Home.
 */
export function usePhaseExpansion() {
  const phaseKeys = useMemo(() => Object.keys(methodology), []);

  // expanded[phase] === true -> phase list is visible
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Initialize all phases to collapsed; idempotent and safe to call on start/load.
  const initPhaseExpansion = useCallback(() => {
    setExpanded(Object.fromEntries(phaseKeys.map((p) => [p, false])));
  }, [phaseKeys]);

  // Flip a single phase's expanded state
  const togglePhase = useCallback((phase: string) => {
    setExpanded((prev) => ({ ...prev, [phase]: !prev[phase] }));
  }, []);

  return { expanded, setExpanded, initPhaseExpansion, togglePhase };
}
