import {
  ChapelApplicationBuilder,
  ChapelApplicationInterface,
  CourseGradesApplicationBuilder,
  CourseGradesApplicationInterface,
  CourseScheduleApplicationBuilder,
  CourseScheduleApplicationInterface,
  GraduationRequirementsApplicationBuilder,
  GraduationRequirementsApplicationInterface,
  ScholarshipsApplicationBuilder,
  ScholarshipsApplicationInterface,
  StudentInformationApplicationBuilder,
  StudentInformationApplicationInterface,
  YearSemester,
} from '@rusaint/react-native';
import { createContext, useContext, useState } from 'react';
import { useAsyncEffect } from 'react-simplikit';

import { useRusaintSession } from '@/components/providers/RusaintSessionProvider';
export interface RusaintApplicationContext {
  chapelClient: ChapelApplicationInterface | null;
  courseScheduleClient: CourseScheduleApplicationInterface | null;
  defaultChapelSemester: null | YearSemester;
  defaultGradesSemester: null | YearSemester;
  gradesClient: CourseGradesApplicationInterface | null;
  graduationRequirementsClient: GraduationRequirementsApplicationInterface | null;
  scholarshipsClient: null | ScholarshipsApplicationInterface;
  studentInformationClient: null | StudentInformationApplicationInterface;
}

const RusaintApplicationContext = createContext<RusaintApplicationContext>({
  chapelClient: null,
  courseScheduleClient: null,
  defaultChapelSemester: null,
  defaultGradesSemester: null,
  gradesClient: null,
  graduationRequirementsClient: null,
  scholarshipsClient: null,
  studentInformationClient: null,
});

export const RusaintApplicationProvider = ({ children }: React.PropsWithChildren<unknown>) => {
  const { session } = useRusaintSession();

  const [chapelClient, setChapelClient] = useState<ChapelApplicationInterface | null>(null);
  const [courseScheduleClient, setCourseScheduleClient] =
    useState<CourseScheduleApplicationInterface | null>(null);
  const [gradesClient, setGradesClient] = useState<CourseGradesApplicationInterface | null>(null);
  const [graduationRequirementsClient, setGraduationRequirementsClient] =
    useState<GraduationRequirementsApplicationInterface | null>(null);
  const [scholarshipsClient, setScholarshipsClient] =
    useState<null | ScholarshipsApplicationInterface>(null);
  const [studentInformationClient, setStudentInformationClient] =
    useState<null | StudentInformationApplicationInterface>(null);
  const [defaultChapelSemester, setDefaultChapelSemester] = useState<null | YearSemester>(null);
  const [defaultGradesSemester, setDefaultGradesSemester] = useState<null | YearSemester>(null);

  useAsyncEffect(async () => {
    if (!session) {
      return;
    }
    // NOTE: 각 애플리케이션을 생성하는 것은 서버(u-saint) 입장에서 탭을 하나 띄우는 것과 동일하므로, 동시에 요청하지 않고 순차적으로 요청해요
    const chapel = await new ChapelApplicationBuilder().build(session);
    setDefaultChapelSemester(await chapel.getSelectedSemester());
    const courseSchedule = await new CourseScheduleApplicationBuilder().build(session);
    const grades = await new CourseGradesApplicationBuilder().build(session);
    setDefaultGradesSemester(await grades.getSelectedSemester());
    const graduationRequirements = await new GraduationRequirementsApplicationBuilder().build(
      session,
    );
    const scholarships = await new ScholarshipsApplicationBuilder().build(session);
    const studentInformation = await new StudentInformationApplicationBuilder().build(session);
    setChapelClient(chapel);
    setCourseScheduleClient(courseSchedule);
    setGradesClient(grades);
    setGraduationRequirementsClient(graduationRequirements);
    setScholarshipsClient(scholarships);
    setStudentInformationClient(studentInformation);
  }, [session]);

  return (
    <RusaintApplicationContext.Provider
      value={{
        chapelClient,
        courseScheduleClient,
        defaultChapelSemester,
        defaultGradesSemester,
        gradesClient,
        graduationRequirementsClient,
        scholarshipsClient,
        studentInformationClient,
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
