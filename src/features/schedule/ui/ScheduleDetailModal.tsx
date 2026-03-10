import { Modal, Pressable, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { CourseScheduleEntity } from '@/entities/courseSchedule/model';
import { formatTimeRange, WEEKDAY_LABELS } from '@/features/schedule/lib/utils';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

const styles = StyleSheet.create((theme) => ({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  content: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.cornerRadius.md,
    padding: theme.gap(3),
    width: '80%',
    maxWidth: 320,
    gap: theme.gap(1.5),
  },
  row: {
    gap: theme.gap(0.5),
  },
  closeButton: {
    alignSelf: 'flex-end',
    paddingVertical: theme.gap(0.5),
    paddingHorizontal: theme.gap(1),
  },
}));

interface ScheduleDetailModalProps {
  item: CourseScheduleEntity | null;
  onClose: () => void;
  visible: boolean;
}

export const ScheduleDetailModal = ({ visible, item, onClose }: ScheduleDetailModalProps) => {
  if (!item) {
    return null;
  }

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <Pressable onPress={onClose} style={styles.overlay}>
        <Pressable onPress={(e) => e.stopPropagation()} style={styles.content}>
          <ThemedText typography="headingLg">{item.name}</ThemedText>
          <View style={styles.row}>
            <ThemedText color="fgSurfaceDim" typography="labelMd">
              교수
            </ThemedText>
            <ThemedText typography="bodyLg">{item.professor}</ThemedText>
          </View>
          <View style={styles.row}>
            <ThemedText color="fgSurfaceDim" typography="labelMd">
              시간
            </ThemedText>
            <ThemedText typography="bodyLg">
              {WEEKDAY_LABELS[item.weekday]} {formatTimeRange(item.startTime, item.endTime)}
            </ThemedText>
          </View>
          <View style={styles.row}>
            <ThemedText color="fgSurfaceDim" typography="labelMd">
              강의실
            </ThemedText>
            <ThemedText typography="bodyLg">{item.classroom}</ThemedText>
          </View>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <ThemedText color="primary" typography="headingMd">
              닫기
            </ThemedText>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
