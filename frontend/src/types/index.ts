// ─── Days & Periods ─────────────────────────────────────────────────────────

export type Day = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
export const DAYS: Day[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export type Period = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export const PERIODS: Period[] = [1, 2, 3, 4, 5, 6, 7];

// ─── Classes ────────────────────────────────────────────────────────────────

export type ClassId =
  | '1A' | '1B' | '1G' | '1D'
  | '2A' | '2B' | '2G' | '2D'
  | '3A' | '3B' | '3G' | '3D'
  | '4A' | '4B' | '4G' | '4D';

export const ALL_CLASSES: ClassId[] = [
  '1A', '1B', '1G', '1D',
  '2A', '2B', '2G', '2D',
  '3A', '3B', '3G', '3D',
  '4A', '4B', '4G', '4D',
];

export const CLASS_STANDARDS: Record<ClassId, number> = {
  '1A': 1, '1B': 1, '1G': 1, '1D': 1,
  '2A': 2, '2B': 2, '2G': 2, '2D': 2,
  '3A': 3, '3B': 3, '3G': 3, '3D': 3,
  '4A': 4, '4B': 4, '4G': 4, '4D': 4,
};

export function getStandard(classId: ClassId): number {
  return CLASS_STANDARDS[classId];
}

// ─── Period Timings ──────────────────────────────────────────────────────────

export interface PeriodTiming {
  period: Period;
  start: string;
  end: string;
}

export const PERIOD_TIMINGS: PeriodTiming[] = [
  { period: 1, start: '8:05', end: '8:40' },
  { period: 2, start: '8:40', end: '9:15' },
  { period: 3, start: '9:40', end: '10:15' },
  { period: 4, start: '10:15', end: '10:50' },
  { period: 5, start: '10:50', end: '11:25' },
  { period: 6, start: '11:40', end: '12:15' },
  { period: 7, start: '12:15', end: '12:50' },
];

/**
 * Consecutive period pairs (no break between them).
 * Break 1 falls between P2 and P3 (9:15–9:40).
 * Break 2 falls between P5 and P6 (11:25–11:40).
 */
export const CONSECUTIVE_PAIRS: [Period, Period][] = [
  [1, 2],
  [3, 4],
  [4, 5],
  [6, 7],
];

// Math must be placed in period 1, 2, or 3 each day
export const MATH_ELIGIBLE_PERIODS: Period[] = [1, 2, 3];

// ─── Subjects ────────────────────────────────────────────────────────────────

export type SubjectName =
  | 'Math'
  | 'English'
  | 'Theme'
  | 'Science Lab'
  | 'Computer Lab'
  | 'Block Room'
  | 'Nature Club'
  | 'Library'
  | 'Sanskrit'
  | 'Hindi'
  | 'Free';

export const SUBJECT_COLORS: Record<SubjectName, { bg: string; text: string; border: string }> = {
  'Math':         { bg: 'bg-blue-100',   text: 'text-blue-800',   border: 'border-blue-300' },
  'English':      { bg: 'bg-green-100',  text: 'text-green-800',  border: 'border-green-300' },
  'Theme':        { bg: 'bg-amber-100',  text: 'text-amber-800',  border: 'border-amber-300' },
  'Science Lab':  { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
  'Computer Lab': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
  'Block Room':   { bg: 'bg-pink-100',   text: 'text-pink-800',   border: 'border-pink-300' },
  'Nature Club':  { bg: 'bg-teal-100',   text: 'text-teal-800',   border: 'border-teal-300' },
  'Library':      { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-300' },
  'Sanskrit':     { bg: 'bg-red-100',    text: 'text-red-800',    border: 'border-red-300' },
  'Hindi':        { bg: 'bg-cyan-100',   text: 'text-cyan-800',   border: 'border-cyan-300' },
  'Free':         { bg: 'bg-gray-50',    text: 'text-gray-400',   border: 'border-gray-200' },
};

// ─── Timetable Data ──────────────────────────────────────────────────────────

export interface TimetableSlot {
  subject: SubjectName;
  teacher: string;
  teacherLabel: string;
  room?: string;
  isBlockStart?: boolean;       // First period of a 2-period block
  isBlockContinuation?: boolean; // Second period of a 2-period block
}

export type DaySchedule = Partial<Record<Period, TimetableSlot>>;
export type ClassSchedule = Record<Day, DaySchedule>;
export type FullTimetable = Record<ClassId, ClassSchedule>;

// ─── Teachers ────────────────────────────────────────────────────────────────

export interface TeacherInfo {
  id: string;
  label: string;
  subject: string;
  classes: ClassId[];
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// ─── Suggestions ─────────────────────────────────────────────────────────────

export interface SlotChange {
  classId: ClassId;
  day: Day;
  period: Period;
  newSlot: TimetableSlot;
}

export interface Suggestion {
  id: string;
  type: 'fix' | 'optimize' | 'info';
  severity: 'error' | 'warning' | 'info';
  title: string;
  description: string;
  changes: SlotChange[];
}

// Weekly period requirements per class (timetable slots consumed)
export const WEEKLY_REQUIREMENTS: Record<SubjectName, number> = {
  'Math':         5,
  'English':      4,
  'Theme':        3,
  'Science Lab':  2,  // counts as 2 timetable slots (1 visit = 2 consecutive periods)
  'Computer Lab': 1,
  'Block Room':   2,  // 1 visit = 2 consecutive periods
  'Nature Club':  1,
  'Library':      1,
  'Sanskrit':     2,
  'Hindi':        4,
  'Free':         0,
};
