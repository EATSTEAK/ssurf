import { USaintSessionInterface, YearSemester } from '@rusaint/react-native';
import { createContext, useContext, useEffect, useState, useSyncExternalStore } from 'react';

import { applications } from '@/shared/lib/applications';
import { useRusaintSession } from '@/shared/providers/RusaintSessionProvider';

export interface RusaintApplicationContext {
  defaultChapelSemester: null | YearSemester;
  defaultGradesSemester: null | YearSemester;
  defaultScheduleSemester: null | YearSemester;
  studentId: null | string;
}

const RusaintApplicationContext = createContext<RusaintApplicationContext>({
  defaultChapelSemester: null,
  defaultGradesSemester: null,
  defaultScheduleSemester: null,
  studentId: null,
});

type DefaultSemesters = {
  defaultChapelSemester: null | YearSemester;
  defaultGradesSemester: null | YearSemester;
  defaultScheduleSemester: null | YearSemester;
  session: null | USaintSessionInterface;
};

const emptyDefaults = (session: null | USaintSessionInterface): DefaultSemesters => ({
  defaultChapelSemester: null,
  defaultGradesSemester: null,
  defaultScheduleSemester: null,
  session,
});

export const RusaintApplicationProvider = ({ children }: React.PropsWithChildren<unknown>) => {
  const { session, studentId } = useRusaintSession();
  const [defaults, setDefaults] = useState<DefaultSemesters>(() => emptyDefaults(null));
  const generation = useSyncExternalStore(
    applications.subscribe,
    applications.getGeneration,
    applications.getGeneration,
  );

  useEffect(() => {
    if (!session || !studentId) {
      return;
    }

    let active = true;

    void applications.get('chapel', studentId, generation).then(
      ({ defaultSemester }) => {
        if (active) {
          setDefaults((current) => ({
            ...(current.session === session ? current : emptyDefaults(session)),
            defaultChapelSemester: defaultSemester,
          }));
        }
      },
      () => undefined,
    );

    void applications.get('grades', studentId, generation).then(
      ({ defaultSemester }) => {
        if (active) {
          setDefaults((current) => ({
            ...(current.session === session ? current : emptyDefaults(session)),
            defaultGradesSemester: defaultSemester,
          }));
        }
      },
      () => undefined,
    );

    void applications.get('personalCourseSchedule', studentId, generation).then(
      ({ defaultSemester }) => {
        if (active) {
          setDefaults((current) => ({
            ...(current.session === session ? current : emptyDefaults(session)),
            defaultScheduleSemester: defaultSemester,
          }));
        }
      },
      () => undefined,
    );

    return () => {
      active = false;
    };
  }, [generation, session, studentId]);

  const currentDefaults = defaults.session === session ? defaults : emptyDefaults(session);

  return (
    <RusaintApplicationContext.Provider
      value={{
        defaultChapelSemester: currentDefaults.defaultChapelSemester,
        defaultGradesSemester: currentDefaults.defaultGradesSemester,
        defaultScheduleSemester: currentDefaults.defaultScheduleSemester,
        studentId,
      }}
    >
      {children}
    </RusaintApplicationContext.Provider>
  );
};

export const useRusaintApplication = () => {
  const context = useContext(RusaintApplicationContext);

  if (!context) {
    throw new Error('useRusaintApplication은 RusaintProvider 하위에서 사용되어야 해요.');
  }

  return context;
};
