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
import { GradeTabView } from '@/features/grades/model';

interface UseGradeTabViewResult {
  data: GradeTabView[];
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
  const { attendedSemesters, isChecking } = useCheckRecentAttendedSemesters();

  const isLoading =
    isSyncing ||
    isSemesterSyncing ||
    isClassSyncing ||
    isChecking ||
    !certiSummary ||
    !recordedSummary ||
    !semesters;

  const error = summaryError || semesterError || null;

  const data = useMemo<GradeTabView[]>(() => {
    if (!certiSummary || !recordedSummary || !semesters) {
      return [];
    }

    const semesterItems: GradeTabView[] = [];

    // 과목이 있는 최근 학기를 먼저 추가 (데이터가 있으면 포함)
    attendedSemesters.forEach((attended) => {
      const semesterData = semesters.find(
        (s) => s.year === attended.year && s.semester === attended.semester,
      );
      semesterItems.push({
        data: semesterData,
        semester: attended.semester,
        type: 'semester',
        year: attended.year,
      });
    });

    // 기존 학기들 중 과목이 있는 최근 학기에 포함되지 않은 것만 추가
    semesters.forEach((s) => {
      const isAttended = attendedSemesters.some(
        (attended) => attended.year === s.year && attended.semester === s.semester,
      );
      if (!isAttended) {
        semesterItems.push({
          data: s,
          semester: s.semester,
          type: 'semester',
          year: s.year,
        });
      }
    });

    return [
      {
        certificated: certiSummary,
        recorded: recordedSummary,
        type: 'overview',
      },
      ...semesterItems,
    ];
  }, [certiSummary, recordedSummary, semesters, attendedSemesters]);

  const refresh = async (selectedTab?: null | { semester: number; year: number }) => {
    await syncGradeSummary([CourseType.Bachelor], { force: true });
    await syncSemesterGrades([CourseType.Bachelor], { force: true });
    if (selectedTab) {
      await syncClassGrades([CourseType.Bachelor, selectedTab.year, selectedTab.semester], {
        force: true,
      });
    }
  };

  return {
    data,
    error,
    isLoading,
    refresh,
  };
}
