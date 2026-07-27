import { CourseType } from '@rusaint/react-native';
import { useMemo, useState } from 'react';

import {
  useCheckRecentAttendedSemesters,
  useGradeSummary,
  useSemesterGrades,
} from '@/entities/grades/lib/queries';
import { classGradesSync, gradeSummarySync, semesterGradesSync } from '@/entities/grades/lib/sync';
import { GradeOverviewTabView, GradeTabView, SemesterGradeTabView } from '@/features/grades/model';
import { refresh as refreshSync } from '@/shared/lib/syncEngine';
import { useRusaintApplication } from '@/shared/providers/RusaintApplicationProvider';

interface UseGradeTabViewResult {
  data: GradeTabView[] | null;
  error: Error | null;
  isLoading: boolean;
  refresh: (selectedTab?: null | { semester: number; year: number }) => Promise<void>;
}

export function useGradeTabView(): UseGradeTabViewResult {
  const { studentId } = useRusaintApplication();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const {
    data: certiSummary,
    error: summaryError,
    isSyncing: isSummarySyncing,
  } = useGradeSummary('certificated');
  const { data: recordedSummary, error: recordedSummaryError } = useGradeSummary('recorded');
  const {
    data: semesters,
    error: semesterError,
    isSyncing: isSemesterSyncing,
  } = useSemesterGrades();
  const {
    checkedSemesters: checkedRecentSemesters,
    error: recentSemesterError,
    isChecking,
  } = useCheckRecentAttendedSemesters();

  const isLoading = isSummarySyncing || isSemesterSyncing || isChecking || isRefreshing;
  const error =
    summaryError ?? recordedSummaryError ?? semesterError ?? recentSemesterError ?? null;

  const data = useMemo<GradeTabView[] | null>(() => {
    if (!certiSummary || !recordedSummary || !semesters) {
      return null;
    }

    const summary: GradeTabView[] = [
      {
        certificated: certiSummary,
        recorded: recordedSummary,
        type: 'overview',
      } satisfies GradeOverviewTabView,
    ];

    return summary.concat(
      checkedRecentSemesters
        .filter(
          (recent) =>
            recent.attended &&
            !semesters.some(
              (semester) => semester.year === recent.year && semester.semester === recent.semester,
            ),
        )
        .map(
          (attended) =>
            ({
              semester: attended.semester,
              type: 'semester',
              year: attended.year,
            }) satisfies SemesterGradeTabView,
        )
        .sort((a, b) => (a.year !== b.year ? b.year - a.year : b.semester - a.semester)),
      semesters
        .map(
          (semester) =>
            ({
              data: semester,
              semester: semester.semester,
              type: 'semester',
              year: semester.year,
            }) satisfies SemesterGradeTabView,
        )
        .sort((a, b) => (a.year !== b.year ? b.year - a.year : b.semester - a.semester)),
    );
  }, [certiSummary, recordedSummary, semesters, checkedRecentSemesters]);

  const refresh = async (selectedTab?: null | { semester: number; year: number }) => {
    if (!studentId) {
      return;
    }

    setIsRefreshing(true);
    try {
      await refreshSync(gradeSummarySync(studentId, CourseType.Bachelor, true));
      await refreshSync(semesterGradesSync(studentId, CourseType.Bachelor));
      if (selectedTab) {
        await refreshSync(
          classGradesSync(studentId, CourseType.Bachelor, selectedTab.year, selectedTab.semester),
        );
        return;
      }

      for (const recentSemester of checkedRecentSemesters) {
        if (!recentSemester.attended) {
          await refreshSync(
            classGradesSync(
              studentId,
              CourseType.Bachelor,
              recentSemester.year,
              recentSemester.semester,
            ),
          );
        }
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  return { data, error, isLoading, refresh };
}
