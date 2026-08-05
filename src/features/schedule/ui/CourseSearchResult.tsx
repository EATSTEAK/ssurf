import type { Lecture } from '@rusaint/react-native';

import { Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { ChevronRightIcon } from '@/shared/ui/icons';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

const styles = StyleSheet.create((theme) => ({
  border: {
    borderBottomColor: theme.colors.surfaceDimmer,
    borderBottomWidth: 1,
  },
  content: {
    flex: 1,
    gap: theme.gap(0.5),
  },
  metadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.gap(1),
  },
  pressed: {
    backgroundColor: theme.colors.surfaceDimmer,
  },
  root: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.gap(2),
    paddingHorizontal: theme.gap(3),
    paddingVertical: theme.gap(2),
  },
}));

type CourseSearchResultProps = {
  isLast: boolean;
  item: Lecture;
  onPress: (item: Lecture) => void;
};

export const CourseSearchResult = ({ isLast, item, onPress }: CourseSearchResultProps) => {
  const { theme } = useUnistyles();

  return (
    <Pressable
      accessibilityLabel={`${item.name}, ${item.professor || '담당교수 미정'}, ${item.code}`}
      accessibilityRole="button"
      onPress={() => onPress(item)}
      style={({ pressed }) => [styles.root, !isLast && styles.border, pressed && styles.pressed]}
    >
      <View style={styles.content}>
        <ThemedText selectable typography="headingMd">
          {item.name}
        </ThemedText>
        <View style={styles.metadata}>
          <ThemedText color="fgSecondary" selectable typography="bodySm">
            {item.code}
          </ThemedText>
          <ThemedText color="fgSecondary" selectable typography="bodySm">
            {item.professor || '담당교수 미정'}
          </ThemedText>
          {item.department ? (
            <ThemedText color="fgSecondary" selectable typography="bodySm">
              {item.department}
            </ThemedText>
          ) : null}
        </View>
        {item.scheduleRoom ? (
          <ThemedText color="fgSecondary" selectable typography="bodyMd">
            {item.scheduleRoom}
          </ThemedText>
        ) : null}
      </View>
      <ChevronRightIcon color={theme.colorsHex.fgSurfaceMuted} size={20} />
    </Pressable>
  );
};
