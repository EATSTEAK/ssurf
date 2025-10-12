import {
  ChapelApplicationBuilder,
  ChapelApplicationInterface,
  CourseScheduleApplicationBuilder,
  CourseScheduleApplicationInterface,
} from '@rusaint/react-native';
import { createContext, useContext, useState } from 'react';
import { useAsyncEffect } from 'react-simplikit';

import { useRusaintSession } from '@/components/providers/RusaintSessionProvider';
export interface RusaintApplicationContext {
  chapelClient: ChapelApplicationInterface | null;
  courseScheduleClient: CourseScheduleApplicationInterface | null;
}

const RusaintApplicationContext = createContext<RusaintApplicationContext>({
  chapelClient: null,
  courseScheduleClient: null,
});

export const RusaintApplicationProvider = ({ children }: React.PropsWithChildren<unknown>) => {
  const { session } = useRusaintSession();

  const [chapelClient, setChapelClient] = useState<ChapelApplicationInterface | null>(null);
  const [courseScheduleClient, setCourseScheduleClient] =
    useState<CourseScheduleApplicationInterface | null>(null);

  useAsyncEffect(async () => {
    if (!session) {
      return;
    }
    // NOTE: 각 애플리케이션을 생성하는 것은 서버(u-saint) 입장에서 탭을 하나 띄우는 것과 동일하므로, 동시에 요청하지 않고 순차적으로 요청해요
    const chapel = await new ChapelApplicationBuilder().build(session);
    const courseSchedule = await new CourseScheduleApplicationBuilder().build(session);
    setChapelClient(chapel);
    setCourseScheduleClient(courseSchedule);
  }, [session]);

  return (
    <RusaintApplicationContext.Provider
      value={{
        chapelClient,
        courseScheduleClient,
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
