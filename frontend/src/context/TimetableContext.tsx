import { createContext, useContext, useMemo, useState } from 'react';
import {
  ALL_CLASSES, DAYS,
  ClassId, Day, Period,
  TimetableSlot, ClassSchedule, FullTimetable,
  Suggestion,
} from '../types';
import { generateTimetable, resetTimetableCache, validateTimetable } from '../engine/generator';
import { generateSuggestions } from '../engine/suggestions';

// ─── Override helpers ─────────────────────────────────────────────────────────

type OverrideKey = string; // `${classId}|${day}|${period}`
type OverrideMap = Record<OverrideKey, TimetableSlot>;

function overrideKey(classId: ClassId, day: Day, period: Period): OverrideKey {
  return `${classId}|${day}|${period}`;
}

function applyOverrides(base: FullTimetable, overrides: OverrideMap): FullTimetable {
  if (Object.keys(overrides).length === 0) return base;

  const result = {} as FullTimetable;
  for (const c of ALL_CLASSES) {
    result[c] = {} as ClassSchedule;
    for (const d of DAYS) {
      result[c][d] = { ...base[c][d] };
    }
  }
  for (const [key, slot] of Object.entries(overrides)) {
    const [classId, day, periodStr] = key.split('|');
    result[classId as ClassId][day as Day][Number(periodStr) as Period] = slot;
  }
  return result;
}

// ─── Context shape ────────────────────────────────────────────────────────────

interface TimetableContextValue {
  timetable: FullTimetable;
  pendingSuggestions: Suggestion[];
  appliedSuggestions: Suggestion[];
  acceptSuggestion: (suggestion: Suggestion) => void;
  rejectSuggestion: (id: string) => void;
}

const TimetableContext = createContext<TimetableContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function TimetableProvider({ children }: { children: React.ReactNode }) {
  const baseTt = useMemo(() => { resetTimetableCache(); return generateTimetable(); }, []);
  const [overrides, setOverrides] = useState<OverrideMap>({});
  // applied: snapshot of each accepted suggestion (for display + undo)
  const [applied, setApplied] = useState<Suggestion[]>([]);
  const [rejectedIds, setRejectedIds] = useState<string[]>([]);

  const timetable = useMemo(() => applyOverrides(baseTt, overrides), [baseTt, overrides]);

  const allSuggestions = useMemo(() => {
    const validation = validateTimetable(timetable);
    return generateSuggestions(timetable, validation);
  }, [timetable]);

  const pendingSuggestions = useMemo(
    () => allSuggestions.filter(
      (s) => !rejectedIds.includes(s.id) && !applied.some((a) => a.id === s.id),
    ),
    [allSuggestions, rejectedIds, applied],
  );

  const acceptSuggestion = (suggestion: Suggestion) => {
    const newOverrides = { ...overrides };
    for (const change of suggestion.changes) {
      newOverrides[overrideKey(change.classId, change.day, change.period)] = change.newSlot;
    }
    setOverrides(newOverrides);
    setApplied((prev) => [...prev, suggestion]);
  };

  const rejectSuggestion = (id: string) => {
    setRejectedIds((prev) => [...prev, id]);
  };

  return (
    <TimetableContext.Provider value={{
      timetable,
      pendingSuggestions,
      appliedSuggestions: applied,
      acceptSuggestion,
      rejectSuggestion,
    }}>
      {children}
    </TimetableContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTimetable(): TimetableContextValue {
  const ctx = useContext(TimetableContext);
  if (!ctx) throw new Error('useTimetable must be used inside <TimetableProvider>');
  return ctx;
}
