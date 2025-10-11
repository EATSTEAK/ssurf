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
      // TODO: retrieve ID/PW from secure storage
      // TODO: handle session refresh
      const ses = await new USaintSessionBuilder().withPassword('20211561', '<redacted>');
      // NOTE: 각 애플리케이션을 생성하는 것은 서버(u-saint) 입장에서 탭을 하나 띄우는 것과 동일하므로, 동시에 요청하지 않고 순차적으로 요청해요
      const chapel = await new ChapelApplicationBuilder().build(ses);
      const courseSchedule = await new CourseScheduleApplicationBuilder().build(ses);
      setSession(ses);
      setChapelClient(chapel);
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
