import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { GraduationRequirementEntity } from '@/entities/graduationRequirements/model';
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
  const isFulfilled = result === 1;
  const lectureList = JSON.parse(lectures) as string[];
  const hasLectures = lectureList.length > 0;

  // requirement와 calculation이 모두 있는 경우에만 표시
  const showProgress = requirement !== null && calculation !== null;

  return (
    <View style={styles.root}>
      <View style={styles.container}>
        <View style={styles.contentView}>
          <View style={styles.nameView}>
            <ThemedText typography="headingMd">{name}</ThemedText>
            {category && showCategory && (
              <ThemedText color="fgSurfaceMuted" typography="labelMd">
                / {category}
              </ThemedText>
            )}
          </View>
          {hasLectures && (
            <View style={styles.nameView}>
              <ThemedText color="fgSurfaceMuted" typography="bodySm">
                {lectureList.length}개 과목
              </ThemedText>
            </View>
          )}
        </View>
        <View style={styles.asideView}>
          {showProgress && (
            <ThemedText style={styles.requirementText(isFulfilled)} typography="headingLg">
              {calculation?.toFixed(1)}
              <ThemedText color="fgSurfaceMuted" typography="labelLg">
                {' '}
                / {requirement.toFixed(1)}
              </ThemedText>
            </ThemedText>
          )}
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
}
