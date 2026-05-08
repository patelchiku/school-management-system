import {
  ALL_CLASSES, DAYS, PERIODS,
  ClassId, Day, Period, SubjectName,
  TimetableSlot, FullTimetable, ValidationResult,
  Suggestion, SlotChange,
} from '../types';
import {
  CLASS_TEACHERS, CLASS_TEACHER_LABELS,
  SANSKRIT_CLASS_ASSIGNMENTS, SANSKRIT_TEACHER_LABELS,
  HINDI_TEACHER_ASSIGNMENTS, HINDI_TEACHER_LABELS,
} from '../data/schoolConfig';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildTeacherBusy(tt: FullTimetable): Map<string, Set<string>> {
  const busy = new Map<string, Set<string>>();
  for (const c of ALL_CLASSES) {
    for (const d of DAYS) {
      for (const p of PERIODS) {
        const slot = tt[c][d]?.[p];
        if (slot?.teacher) {
          if (!busy.has(slot.teacher)) busy.set(slot.teacher, new Set());
          busy.get(slot.teacher)!.add(`${d}|${p}`);
        }
      }
    }
  }
  return busy;
}

function findFreeSlots(
  tt: FullTimetable,
  classId: ClassId,
  teacherId: string,
  count: number,
  teacherBusy: Map<string, Set<string>>,
  excludeDayPeriods: Set<string> = new Set(),
): { day: Day; period: Period }[] {
  const slots: { day: Day; period: Period }[] = [];
  const tBusy = teacherBusy.get(teacherId) ?? new Set();

  for (const d of DAYS) {
    for (const p of PERIODS) {
      if (slots.length >= count) break;
      const existing = tt[classId][d]?.[p];
      const key = `${d}|${p}`;
      if (
        (!existing || existing.subject === 'Free') &&
        !tBusy.has(key) &&
        !excludeDayPeriods.has(key)
      ) {
        slots.push({ day: d, period: p });
      }
    }
    if (slots.length >= count) break;
  }
  return slots;
}

function getTeacherForSubject(
  classId: ClassId,
  subject: SubjectName,
): { id: string; label: string } | null {
  if (subject === 'Sanskrit') {
    const id = SANSKRIT_CLASS_ASSIGNMENTS[classId];
    return { id, label: SANSKRIT_TEACHER_LABELS[id] ?? id };
  }
  if (subject === 'Hindi') {
    const id = HINDI_TEACHER_ASSIGNMENTS[classId];
    return { id, label: HINDI_TEACHER_LABELS[id] ?? id };
  }
  if (['Math', 'English', 'Theme', 'Block Room', 'Computer Lab', 'Library', 'Nature Club'].includes(subject)) {
    return { id: CLASS_TEACHERS[classId], label: CLASS_TEACHER_LABELS[classId] };
  }
  return null;
}

// ─── Suggestion Generators ────────────────────────────────────────────────────

function errorFixSuggestions(
  tt: FullTimetable,
  errors: string[],
  teacherBusy: Map<string, Set<string>>,
): Suggestion[] {
  const suggestions: Suggestion[] = [];

  for (const error of errors) {
    // Match "ClassName: SubjectName A/B periods"
    const match = error.match(/^(\w+): ([\w ]+) (\d+)\/(\d+) periods?$/);
    if (!match) continue;

    const [, classId, subject, actualStr, expectedStr] = match;
    const missing = parseInt(expectedStr) - parseInt(actualStr);
    if (missing <= 0) continue;

    const cId = classId as ClassId;
    const sub = subject as SubjectName;
    const teacher = getTeacherForSubject(cId, sub);
    if (!teacher) continue;

    const freeSlots = findFreeSlots(tt, cId, teacher.id, missing, teacherBusy);
    if (freeSlots.length < missing) continue;

    const changes: SlotChange[] = freeSlots.slice(0, missing).map(({ day, period }) => ({
      classId: cId,
      day,
      period,
      newSlot: { subject: sub, teacher: teacher.id, teacherLabel: teacher.label },
    }));

    const slotDesc = changes.map((c) => `${c.day} P${c.period}`).join(', ');
    suggestions.push({
      id: `fix-${classId}-${subject.replace(/ /g, '-')}`,
      type: 'fix',
      severity: 'error',
      title: `Place missing ${subject} for ${classId}`,
      description: `${classId} has only ${actualStr}/${expectedStr} ${subject} periods. Proposed slot${missing > 1 ? 's' : ''}: ${slotDesc}.`,
      changes,
    });
  }

  return suggestions;
}

function spreadSuggestions(
  tt: FullTimetable,
  teacherBusy: Map<string, Set<string>>,
): Suggestion[] {
  const suggestions: Suggestion[] = [];

  for (const c of ALL_CLASSES) {
    for (const subj of ['Sanskrit', 'Hindi'] as SubjectName[]) {
      // Find days that have 2+ of this subject
      const byDay: Partial<Record<Day, Period[]>> = {};
      for (const d of DAYS) {
        for (const p of PERIODS) {
          if (tt[c][d]?.[p]?.subject === subj) {
            if (!byDay[d]) byDay[d] = [];
            byDay[d]!.push(p);
          }
        }
      }

      for (const [day, periods] of Object.entries(byDay) as [Day, Period[]][]) {
        if (periods.length < 2) continue;

        const teacher = getTeacherForSubject(c, subj);
        if (!teacher) continue;

        // Find an alternate day that doesn't already have this subject
        const daysWithSubj = new Set(Object.keys(byDay) as Day[]);
        const altDay = DAYS.find((d) => d !== day && !daysWithSubj.has(d));
        if (!altDay) continue;

        // Find a free slot on that alternate day for both class and teacher
        const currentKeys = new Set<string>([`${day}|${periods[periods.length - 1]}`]);
        const altSlots = findFreeSlots(tt, c, teacher.id, 1, teacherBusy, currentKeys);
        const altSlot = altSlots.find((s) => s.day === altDay) ??
          altSlots.find((s) => !daysWithSubj.has(s.day));
        if (!altSlot) continue;

        const movePeriod = periods[periods.length - 1];
        suggestions.push({
          id: `spread-${c}-${subj}-${day}`,
          type: 'optimize',
          severity: 'warning',
          title: `Spread ${subj} for ${c} across days`,
          description: `${c} has ${subj} twice on ${day} (P${periods.join(' & P')}). Moving P${movePeriod} to ${altSlot.day} P${altSlot.period} improves distribution.`,
          changes: [
            {
              classId: c,
              day,
              period: movePeriod,
              newSlot: {
                subject: 'Free',
                teacher: CLASS_TEACHERS[c],
                teacherLabel: CLASS_TEACHER_LABELS[c],
              },
            },
            {
              classId: c,
              day: altSlot.day,
              period: altSlot.period,
              newSlot: { subject: subj, teacher: teacher.id, teacherLabel: teacher.label },
            },
          ],
        });
      }
    }
  }

  return suggestions;
}

function freePeriodsInfoSuggestions(tt: FullTimetable): Suggestion[] {
  const suggestions: Suggestion[] = [];

  for (const c of ALL_CLASSES) {
    let freeCount = 0;
    const freeDays: Partial<Record<Day, number>> = {};
    for (const d of DAYS) {
      for (const p of PERIODS) {
        if (tt[c][d]?.[p]?.subject === 'Free') {
          freeCount++;
          freeDays[d] = (freeDays[d] ?? 0) + 1;
        }
      }
    }
    if (freeCount < 3) continue;

    const dayBreakdown = (Object.entries(freeDays) as [Day, number][])
      .map(([d, n]) => `${d}: ${n}`)
      .join(', ');
    suggestions.push({
      id: `info-free-${c}`,
      type: 'info',
      severity: 'info',
      title: `${c} has ${freeCount} free period${freeCount !== 1 ? 's' : ''}`,
      description: `Breakdown — ${dayBreakdown}. These can be used for revision, substitution, or new activities.`,
      changes: [],
    });
  }

  return suggestions;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function generateSuggestions(
  tt: FullTimetable,
  validation: ValidationResult,
): Suggestion[] {
  const teacherBusy = buildTeacherBusy(tt);
  return [
    ...errorFixSuggestions(tt, validation.errors, teacherBusy),
    ...spreadSuggestions(tt, teacherBusy),
    ...freePeriodsInfoSuggestions(tt),
  ];
}
