import { Lecture, LectureCategory, SemesterType } from '@rusaint/react-native';
import { useEffect, useState } from 'react';

import { useRusaint } from '@/components/providers/RusaintProvider';

export const useFindLectures = (
  year: number,
  semester: SemesterType,
  category: LectureCategory,
) => {
  const { courseScheduleClient: client } = useRusaint();
  const [lectures, setLectures] = useState<Lecture[]>([]);

  useEffect(() => {
    (async () => {
      const result = await client?.findLectures(year, semester, category);
      setLectures(result || []);
    })();
  }, [year, semester, category, client]);
  return lectures;
};
