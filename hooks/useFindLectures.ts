import {
  CourseScheduleApplicationBuilder,
  type CourseScheduleApplicationInterface,
  Lecture,
  LectureCategory,
  SemesterType,
  USaintSessionBuilder,
} from '@rusaint/react-native';
import { useEffect, useState } from 'react';

const session = new USaintSessionBuilder().anonymous();

export const useFindLectures = (
  year: number,
  semester: SemesterType,
  category: LectureCategory,
) => {
  const [client, setClient] = useState<CourseScheduleApplicationInterface | null>(null);
  const [result, setResult] = useState<Lecture[]>([]);
  useEffect(() => {
    (async () => {
      const client = await new CourseScheduleApplicationBuilder().build(session);
      setClient(client);
      console.log('Client initialized:', client);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const result = await client?.findLectures(year, semester, category);
      setResult(result || []);
      console.log('Lectures fetched:', result);
    })();
  }, [year, semester, category, client]);
  return result;
};
