import { Lecture, LectureCategory, SemesterType } from '@rusaint/react-native';
import { useState } from 'react';
import { useAsyncEffect } from 'react-simplikit';

import { useRusaintApplication } from '@/components/providers/RusaintApplicationProvider';

export const useFindLectures = (
  year: number,
  semester: SemesterType,
  category: LectureCategory,
) => {
  const { courseScheduleClient: client } = useRusaintApplication();
  const [lectures, setLectures] = useState<Lecture[]>([]);

  useAsyncEffect(async () => {
    const result = await client?.findLectures(year, semester, category);
    setLectures(result || []);
  }, [year, semester, category, client]);

  return lectures;
};
