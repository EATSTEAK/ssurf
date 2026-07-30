import {
  ChapelApplicationBuilder,
  ChapelApplicationInterface,
  CourseGradesApplicationBuilder,
  CourseGradesApplicationInterface,
  CourseScheduleApplicationBuilder,
  GraduationRequirementsApplicationBuilder,
  GraduationRequirementsApplicationInterface,
  PersonalCourseScheduleApplicationBuilder,
  PersonalCourseScheduleApplicationInterface,
  ScholarshipsApplicationBuilder,
  ScholarshipsApplicationInterface,
  StudentInformationApplicationBuilder,
  StudentInformationApplicationInterface,
  USaintSessionInterface,
  YearSemester,
} from '@rusaint/react-native';

type WithDefaultSemester<T> = {
  client: T;
  defaultSemester: null | YearSemester;
};

type ApplicationValues = {
  chapel: WithDefaultSemester<ChapelApplicationInterface>;
  grades: WithDefaultSemester<CourseGradesApplicationInterface>;
  graduationRequirements: GraduationRequirementsApplicationInterface;
  personalCourseSchedule: WithDefaultSemester<PersonalCourseScheduleApplicationInterface>;
  scholarships: ScholarshipsApplicationInterface;
  studentInformation: StudentInformationApplicationInterface;
};

type ApplicationName = keyof ApplicationValues;

type Deferred<T> = {
  promise: Promise<T>;
  reject: (error: Error) => void;
  resolve: (value: T) => void;
  readonly settled: boolean;
};

type ApplicationSlots = { [K in ApplicationName]: Deferred<ApplicationValues[K]> };

export class ApplicationRuntimeResetError extends Error {
  constructor() {
    super('Application runtime was reset');
    this.name = 'ApplicationRuntimeResetError';
  }
}

const createDeferred = <T>(): Deferred<T> => {
  let settled = false;
  let rejectPromise!: (error: Error) => void;
  let resolvePromise!: (value: T) => void;
  const promise = new Promise<T>((resolve, reject) => {
    rejectPromise = reject;
    resolvePromise = resolve;
  });

  void promise.catch(() => undefined);

  return {
    promise,
    get settled() {
      return settled;
    },
    reject: (error) => {
      if (!settled) {
        settled = true;
        rejectPromise(error);
      }
    },
    resolve: (value) => {
      if (!settled) {
        settled = true;
        resolvePromise(value);
      }
    },
  };
};

const createSlots = (): ApplicationSlots => ({
  chapel: createDeferred(),
  grades: createDeferred(),
  graduationRequirements: createDeferred(),
  personalCourseSchedule: createDeferred(),
  scholarships: createDeferred(),
  studentInformation: createDeferred(),
});

const applicationNames = Object.freeze<ApplicationName[]>([
  'chapel',
  'grades',
  'graduationRequirements',
  'personalCourseSchedule',
  'scholarships',
  'studentInformation',
]);

let currentSession: null | USaintSessionInterface = null;
let currentStudentId: null | string = null;
let generation = 0;
let slots = createSlots();
let startPromise: null | Promise<void> = null;
const listeners = new Set<() => void>();

const notify = () => {
  for (const listener of listeners) {
    listener();
  }
};

const rejectPending = (error: Error) => {
  for (const name of applicationNames) {
    slots[name].reject(error);
  }
};

const replaceSlots = () => {
  rejectPending(new ApplicationRuntimeResetError());
  slots = createSlots();
};

const start = (session: USaintSessionInterface, studentId: string) => {
  if (session === currentSession && studentId === currentStudentId && startPromise) {
    return startPromise;
  }

  const alreadyStarted = currentSession != null;
  if (alreadyStarted) {
    generation += 1;
    replaceSlots();
  }

  currentSession = session;
  currentStudentId = studentId;
  const currentGeneration = generation;
  const currentSlots = slots;

  const run = (async () => {
    try {
      // 각 builder는 U-Saint 탭 하나를 열기 때문에 기존 순서대로 직렬 생성한다.
      const studentInformation = await new StudentInformationApplicationBuilder().build(session);
      if (currentGeneration !== generation) {
        return;
      }
      currentSlots.studentInformation.resolve(studentInformation);

      const chapel = await new ChapelApplicationBuilder().build(session);
      const defaultChapelSemester = await chapel.getSelectedSemester();
      if (currentGeneration !== generation) {
        return;
      }
      currentSlots.chapel.resolve({ client: chapel, defaultSemester: defaultChapelSemester });

      // 소비자는 없지만 기존 U-Saint 애플리케이션 초기화 순서를 유지한다.
      await new CourseScheduleApplicationBuilder().build(session);
      if (currentGeneration !== generation) {
        return;
      }

      const personalCourseSchedule = await new PersonalCourseScheduleApplicationBuilder().build(
        session,
      );
      const defaultScheduleSemester = await personalCourseSchedule
        .getSelectedSemester()
        .catch(() => null);
      if (currentGeneration !== generation) {
        return;
      }
      currentSlots.personalCourseSchedule.resolve({
        client: personalCourseSchedule,
        defaultSemester: defaultScheduleSemester,
      });

      const grades = await new CourseGradesApplicationBuilder().build(session);
      const defaultGradesSemester = await grades.getSelectedSemester();
      if (currentGeneration !== generation) {
        return;
      }
      currentSlots.grades.resolve({ client: grades, defaultSemester: defaultGradesSemester });

      const graduationRequirements = await new GraduationRequirementsApplicationBuilder().build(
        session,
      );
      if (currentGeneration !== generation) {
        return;
      }
      currentSlots.graduationRequirements.resolve(graduationRequirements);

      const scholarships = await new ScholarshipsApplicationBuilder().build(session);
      if (currentGeneration !== generation) {
        return;
      }
      currentSlots.scholarships.resolve(scholarships);
    } catch (error) {
      if (currentGeneration === generation) {
        rejectPending(error instanceof Error ? error : new Error(String(error)));
        startPromise = null;
      }
      throw error;
    }
  })();

  startPromise = run;
  void run.catch(() => undefined);
  notify();
  return run;
};

const get = <K extends ApplicationName>(
  name: K,
  studentId: string,
  expectedGeneration: number,
): Promise<ApplicationValues[K]> => {
  if (currentStudentId != null && currentStudentId !== studentId) {
    return Promise.reject(new ApplicationRuntimeResetError());
  }

  let requestGeneration = expectedGeneration;
  if (!startPromise && currentSession && currentStudentId === studentId) {
    start(currentSession, studentId);
    requestGeneration = generation;
  }

  if (requestGeneration !== generation) {
    return Promise.reject(new ApplicationRuntimeResetError());
  }

  const slot = slots[name];
  return slot.promise.then((value) => {
    if (
      currentStudentId !== studentId ||
      generation !== requestGeneration ||
      slots[name] !== slot
    ) {
      throw new ApplicationRuntimeResetError();
    }
    return value;
  });
};

const reset = () => {
  generation += 1;
  rejectPending(new ApplicationRuntimeResetError());
  slots = createSlots();
  currentSession = null;
  currentStudentId = null;
  startPromise = null;
  notify();
};

export const applications = {
  get,
  getGeneration: () => generation,
  reset,
  start,
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
