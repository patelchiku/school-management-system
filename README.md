# School Management System

A full-featured school timetable management system built with React, TypeScript, and Tailwind CSS.

## Features

- **Auto-generated timetable** for 16 classes (Standards 1–4, Sections A·B·G·D)
- **Constraint-based scheduling engine** — satisfies all school rules automatically
- **Class Timetable view** — week-at-a-glance for any class with period summary
- **Teacher Schedule view** — weekly workload for all 21 teachers
- **Validation panel** — live constraint checking with error/warning reporting
- **Print support** — A4 landscape print layout for any timetable
- **Colour-coded subjects** — instant visual scanning

---

## School Configuration

| Item | Value |
|------|-------|
| Classes | 16 (1A · 1B · 1G · 1D through 4A · 4B · 4G · 4D) |
| School days | Monday – Friday |
| Periods/day | 7 (35-min each) |
| School hours | 7:25 – 13:05 |
| Break 1 | 9:15 – 9:40 |
| Break 2 | 11:25 – 11:40 |
| Home Period | 7:25–7:45 and 12:50–13:05 |
| Prayer | 7:45 – 8:05 |

### Weekly Subjects per Class

| Subject | Periods | Notes |
|---------|---------|-------|
| Math | 5 | 1 per day, must be in P1/P2/P3 |
| English | 4 | Class teacher |
| Theme | 3 | Not on Sci Lab or Block Room day |
| Science Lab | 2 (1 visit) | Fixed day per standard (see below) |
| Computer Lab | 1 | Not on Thursday |
| Block Room | 2 (1 visit) | Consecutive, not on Sci Lab day |
| Nature Club | 1 | 1 class at a time |
| Library | 1 | 1 class at a time |
| Sanskrit | 2 | Shared teacher |
| Hindi | 4 | 3 teachers (6+5+5 classes each) |

### Science Lab Fixed Schedule

| Day | Classes | Periods |
|-----|---------|---------|
| Monday | Std 4 (4A+4B / 4G+4D) | P1-2 / P3-4 |
| Tuesday | 2A + 2B | P1-2 |
| Wednesday | 2G+2D / 3A+3B / 3G+3D | P1-2 / P3-4 / P6-7 |
| Friday | 1A+1B / 1G+1D | P1-2 / P3-4 |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS v3 |
| Routing | React Router v6 |
| Icons | Lucide React |
| Frontend Host | **Vercel** |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Local Development

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Production Build

```bash
cd frontend
npm run build
npm run preview
```

---

## Deployment

### Vercel (Frontend)

1. Push the repo to GitHub.
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your GitHub repo.
3. Set **Root Directory** to `frontend`.
4. Leave all other settings as default — Vercel auto-detects Vite.
5. Click **Deploy**.

Every push to `main` triggers a new deployment automatically.

---

## Project Structure

```
school-management-system/
├── frontend/
│   ├── src/
│   │   ├── types/index.ts          ← all TypeScript types
│   │   ├── data/schoolConfig.ts    ← teachers, classes, sci-lab schedule
│   │   ├── engine/generator.ts     ← constraint-based timetable generator
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   ├── TimetableGrid.tsx
│   │   │   ├── SubjectBadge.tsx
│   │   │   └── PrintButton.tsx
│   │   └── pages/
│   │       ├── DashboardPage.tsx
│   │       ├── ClassTimetablePage.tsx
│   │       ├── TeacherTimetablePage.tsx
│   │       └── ValidationPage.tsx
│   ├── vercel.json
│   └── package.json
├── .github/workflows/ci.yml
└── README.md
```

---

## Scheduling Constraints Enforced

1. Math in Period 1, 2, or 3 only — every day
2. Science Lab fixed by standard and day
3. Block Room = 2 consecutive periods, not on Sci Lab day
4. Theme cannot be on Sci Lab day or Block Room day
5. Computer Lab — not on Thursday; max 1 class simultaneously
6. Library — max 1 class simultaneously
7. Nature Club — max 1 class simultaneously
8. Sanskrit teacher not double-booked (32 periods/week across 16 classes)
9. Hindi teachers not double-booked
10. Class teachers not double-booked

---

*Built with expert knowledge of school operations and React best practices.*
