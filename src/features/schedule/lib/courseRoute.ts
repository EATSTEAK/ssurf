import type { CourseScheduleEntity } from '@/entities/courseSchedule/model';

export type RouteParam = string | string[] | undefined;

export type CourseScheduleRouteParams = {
  classroom?: RouteParam;
  endTime?: RouteParam;
  name?: RouteParam;
  professor?: RouteParam;
  semester?: RouteParam;
  startTime?: RouteParam;
  weekday?: RouteParam;
  year?: RouteParam;
};

export type ScheduleRouteItem = Omit<CourseScheduleEntity, 'studentId'>;

const singleParam = (value: RouteParam) => (typeof value === 'string' ? value : null);

export const parseCourseCode = (value: RouteParam): null | string => {
  const code = singleParam(value)?.trim();
  return code && /^\d{10}$/.test(code) ? code : null;
};

export const parseCourseScheduleRouteParams = (
  params: CourseScheduleRouteParams,
): null | ScheduleRouteItem => {
  const classroom = singleParam(params.classroom);
  const endTimeParam = singleParam(params.endTime);
  const name = singleParam(params.name);
  const professor = singleParam(params.professor);
  const semesterParam = singleParam(params.semester);
  const startTimeParam = singleParam(params.startTime);
  const weekdayParam = singleParam(params.weekday);
  const yearParam = singleParam(params.year);

  if (
    classroom === null ||
    endTimeParam === null ||
    !name?.trim() ||
    professor === null ||
    semesterParam === null ||
    startTimeParam === null ||
    weekdayParam === null ||
    yearParam === null
  ) {
    return null;
  }

  const endTime = Number(endTimeParam);
  const semester = Number(semesterParam);
  const startTime = Number(startTimeParam);
  const weekday = Number(weekdayParam);
  const year = Number(yearParam);

  if (
    !Number.isInteger(year) ||
    year < 2000 ||
    year > 2100 ||
    !Number.isInteger(semester) ||
    semester < 0 ||
    semester > 3 ||
    !Number.isInteger(weekday) ||
    weekday < 0 ||
    weekday > 6 ||
    !Number.isInteger(startTime) ||
    !Number.isInteger(endTime) ||
    startTime < 0 ||
    endTime > 24 * 60 ||
    endTime <= startTime
  ) {
    return null;
  }

  return { classroom, endTime, name, professor, semester, startTime, weekday, year };
};
