import type { CourseScheduleEntity } from '@/entities/courseSchedule/model';
import type { Lecture, YearSemester } from '@rusaint/react-native';

export type CourseMatchCandidate = {
  lecture: Pick<Lecture, 'name' | 'professor' | 'scheduleRoom'>;
};

const normalizeCourseText = (value: string) => value.toLocaleLowerCase().replace(/\s+/g, '');

const scheduleRoomTimes = (value: string) =>
  Array.from(
    value.matchAll(/(\d{1,2}):(\d{2})/g),
    (match) => Number(match[1]) * 60 + Number(match[2]),
  );

export const findBestCourseMatches = <T extends CourseMatchCandidate>(
  schedule: Pick<
    CourseScheduleEntity,
    'classroom' | 'endTime' | 'name' | 'professor' | 'startTime'
  >,
  candidates: readonly T[],
): T[] => {
  const scheduleName = normalizeCourseText(schedule.name);
  const scheduleProfessor = normalizeCourseText(schedule.professor);
  const scheduleClassroom = normalizeCourseText(schedule.classroom);
  const scored = candidates
    .filter((candidate) => normalizeCourseText(candidate.lecture.name) === scheduleName)
    .map((candidate) => {
      const professor = normalizeCourseText(candidate.lecture.professor);
      const scheduleRoom = normalizeCourseText(candidate.lecture.scheduleRoom);
      const times = scheduleRoomTimes(candidate.lecture.scheduleRoom);
      let score = 0;

      if (
        scheduleProfessor &&
        professor &&
        (professor.includes(scheduleProfessor) || scheduleProfessor.includes(professor))
      ) {
        score += 4;
      }
      if (scheduleClassroom && scheduleRoom.includes(scheduleClassroom)) {
        score += 2;
      }
      if (times.includes(schedule.startTime)) {
        score += 1;
      }
      if (times.includes(schedule.endTime)) {
        score += 1;
      }

      return { candidate, score };
    });

  const bestScore = Math.max(...scored.map(({ score }) => score), -1);
  return scored.filter(({ score }) => score === bestScore).map(({ candidate }) => candidate);
};

export const buildScheduleSemesters = (
  estimatedSemester: YearSemester,
  enrollmentSemesters: readonly YearSemester[],
  defaultSemester: null | YearSemester,
  selectedSemester: null | YearSemester,
): YearSemester[] => {
  const semesters = [
    selectedSemester,
    defaultSemester,
    estimatedSemester,
    ...enrollmentSemesters,
  ].filter((semester): semester is YearSemester => semester != null);

  return semesters.filter(
    (semester, index) =>
      semesters.findIndex(
        (candidate) => candidate.year === semester.year && candidate.semester === semester.semester,
      ) === index,
  );
};

export const formatMinutesToTime = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
};

export const formatTimeRange = (startTime: number, endTime: number): string =>
  `${formatMinutesToTime(startTime)} - ${formatMinutesToTime(endTime)}`;

export const isScheduleActive = (
  item: Pick<CourseScheduleEntity, 'endTime' | 'startTime' | 'weekday'>,
  now: Date,
): boolean => {
  const weekday = (now.getDay() + 6) % 7;
  const minutes = now.getHours() * 60 + now.getMinutes();
  return item.weekday === weekday && item.startTime <= minutes && minutes < item.endTime;
};

export const getGridBounds = (
  data: CourseScheduleEntity[],
): { endHour: number; startHour: number; weekdays: number[] } => {
  if (data.length === 0) {
    return { startHour: 9, endHour: 18, weekdays: [0, 1, 2, 3, 4] };
  }

  let minStart = 24 * 60;
  let maxEnd = 0;
  const weekdaySet = new Set<number>([0, 1, 2, 3, 4]);

  for (const item of data) {
    if (item.startTime < minStart) {
      minStart = item.startTime;
    }
    if (item.endTime > maxEnd) {
      maxEnd = item.endTime;
    }
    weekdaySet.add(item.weekday);
  }

  const startHour = Math.min(Math.floor(minStart / 60), 9);
  const endHour = Math.ceil(maxEnd / 60) + 1;
  const weekdays = Array.from(weekdaySet).sort((a, b) => a - b);

  return { startHour, endHour, weekdays };
};

const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
};

export const assignCourseColorIndices = (
  items: ReadonlyArray<{ name: string; startTime: number; weekday: number }>,
  colorSize: number,
): number[] => {
  // 1. 각 item에 대해 name 해시 기반 primary index 계산
  const primaryIndices = items.map((item) => hashString(item.name) % colorSize);

  // 2. 요일별로 그룹화 후 startTime 오름차순 정렬
  const indexed = items.map((item, i) => ({ item, originalIndex: i }));
  const byDay = new Map<number, typeof indexed>();
  for (const entry of indexed) {
    const existing = byDay.get(entry.item.weekday) ?? [];
    existing.push(entry);
    byDay.set(entry.item.weekday, existing);
  }

  // 3. 정렬된 순서로 순회하면서 직전 과목과 색이 겹치면 대체
  const result = new Array<number>(items.length);
  for (const entries of byDay.values()) {
    entries.sort((a, b) => a.item.startTime - b.item.startTime);
    let prevColor = -1;
    for (const { originalIndex } of entries) {
      let color = primaryIndices[originalIndex];
      if (color === prevColor) {
        color = (color + 3) % colorSize;
      }
      result[originalIndex] = color;
      prevColor = color;
    }
  }

  return result;
};

export const HOUR_HEIGHT = 40;

export const WEEKDAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];
