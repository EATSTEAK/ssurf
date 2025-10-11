import {
  ChapelApplicationBuilder,
  ChapelApplicationInterface,
  CourseScheduleApplicationBuilder,
  CourseScheduleApplicationInterface,
  USaintSessionBuilder,
  USaintSessionInterface,
} from '@rusaint/react-native';
import { createContext, useContext, useEffect, useState } from 'react';

export interface RusaintContext {
  chapelClient: ChapelApplicationInterface | null;
  courseScheduleClient: CourseScheduleApplicationInterface | null;
  session: null | USaintSessionInterface;
}

const RusaintContext = createContext<RusaintContext>({
  chapelClient: null,
  courseScheduleClient: null,
  session: null,
});

export const RusaintProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<null | USaintSessionInterface>(null);
  const [chapelClient, setChapelClient] = useState<ChapelApplicationInterface | null>(null);
  const [courseScheduleClient, setCourseScheduleClient] =
    useState<CourseScheduleApplicationInterface | null>(null);

  useEffect(() => {
    (async () => {
      const ses = await new USaintSessionBuilder().withPassword('20211561', '<redacted>');
      setSession(ses);
      const chapel = await new ChapelApplicationBuilder().build(ses);
      setChapelClient(chapel);
      const courseSchedule = await new CourseScheduleApplicationBuilder().build(ses);
      setCourseScheduleClient(courseSchedule);
    })();
  }, []);
  return (
    <RusaintContext.Provider
      value={{
        session,
        chapelClient,
        courseScheduleClient,
      }}
    >
      {children}
    </RusaintContext.Provider>
  );
};

export const useRusaint = () => {
  return useContext(RusaintContext);
};
