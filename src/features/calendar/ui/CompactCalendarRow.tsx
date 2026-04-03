import { Pressable } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { CalendarEntity } from '@/entities/calendar/model';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

const styles = StyleSheet.create((theme) => ({
  container: ({ pressed }) => ({
    paddingHorizontal: theme.gap(3),
    paddingVertical: theme.gap(1),
    backgroundColor: pressed ? theme.colors.primaryPressed : theme.colors.primaryContainer,
  }),
  pressed: {
    backgroundColor: theme.colors.primaryContainer,
  },
  border: {
    borderBottomWidth: 1,
  },
}));

type CompactCalendarRowProps = {
  isLast: boolean;
  item: CalendarEntity;
  onPress: (item: CalendarEntity) => void;
};

export function CompactCalendarRow({ item, onPress }: CompactCalendarRowProps) {
  return (
    <Pressable onPress={() => onPress(item)} style={(state) => styles.container(state)}>
      <ThemedText numberOfLines={1} typography="bodyMd">
        {item.title}
      </ThemedText>
    </Pressable>
  );
}
