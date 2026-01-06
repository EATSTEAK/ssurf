import { CourseType } from '@rusaint/react-native';
import { useMemo } from 'react';

import {
  useCheckRecentAttendedSemesters,
  useGradeSummary,
  useSemesterGrades,
} from '@/entities/grades/lib/queries';
import {
  useSyncClassGrades,
  useSyncGradeSummary,
  useSyncSemesterGrades,
} from '@/entities/grades/lib/sync';
import { GradeOverviewTabView, GradeTabView, SemesterGradeTabView } from '@/features/grades/model';

interface UseGradeTabViewResult {
  data: GradeTabView[] | null;
  error: Error | null;
  isLoading: boolean;
  refresh: (selectedTab?: null | { semester: number; year: number }) => Promise<void>;
}

/**
 * 성적 탭 뷰 데이터를 관리하는 훅
 * @returns data - GradeTabView[] 형태의 탭 데이터
 * @returns refresh - 데이터 새로고침 함수
 * @returns isLoading - 로딩 상태
 * @returns error - 에러 상태
 */
export function useGradeTabView(): UseGradeTabViewResult {
  const { sync: syncGradeSummary, isSyncing, error: summaryError } = useSyncGradeSummary();
  const {
    sync: syncSemesterGrades,
    isSyncing: isSemesterSyncing,
    error: semesterError,
  } = useSyncSemesterGrades();
  const { sync: syncClassGrades, isSyncing: isClassSyncing } = useSyncClassGrades();

  const { data: certiSummary } = useGradeSummary('certificated');
  const { data: recordedSummary } = useGradeSummary('recorded');
  const { data: semesters } = useSemesterGrades();
  const { checkedSemesters: checkedRecentSemesters, isChecking } =
    useCheckRecentAttendedSemesters();

  const isLoading = isSyncing || isSemesterSyncing || isClassSyncing || isChecking;

  const error = summaryError || semesterError || null;

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
      // 수강중이거나 성적 처리가 되지 않은 학기 추가
      checkedRecentSemesters
        .filter(
          (recent) =>
            recent.attended &&
            !semesters.some((s) => s.year === recent.year && s.semester === recent.semester),
        )
        .map(
          (attended) =>
            ({
              semester: attended.semester,
              type: 'semester',
              year: attended.year,
            }) satisfies SemesterGradeTabView,
        ),
      semesters.map(
        (s) =>
          ({
            data: s,
            semester: s.semester,
            type: 'semester',
            year: s.year,
          }) satisfies SemesterGradeTabView,
      ),
    );
  }, [certiSummary, recordedSummary, semesters, checkedRecentSemesters]);

  const refresh = async (selectedTab?: null | { semester: number; year: number }) => {
    // Reload once
    await syncGradeSummary([CourseType.Bachelor, true], { force: true });
    await syncSemesterGrades([CourseType.Bachelor], { force: true });
    if (selectedTab) {
      await syncClassGrades([CourseType.Bachelor, selectedTab.year, selectedTab.semester], {
        force: true,
      });
    } else {
      for (const recentSemester of checkedRecentSemesters) {
        // Check recently updated semesters that isn't in the list.
        if (!recentSemester.attended) {
          await syncClassGrades(
            [CourseType.Bachelor, recentSemester.year, recentSemester.semester],
            { force: true },
          );
        }
      }
    }
  };

  return {
    data,
    error,
    isLoading,
    refresh,
  };
}
