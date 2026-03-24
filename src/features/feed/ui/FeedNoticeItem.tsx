import { Pressable, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { FeedNoticeEntity } from '@/entities/feed/model';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

import { formatFeedDate } from './formatFeedDate';

const styles = StyleSheet.create((theme) => ({
  container: {
    paddingVertical: theme.gap(2),
    gap: theme.gap(1.5),
  },
  pressed: {
    backgroundColor: theme.colors.primaryContainer,
    borderRadius: theme.cornerRadius.sm,
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

type FeedNoticeItemProps = {
  isLast: boolean;
  item: FeedNoticeEntity;
  onPress: (item: FeedNoticeEntity) => void;
};

export function FeedNoticeItem({ item, isLast, onPress }: FeedNoticeItemProps) {
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
        {item.author ? (
          <ThemedText color="fgSecondary" typography="labelSm">
            {item.author}
          </ThemedText>
        ) : null}
        <ThemedText color="fgSecondary" typography="labelSm">
          {formatFeedDate(item.updatedAt ?? item.createdAt)}
        </ThemedText>
      </View>
    </Pressable>
  );
}
