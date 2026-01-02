import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

import { useRef, useState } from 'react';
import { FlatList, useWindowDimensions, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { GradeSummary } from '@/features/grades/ui/GradeSummary';
import { GraduationSummary } from '@/features/grades/ui/GraduationSummary';

interface GradeSummary {
  attemptedCredits: number;
  earnedCredits: number;
  gradePointsAverage: number;
}

interface GradeSummarySectionProps {
  isSemesterSummary: boolean;
  summary: GradeSummary;
}

type PageItem = {
  component: React.ReactNode;
  id: string;
};

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.gap(2),
  },
  flatList: {
    overflow: 'visible',
  },
  innerContainer: (width: number) => ({
    width,
    paddingHorizontal: theme.gap(3),
  }),
  indicatorContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.gap(1),
    justifyContent: 'center',
  },
  dot: {
    backgroundColor: theme.colors.fgSurfaceMuted,
    borderRadius: 4,
    height: 4,
    opacity: 0.3,
    width: 4,
  },
  dotActive: {
    opacity: 1,
  },
}));

export function GradeSummarySection({
  summary,
  isSemesterSummary = false,
}: GradeSummarySectionProps) {
  const { width } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const pages: PageItem[] = [
    {
      component: <GradeSummary isSemesterSummary={isSemesterSummary} summary={summary} />,
      id: 'grade-summary',
    },
    {
      component: <GraduationSummary />,
      id: 'graduation-summary',
    },
  ];

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    setCurrentIndex(index);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={pages}
        horizontal
        keyExtractor={(item) => item.id}
        onScroll={handleScroll}
        pagingEnabled
        ref={flatListRef}
        renderItem={({ item }) => (
          <View style={styles.innerContainer(width)}>{item.component}</View>
        )}
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        style={styles.flatList}
      />
      <View style={styles.indicatorContainer}>
        {pages.map((_, index) => (
          <View key={index} style={[styles.dot, index === currentIndex && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}
