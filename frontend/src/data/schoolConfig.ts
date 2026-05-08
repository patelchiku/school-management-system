import { ClassId, Day, Period, TeacherInfo, ALL_CLASSES } from '../types';

// ─── Class Teachers ───────────────────────────────────────────────────────────
// Each of the 16 classes has its own dedicated class teacher.

export const CLASS_TEACHERS: Record<ClassId, string> = {
  '1A': 'CT-1A', '1B': 'CT-1B', '1G': 'CT-1G', '1D': 'CT-1D',
  '2A': 'CT-2A', '2B': 'CT-2B', '2G': 'CT-2G', '2D': 'CT-2D',
  '3A': 'CT-3A', '3B': 'CT-3B', '3G': 'CT-3G', '3D': 'CT-3D',
  '4A': 'CT-4A', '4B': 'CT-4B', '4G': 'CT-4G', '4D': 'CT-4D',
};

export const CLASS_TEACHER_LABELS: Record<ClassId, string> = {
  '1A': 'Class Teacher 1A', '1B': 'Class Teacher 1B',
  '1G': 'Class Teacher 1G', '1D': 'Class Teacher 1D',
  '2A': 'Class Teacher 2A', '2B': 'Class Teacher 2B',
  '2G': 'Class Teacher 2G', '2D': 'Class Teacher 2D',
  '3A': 'Class Teacher 3A', '3B': 'Class Teacher 3B',
  '3G': 'Class Teacher 3G', '3D': 'Class Teacher 3D',
  '4A': 'Class Teacher 4A', '4B': 'Class Teacher 4B',
  '4G': 'Class Teacher 4G', '4D': 'Class Teacher 4D',
};

// ─── Sanskrit Teacher ─────────────────────────────────────────────────────────
// One teacher covers all 16 classes (2 periods/class = 32 periods/week)

export const SANSKRIT_TEACHER_ID = 'Sanskrit-T1';
export const SANSKRIT_TEACHER_LABEL = 'Sanskrit Teacher';

// ─── Hindi Teachers ───────────────────────────────────────────────────────────
// T1: 6 classes (2 from Std 1, 2 from Std 2, 2 from Std 3)  → 24 periods/week
// T2: 5 classes                                               → 20 periods/week
// T3: 5 classes                                               → 20 periods/week

export const HINDI_TEACHER_ASSIGNMENTS: Record<ClassId, string> = {
  // T1: 1A, 1B | 2A, 2B | 3A, 3B
  '1A': 'Hindi-T1', '1B': 'Hindi-T1',
  '2A': 'Hindi-T1', '2B': 'Hindi-T1',
  '3A': 'Hindi-T1', '3B': 'Hindi-T1',
  // T2: 1G, 1D | 2G, 2D | 3G
  '1G': 'Hindi-T2', '1D': 'Hindi-T2',
  '2G': 'Hindi-T2', '2D': 'Hindi-T2',
  '3G': 'Hindi-T2',
  // T3: 3D | all Std 4
  '3D': 'Hindi-T3',
  '4A': 'Hindi-T3', '4B': 'Hindi-T3',
  '4G': 'Hindi-T3', '4D': 'Hindi-T3',
};

export const HINDI_TEACHER_LABELS: Record<string, string> = {
  'Hindi-T1': 'Hindi Teacher 1',
  'Hindi-T2': 'Hindi Teacher 2',
  'Hindi-T3': 'Hindi Teacher 3',
};

// ─── Science Lab Schedule (FIXED) ────────────────────────────────────────────
//
// Lab visits are 2 consecutive periods; 2 class sections share the lab
// simultaneously per slot.
//
// Consecutive valid pairs (no break between): (1,2) (3,4) (4,5) (6,7)
//
// Monday    P1-P2 : 4A + 4B  |  P3-P4 : 4G + 4D
// Tuesday   P1-P2 : 2A + 2B
// Wednesday P1-P2 : 2G + 2D  |  P3-P4 : 3A + 3B  |  P6-P7 : 3G + 3D
// Friday    P1-P2 : 1A + 1B  |  P3-P4 : 1G + 1D

export interface ScienceLabEntry {
  classes: [ClassId, ClassId];
  day: Day;
  periods: [Period, Period];
}

export const SCIENCE_LAB_SCHEDULE: ScienceLabEntry[] = [
  // Monday – Standard 4
  { classes: ['4A', '4B'], day: 'Monday',    periods: [1, 2] },
  { classes: ['4G', '4D'], day: 'Monday',    periods: [3, 4] },
  // Tuesday – Standard 2 first half
  { classes: ['2A', '2B'], day: 'Tuesday',   periods: [1, 2] },
  // Wednesday – Standard 2 second half + Standard 3
  { classes: ['2G', '2D'], day: 'Wednesday', periods: [1, 2] },
  { classes: ['3A', '3B'], day: 'Wednesday', periods: [3, 4] },
  { classes: ['3G', '3D'], day: 'Wednesday', periods: [6, 7] },
  // Friday – Standard 1
  { classes: ['1A', '1B'], day: 'Friday',    periods: [1, 2] },
  { classes: ['1G', '1D'], day: 'Friday',    periods: [3, 4] },
];

// ─── Teacher Registry ─────────────────────────────────────────────────────────

export const ALL_TEACHERS: TeacherInfo[] = [
  ...ALL_CLASSES.map((classId) => ({
    id: CLASS_TEACHERS[classId],
    label: CLASS_TEACHER_LABELS[classId],
    subject: 'Class Teacher',
    classes: [classId],
  })),
  {
    id: SANSKRIT_TEACHER_ID,
    label: SANSKRIT_TEACHER_LABEL,
    subject: 'Sanskrit',
    classes: ALL_CLASSES,
  },
  {
    id: 'Hindi-T1',
    label: 'Hindi Teacher 1',
    subject: 'Hindi',
    classes: ['1A', '1B', '2A', '2B', '3A', '3B'],
  },
  {
    id: 'Hindi-T2',
    label: 'Hindi Teacher 2',
    subject: 'Hindi',
    classes: ['1G', '1D', '2G', '2D', '3G'],
  },
  {
    id: 'Hindi-T3',
    label: 'Hindi Teacher 3',
    subject: 'Hindi',
    classes: ['3D', '4A', '4B', '4G', '4D'],
  },
];

export function getTeacherById(id: string): TeacherInfo | undefined {
  return ALL_TEACHERS.find((t) => t.id === id);
}
