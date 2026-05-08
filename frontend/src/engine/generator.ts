import {
  ALL_CLASSES, DAYS, PERIODS,
  ClassId, Day, Period, SubjectName,
  TimetableSlot, DaySchedule, ClassSchedule, FullTimetable,
  CONSECUTIVE_PAIRS, MATH_ELIGIBLE_PERIODS,
  WEEKLY_REQUIREMENTS, ValidationResult,
} from '../types';
import {
  CLASS_TEACHERS, CLASS_TEACHER_LABELS,
  SANSKRIT_TEACHER_ID, SANSKRIT_TEACHER_LABEL,
  HINDI_TEACHER_ASSIGNMENTS, HINDI_TEACHER_LABELS,
  SCIENCE_LAB_SCHEDULE,
} from '../data/schoolConfig';

// ─── Internal key helpers ────────────────────────────────────────────────────

function slotKey(day: Day, period: Period): string {
  return `${day}-${period}`;
}

function teacherKey(teacher: string, day: Day, period: Period): string {
  return `${teacher}|${day}|${period}`;
}

// ─── Generator State ─────────────────────────────────────────────────────────

interface State {
  tt: FullTimetable;
  teacherBusy: Map<string, ClassId>; // teacherKey → classId
  computerBusy: Map<string, ClassId>; // slotKey → classId
  libraryBusy: Map<string, ClassId>;
  natureClubBusy: Map<string, ClassId>;
  sciLabDay: Map<ClassId, Day>;
  blockRoomDay: Map<ClassId, Day>;
}

function initState(): State {
  const tt = {} as FullTimetable;
  for (const c of ALL_CLASSES) {
    tt[c] = {} as ClassSchedule;
    for (const d of DAYS) tt[c][d] = {} as DaySchedule;
  }
  return {
    tt,
    teacherBusy: new Map(),
    computerBusy: new Map(),
    libraryBusy: new Map(),
    natureClubBusy: new Map(),
    sciLabDay: new Map(),
    blockRoomDay: new Map(),
  };
}

// ─── Slot helpers ─────────────────────────────────────────────────────────────

function isFree(s: State, c: ClassId, d: Day, p: Period): boolean {
  return !s.tt[c][d][p];
}

function isTeacherFree(s: State, teacher: string, d: Day, p: Period): boolean {
  return !s.teacherBusy.has(teacherKey(teacher, d, p));
}

function place(
  s: State,
  c: ClassId,
  d: Day,
  p: Period,
  subject: SubjectName,
  teacher: string,
  teacherLabel: string,
  extras?: Partial<TimetableSlot>,
): void {
  s.tt[c][d][p] = { subject, teacher, teacherLabel, ...extras };
  // Mark teacher busy (first occupant wins for shared teachers)
  const tk = teacherKey(teacher, d, p);
  if (!s.teacherBusy.has(tk)) s.teacherBusy.set(tk, c);
}

// ─── Step 1: Science Lab (Fixed) ─────────────────────────────────────────────

function placeScienceLab(s: State): void {
  for (const entry of SCIENCE_LAB_SCHEDULE) {
    const { classes, day, periods } = entry;
    for (const classId of classes) {
      const teacher = CLASS_TEACHERS[classId];
      const teacherLabel = CLASS_TEACHER_LABELS[classId];
      place(s, classId, day, periods[0], 'Science Lab', teacher, teacherLabel, {
        room: 'Science Lab', isBlockStart: true,
      });
      place(s, classId, day, periods[1], 'Science Lab', teacher, teacherLabel, {
        room: 'Science Lab', isBlockContinuation: true,
      });
      s.sciLabDay.set(classId, day);
    }
  }
}

// ─── Step 2: Math (one per day, must be in P1/P2/P3) ─────────────────────────

function placeMath(s: State): void {
  for (const c of ALL_CLASSES) {
    const teacher = CLASS_TEACHERS[c];
    const label = CLASS_TEACHER_LABELS[c];
    for (const d of DAYS) {
      let placed = false;
      for (const p of MATH_ELIGIBLE_PERIODS) {
        if (isFree(s, c, d, p) && isTeacherFree(s, teacher, d, p)) {
          place(s, c, d, p, 'Math', teacher, label);
          placed = true;
          break;
        }
      }
      if (!placed) console.warn(`Math unplaced: ${c} on ${d}`);
    }
  }
}

// ─── Step 3: Block Room (2 consecutive periods, not on sci-lab day) ───────────

function placeBlockRoom(s: State): void {
  for (const c of ALL_CLASSES) {
    const teacher = CLASS_TEACHERS[c];
    const label = CLASS_TEACHER_LABELS[c];
    const sciDay = s.sciLabDay.get(c);
    let placed = false;

    for (const d of DAYS) {
      if (d === sciDay) continue;
      for (const [p1, p2] of CONSECUTIVE_PAIRS) {
        if (
          isFree(s, c, d, p1) && isFree(s, c, d, p2) &&
          isTeacherFree(s, teacher, d, p1) && isTeacherFree(s, teacher, d, p2)
        ) {
          place(s, c, d, p1, 'Block Room', teacher, label, {
            room: 'Block Room', isBlockStart: true,
          });
          place(s, c, d, p2, 'Block Room', teacher, label, {
            room: 'Block Room', isBlockContinuation: true,
          });
          s.blockRoomDay.set(c, d);
          placed = true;
          break;
        }
      }
      if (placed) break;
    }
    if (!placed) console.warn(`Block Room unplaced: ${c}`);
  }
}

// ─── Step 4: Computer Lab (not Thursday, 1 class at a time) ──────────────────

function placeComputerLab(s: State): void {
  const eligible: Day[] = ['Monday', 'Tuesday', 'Wednesday', 'Friday'];
  for (const c of ALL_CLASSES) {
    const teacher = CLASS_TEACHERS[c];
    const label = CLASS_TEACHER_LABELS[c];
    let placed = false;
    for (const d of eligible) {
      if (placed) break;
      for (const p of PERIODS) {
        const sk = slotKey(d, p);
        if (
          !s.computerBusy.has(sk) &&
          isFree(s, c, d, p) &&
          isTeacherFree(s, teacher, d, p)
        ) {
          place(s, c, d, p, 'Computer Lab', teacher, label, { room: 'Computer Lab' });
          s.computerBusy.set(sk, c);
          placed = true;
          break;
        }
      }
    }
    if (!placed) console.warn(`Computer Lab unplaced: ${c}`);
  }
}

// ─── Step 5: Library (1 class at a time) ─────────────────────────────────────

function placeLibrary(s: State): void {
  for (const c of ALL_CLASSES) {
    const teacher = CLASS_TEACHERS[c];
    const label = CLASS_TEACHER_LABELS[c];
    let placed = false;
    for (const d of DAYS) {
      if (placed) break;
      for (const p of PERIODS) {
        const sk = slotKey(d, p);
        if (
          !s.libraryBusy.has(sk) &&
          isFree(s, c, d, p) &&
          isTeacherFree(s, teacher, d, p)
        ) {
          place(s, c, d, p, 'Library', teacher, label, { room: 'Library' });
          s.libraryBusy.set(sk, c);
          placed = true;
          break;
        }
      }
    }
    if (!placed) console.warn(`Library unplaced: ${c}`);
  }
}

// ─── Step 6: Nature Club (1 class at a time) ─────────────────────────────────

function placeNatureClub(s: State): void {
  for (const c of ALL_CLASSES) {
    const teacher = CLASS_TEACHERS[c];
    const label = CLASS_TEACHER_LABELS[c];
    let placed = false;
    for (const d of DAYS) {
      if (placed) break;
      for (const p of PERIODS) {
        const sk = slotKey(d, p);
        if (
          !s.natureClubBusy.has(sk) &&
          isFree(s, c, d, p) &&
          isTeacherFree(s, teacher, d, p)
        ) {
          place(s, c, d, p, 'Nature Club', teacher, label);
          s.natureClubBusy.set(sk, c);
          placed = true;
          break;
        }
      }
    }
    if (!placed) console.warn(`Nature Club unplaced: ${c}`);
  }
}

// ─── Generic spread placer ────────────────────────────────────────────────────
// Tries to place `count` periods: first pass = 1 per eligible day (spread),
// second pass = any remaining slots if still short.

function placeSpread(
  s: State,
  c: ClassId,
  teacher: string,
  teacherLabel: string,
  subject: SubjectName,
  count: number,
  eligibleDays: Day[],
  resourceBusy?: Map<string, ClassId>,
  extras?: Partial<TimetableSlot>,
): number {
  let placed = 0;

  // Pass 1: at most 1 per day
  for (const d of eligibleDays) {
    if (placed >= count) break;
    for (const p of PERIODS) {
      const sk = slotKey(d, p);
      if (
        isFree(s, c, d, p) &&
        isTeacherFree(s, teacher, d, p) &&
        (!resourceBusy || !resourceBusy.has(sk))
      ) {
        place(s, c, d, p, subject, teacher, teacherLabel, extras);
        resourceBusy?.set(sk, c);
        placed++;
        break;
      }
    }
  }

  // Pass 2: fill remaining on any day
  if (placed < count) {
    for (const d of eligibleDays) {
      if (placed >= count) break;
      for (const p of PERIODS) {
        if (placed >= count) break;
        const sk = slotKey(d, p);
        if (
          isFree(s, c, d, p) &&
          isTeacherFree(s, teacher, d, p) &&
          (!resourceBusy || !resourceBusy.has(sk))
        ) {
          place(s, c, d, p, subject, teacher, teacherLabel, extras);
          resourceBusy?.set(sk, c);
          placed++;
        }
      }
    }
  }

  return placed;
}

// ─── Step 7: Theme (3 periods, not on sci-lab or block-room day) ──────────────

function placeTheme(s: State): void {
  for (const c of ALL_CLASSES) {
    const teacher = CLASS_TEACHERS[c];
    const label = CLASS_TEACHER_LABELS[c];
    const sciDay = s.sciLabDay.get(c);
    const blockDay = s.blockRoomDay.get(c);
    const eligible = DAYS.filter((d) => d !== sciDay && d !== blockDay);
    const n = placeSpread(s, c, teacher, label, 'Theme', 3, eligible);
    if (n < 3) console.warn(`Theme short: ${c} got ${n}/3`);
  }
}

// ─── Step 8: Sanskrit (2 periods, 1 shared teacher) ──────────────────────────
// Process in interleaved order (1A,2A,3A,4A,1B,2B,...) to spread teacher load.

function placeSanskrit(s: State): void {
  const teacher = SANSKRIT_TEACHER_ID;
  const label = SANSKRIT_TEACHER_LABEL;

  const order: ClassId[] = [];
  for (const section of ['A', 'B', 'G', 'D'] as const)
    for (const std of [1, 2, 3, 4] as const)
      order.push(`${std}${section}` as ClassId);

  for (const c of order) {
    const n = placeSpread(s, c, teacher, label, 'Sanskrit', 2, DAYS);
    if (n < 2) console.warn(`Sanskrit short: ${c} got ${n}/2`);
  }
}

// ─── Step 9: Hindi (4 periods, assigned teacher) ─────────────────────────────

function placeHindi(s: State): void {
  for (const c of ALL_CLASSES) {
    const teacher = HINDI_TEACHER_ASSIGNMENTS[c];
    const label = HINDI_TEACHER_LABELS[teacher] ?? teacher;
    const n = placeSpread(s, c, teacher, label, 'Hindi', 4, DAYS);
    if (n < 4) console.warn(`Hindi short: ${c} got ${n}/4`);
  }
}

// ─── Step 10: English (4 periods, class teacher) ─────────────────────────────

function placeEnglish(s: State): void {
  for (const c of ALL_CLASSES) {
    const teacher = CLASS_TEACHERS[c];
    const label = CLASS_TEACHER_LABELS[c];
    const n = placeSpread(s, c, teacher, label, 'English', 4, DAYS);
    if (n < 4) console.warn(`English short: ${c} got ${n}/4`);
  }
}

// ─── Step 11: Fill remaining with Free ───────────────────────────────────────

function fillFree(s: State): void {
  for (const c of ALL_CLASSES) {
    const teacher = CLASS_TEACHERS[c];
    const label = CLASS_TEACHER_LABELS[c];
    for (const d of DAYS)
      for (const p of PERIODS)
        if (!s.tt[c][d][p]) s.tt[c][d][p] = { subject: 'Free', teacher, teacherLabel: label };
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

let _cached: FullTimetable | null = null;

export function generateTimetable(): FullTimetable {
  if (_cached) return _cached;

  const s = initState();
  placeScienceLab(s);
  placeMath(s);
  placeBlockRoom(s);
  placeComputerLab(s);
  placeLibrary(s);
  placeNatureClub(s);
  placeTheme(s);
  placeSanskrit(s);
  placeHindi(s);
  placeEnglish(s);
  fillFree(s);

  _cached = s.tt;
  return s.tt;
}

// ─── Validation ───────────────────────────────────────────────────────────────

export function validateTimetable(tt: FullTimetable): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const computerSlots = new Map<string, ClassId[]>();
  const librarySlots  = new Map<string, ClassId[]>();
  const natureSlots   = new Map<string, ClassId[]>();
  const teacherSlots  = new Map<string, ClassId[]>();

  for (const c of ALL_CLASSES) {
    const counts: Partial<Record<SubjectName, number>> = {};

    for (const d of DAYS) {
      let mathOnDay = 0;
      let mathPeriod: number | null = null;

      for (const p of PERIODS) {
        const slot = tt[c][d][p];
        if (!slot) { warnings.push(`Empty slot: ${c} ${d} P${p}`); continue; }

        const sub = slot.subject;
        counts[sub] = (counts[sub] ?? 0) + 1;

        if (sub === 'Math') { mathOnDay++; mathPeriod = p; }

        // Resource clash tracking
        const sk = slotKey(d, p);
        if (sub === 'Computer Lab') {
          const arr = computerSlots.get(sk) ?? [];
          arr.push(c); computerSlots.set(sk, arr);
          if (d === 'Thursday') errors.push(`Computer Lab on Thursday: ${c}`);
        }
        if (sub === 'Library') {
          const arr = librarySlots.get(sk) ?? [];
          arr.push(c); librarySlots.set(sk, arr);
        }
        if (sub === 'Nature Club') {
          const arr = natureSlots.get(sk) ?? [];
          arr.push(c); natureSlots.set(sk, arr);
        }

        // Teacher clash tracking
        const tk = `${slot.teacher}|${d}|${p}`;
        const tarr = teacherSlots.get(tk) ?? [];
        tarr.push(c); teacherSlots.set(tk, tarr);
      }

      if (mathOnDay !== 1)
        errors.push(`${c}: Math count on ${d} = ${mathOnDay} (expected 1)`);
      if (mathPeriod && !MATH_ELIGIBLE_PERIODS.includes(mathPeriod as Period))
        errors.push(`${c}: Math on ${d} in P${mathPeriod} (must be P1/P2/P3)`);
    }

    // Check weekly counts
    const checks = Object.entries(WEEKLY_REQUIREMENTS).filter(([, v]) => v > 0);
    for (const [sub, expected] of checks) {
      const actual = counts[sub as SubjectName] ?? 0;
      if (actual < expected)
        errors.push(`${c}: ${sub} ${actual}/${expected} periods`);
      else if (actual > expected)
        warnings.push(`${c}: ${sub} ${actual}/${expected} (over)`);
    }
  }

  // Resource conflicts
  for (const [key, classes] of computerSlots)
    if (classes.length > 1) errors.push(`Computer Lab conflict ${key}: ${classes.join(', ')}`);
  for (const [key, classes] of librarySlots)
    if (classes.length > 1) errors.push(`Library conflict ${key}: ${classes.join(', ')}`);
  for (const [key, classes] of natureSlots)
    if (classes.length > 1) errors.push(`Nature Club conflict ${key}: ${classes.join(', ')}`);
  for (const [key, classes] of teacherSlots)
    if (classes.length > 1) errors.push(`Teacher clash ${key}: ${classes.join(', ')}`);

  return { valid: errors.length === 0, errors, warnings };
}

// ─── Teacher Schedule Extractor ───────────────────────────────────────────────

export interface TeacherDayPeriod {
  day: Day;
  period: Period;
  classId: ClassId;
  subject: SubjectName;
}

export function getTeacherSchedule(
  tt: FullTimetable,
  teacherId: string,
): TeacherDayPeriod[] {
  const result: TeacherDayPeriod[] = [];
  for (const c of ALL_CLASSES) {
    for (const d of DAYS) {
      for (const p of PERIODS) {
        const slot = tt[c][d][p];
        if (slot?.teacher === teacherId) {
          result.push({ day: d, period: p, classId: c, subject: slot.subject });
        }
      }
    }
  }
  return result;
}
