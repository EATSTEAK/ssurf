import { Pressable, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { FeedCalendarEntity } from '@/entities/feed/model';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

import { formatFeedDate } from './formatFeedDate';

const styles = StyleSheet.create((theme) => ({
  container: {
    paddingHorizontal: theme.gap(3),
    paddingVertical: theme.gap(2),
    gap: theme.gap(1.5),
  },
  pressed: {
    backgroundColor: theme.colors.surfaceDimmer,
  },
  border: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
  },
  metaText: {
    flexDirection: 'row',
    gap: theme.gap(2),
  },
}));

type FeedCalendarItemProps = {
  isLast: boolean;
  item: FeedCalendarEntity;
  onPress: (item: FeedCalendarEntity) => void;
};

export function FeedCalendarItem({ item, isLast, onPress }: FeedCalendarItemProps) {
  return (
    <Pressable
      onPress={() => onPress(item)}
      style={({ pressed }) => [styles.container, pressed && styles.pressed, !isLast && styles.border]}
    >
      <ThemedText typography="headingMd">{item.title}</ThemedText>
      {item.description ? (
        <ThemedText color="fgSecondary" numberOfLines={2} typography="bodyMd">
          {item.description}
        </ThemedText>
      ) : null}
      <View style={styles.metaText}>
        <ThemedText color="fgSecondary" typography="labelSm">
          {formatFeedDate(item.startsAt)}
        </ThemedText>
        {item.location ? (
          <ThemedText color="fgSecondary" typography="labelSm">
            {item.location}
          </ThemedText>
        ) : null}
      </View>
    </Pressable>
  );
}
