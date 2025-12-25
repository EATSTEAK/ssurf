import { useState } from 'react';
import { GestureResponderEvent, Pressable, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { ClassGradeEntity } from '@/entities/grades/model';
import { useBlurGrade } from '@/features/grades/providers/BlurGradeProvider';
import { ChevronRightIcon } from '@/shared/ui/icons';
import { Chip } from '@/shared/ui/primitives/Chip';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

import { ClassGradeDetailModal } from './ClassGradeDetailModal';

const styles = StyleSheet.create((theme) => ({
  container: (pressable: boolean, pressed: boolean) => ({
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    gap: theme.gap(0.5),
    justifyContent: 'space-between',
    backgroundColor: pressable && pressed ? theme.colors.surfaceDimmer : theme.colors.surfaceDim,
    transitionProperty: 'background-color',
    paddingHorizontal: theme.gap(2),
    paddingVertical: theme.gap(1),
  }),
  contentView: {
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 1,
    gap: theme.gap(0.5),
  },
  nameView: {
    alignItems: 'center',
    columnGap: theme.gap(0.25),
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  asideView: {
    width: 64,
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    flexShrink: 0,
    gap: 4,
  },
  gradeView: {
    flexGrow: 1,
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
  },
  detailsView: (hasDetails: boolean) => ({
    alignItems: 'flex-end',
    flexShrink: 0,
    opacity: hasDetails ? 1 : 0,
  }),
  detailsIcon: {
    size: 12,
    color: theme.colorsHex.fgSurfaceMuted,
  },
  rank: (rank: string, isBlurred: boolean) => ({
    color:
      rank === NOT_AVAILABLE
        ? theme.colors.fgSurfaceMuted
        : rank[0] === 'P' || rank[0] === 'A'
          ? theme.colors.primaryInverted
          : rank[0] === 'B'
            ? theme.colors.secondaryInverted
            : theme.colors.errorInverted,
    fontWeight: '600',
    opacity: isBlurred ? 0.1 : 1,
  }),
  score: (isBlurred: boolean) => ({
    opacity: isBlurred ? 0.1 : 1,
  }),
}));

const rankToRating = (rank: string) => {
  switch (rank) {
    case 'A0':
      return '4.3';
    case 'A+':
      return '4.5';
    case 'A-':
      return '4.0';
    case 'B0':
      return '3.3';
    case 'B+':
      return '3.5';
    case 'B-':
      return '3.0';
    case 'C0':
      return '2.3';
    case 'C+':
      return '2.5';
    case 'C-':
      return '2.0';
    case 'D0':
      return '1.3';
    case 'D+':
      return '1.5';
    case 'D-':
      return '1.0';
    case 'F':
      return '0.0';
    default:
      return '-';
  }
};

const NOT_AVAILABLE = '성적 미입력';

export function ClassGradeItem({
  className,
  detailJson,
  gradePoints,
  professor,
  rank,
  scoreValue,
}: ClassGradeEntity) {
  const { isBlurred } = useBlurGrade();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const hasDetails = detailJson !== null && detailJson !== undefined;

  const handlePress = (event: GestureResponderEvent) => {
    if (hasDetails) {
      setIsModalVisible(true);
    } else {
      event.preventDefault();
    }
  };

  return (
    <>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => styles.container(hasDetails, pressed)}
      >
        <View style={styles.contentView}>
          <View style={styles.nameView}>
            <ThemedText typography="headingMd">{className}</ThemedText>
            {professor ? <ThemedText typography="labelMd">/ {professor}</ThemedText> : null}
          </View>
          <View style={styles.nameView}>
            <ThemedText color="fgSurfaceMuted" typography="bodySm">
              {gradePoints.toFixed(1)}학점
            </ThemedText>
            {rank === '' && (
              <Chip backgroundColor="errorContainer" color="fgErrorContainer">
                강의평가 미수행
              </Chip>
            )}
          </View>
        </View>
        <View style={styles.asideView}>
          <View style={styles.gradeView}>
            <ThemedText style={styles.rank(rank, isBlurred)} typography="headingLg">
              {rank === NOT_AVAILABLE ? '-' : rank === '' ? '*' : rank}
            </ThemedText>
            <ThemedText style={styles.score(isBlurred)}>
              {rankToRating(rank)}
              {scoreValue !== null && ` / ${scoreValue}`}
            </ThemedText>
          </View>
          {/* consistent spacing for chevron */}
          <View style={styles.detailsView(hasDetails)}>
            <ChevronRightIcon color={styles.detailsIcon.color} size={styles.detailsIcon.size} />
          </View>
        </View>
      </Pressable>
      {hasDetails && (
        <ClassGradeDetailModal
          className={className}
          detailJson={detailJson}
          onClose={() => setIsModalVisible(false)}
          visible={isModalVisible}
        />
      )}
    </>
  );
}
