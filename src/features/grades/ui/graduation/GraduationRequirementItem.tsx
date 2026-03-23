import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { GraduationRequirementEntity } from '@/entities/graduationRequirements/model';
import { ChevronRightIcon } from '@/shared/ui/icons';
import { Chip } from '@/shared/ui/primitives/Chip';
import { Progress } from '@/shared/ui/primitives/Progress';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

const styles = StyleSheet.create((theme) => ({
  root: {
    gap: theme.gap(0.5),
  },
  container: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    gap: theme.gap(0.5),
    justifyContent: 'space-between',
  },
  contentView: {
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 1,
    gap: theme.gap(0.5),
  },
  nameView: {
    alignItems: 'center',
    columnGap: theme.gap(0.5),
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  itemContainer: {
    alignSelf: 'stretch',
    marginHorizontal: -theme.gap(3),
  },
  itemPressable: (pressed: boolean) => ({
    backgroundColor: pressed ? theme.colors.surfaceDimmer : 'transparent',
  }),
  itemSummary: {
    gap: theme.gap(0.5),
    paddingHorizontal: theme.gap(3),
    paddingVertical: theme.gap(1),
  },
  lectureSummary: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    display: 'flex',
    flexDirection: 'row',
    gap: theme.gap(0.25),
  },
  toggleIconContainer: (expanded: boolean) => ({
    transform: [{ rotate: expanded ? '90deg' : '0deg' }],
  }),
  toggleIcon: {
    color: theme.colorsHex.fgSurfaceMuted,
    size: 12,
  },
  lectureList: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.gap(0.5),
    paddingHorizontal: theme.gap(3),
  },
  lectureChip: {
    maxWidth: '100%',
  },
  asideView: {
    alignItems: 'flex-end',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    gap: theme.gap(0.25),
  },
  requirementText: (isFulfilled: boolean) => ({
    color: isFulfilled ? theme.colors.successInverted : theme.colors.errorInverted,
    fontWeight: '600',
  }),
  progress: (isFulfilled: boolean) => ({
    backgroundColor: isFulfilled ? theme.colors.successContainer : theme.colors.errorContainer,
  }),
  progressIndicator: (isFulfilled: boolean) => ({
    backgroundColor: isFulfilled ? theme.colors.success : theme.colors.error,
  }),
}));

export interface GraduationRequirementItemProps {
  item: GraduationRequirementEntity;
  showCategory?: boolean;
}

export function GraduationRequirementItem({
  item: { calculation, category, difference, lectures, name, requirement, result },
  showCategory = true,
}: GraduationRequirementItemProps) {
  const [isLecturesExpanded, setIsLecturesExpanded] = useState(false);
  const isFulfilled = result === 1;
  const lectureList = useMemo(() => {
    try {
      const parsed = JSON.parse(lectures);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed
        .filter((lecture): lecture is string => typeof lecture === 'string')
        .map((lecture) => lecture.trim())
        .filter(Boolean);
    } catch {
      return [];
    }
  }, [lectures]);
  const hasLectures = lectureList.length > 0;

  // requirement와 calculation이 모두 있는 경우에만 표시
  const showProgress = requirement !== null && calculation !== null;

  const summaryContent = (
    <View style={styles.itemSummary}>
      <View style={styles.container}>
        <View style={styles.contentView}>
          <View style={styles.nameView}>
            <ThemedText typography="headingMd">{name}</ThemedText>
            {category && showCategory ? (
              <ThemedText color="fgSurfaceMuted" typography="labelMd">
                / {category}
              </ThemedText>
            ) : null}
          </View>
          {hasLectures ? (
            <View style={styles.lectureSummary}>
              <View style={styles.toggleIconContainer(isLecturesExpanded)}>
                <ChevronRightIcon color={styles.toggleIcon.color} size={styles.toggleIcon.size} />
              </View>
              <ThemedText color="fgSurfaceMuted" typography="bodySm">
                {lectureList.length}개 과목 {isLecturesExpanded ? '숨기기' : '보기'}
              </ThemedText>
            </View>
          ) : null}
        </View>
        <View style={styles.asideView}>
          {showProgress ? (
            <ThemedText style={styles.requirementText(isFulfilled)} typography="headingLg">
              {calculation?.toFixed(1)}
              <ThemedText color="fgSurfaceMuted" typography="labelLg">
                {' '}
                / {requirement.toFixed(1)}
              </ThemedText>
            </ThemedText>
          ) : null}
          {isFulfilled ? (
            <ThemedText color="successInverted" typography="bodySm">
              충족 {difference ? `(+${difference.toFixed(1)})` : ''}
            </ThemedText>
          ) : (
            <ThemedText color="errorInverted" typography="bodySm">
              부족 {difference ? `(${difference.toFixed(1)})` : ''}
            </ThemedText>
          )}
        </View>
      </View>
      <View>
        <Progress
          indicatorStyle={styles.progressIndicator(isFulfilled)}
          max={requirement ?? 1}
          style={styles.progress(isFulfilled)}
          value={calculation ?? (isFulfilled ? (requirement ?? 1) : 0)}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      <View style={styles.itemContainer}>
        {hasLectures ? (
          <Pressable
            accessibilityLabel={`${name} 세부 과목 ${lectureList.length}개 ${isLecturesExpanded ? '숨기기' : '보기'}`}
            accessibilityRole="button"
            accessibilityState={{ expanded: isLecturesExpanded }}
            onPress={() => setIsLecturesExpanded((prev) => !prev)}
            style={({ pressed }) => styles.itemPressable(pressed)}
          >
            {summaryContent}
          </Pressable>
        ) : (
          summaryContent
        )}
      </View>
      {isLecturesExpanded ? (
        <View style={styles.lectureList}>
          {lectureList.map((lecture, index) => (
            <Chip
              backgroundColor="surfaceDimmer"
              color="fgSurfaceMuted"
              key={`${lecture}-${index}`}
              style={styles.lectureChip}
            >
              {lecture}
            </Chip>
          ))}
        </View>
      ) : null}
    </View>
  );
}
