import { CourseType } from '@rusaint/react-native';
import { useState } from 'react';
import { useAsyncEffect } from 'react-simplikit';

import { db } from '@/db';
import { useSyncGradeSummary } from '@/entities/grades/lib/sync/useSyncGradeSummary';
import { GradeSummaryModel } from '@/entities/grades/model/grades';

/**
 * 성적 요약 정보를 조회하는 훅
 * @param type 'certificated' (증명) 또는 'recorded' (학적부)
 */
export const useGradeSummary = (
  type: 'certificated' | 'recorded',
): { data: GradeSummaryModel | null; isSyncing: boolean } => {
  const [data, setData] = useState<GradeSummaryModel | null>(null);
  const { isSyncing, sync } = useSyncGradeSummary();

  useAsyncEffect(async () => {
    await sync([CourseType.Bachelor], { force: false });
    const result = await db.query.gradeSummary.findFirst({
      where: (gradeSummary, { eq }) => eq(gradeSummary.type, type),
    });
    setData(result || null);
  }, [type, isSyncing]);

  return { data, isSyncing };
};
