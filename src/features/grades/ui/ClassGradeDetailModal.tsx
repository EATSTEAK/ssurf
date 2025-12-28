import { Modal, Pressable } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Button } from '@/shared/ui/primitives/Button';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

import { AttributeItem, AttributesView } from './AttributesView';

const styles = StyleSheet.create((theme) => ({
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    gap: theme.gap(3),
    maxWidth: 400,
    padding: theme.gap(3),
    width: '80%',
  },
  title: {
    textAlign: 'center',
  },
}));

export type ClassGradeDetailModalProps = {
  className: string;
  detailJson: null | string;
  onClose: () => void;
  visible: boolean;
};

export function ClassGradeDetailModal({
  className,
  detailJson,
  onClose,
  visible,
}: ClassGradeDetailModalProps) {
  // detailJson을 파싱하여 AttributeItem 배열로 변환
  const items: AttributeItem[] = (() => {
    if (!detailJson) {
      return [];
    }

    try {
      const parsed = JSON.parse(detailJson) as Record<string, number | string>;
      return Object.entries(parsed).map(([label, value]) => ({
        label,
        value: typeof value === 'number' ? value.toFixed(2) : value.toString(),
      }));
    } catch {
      return [];
    }
  })();

  if (!detailJson || items.length === 0) {
    return null;
  }

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <Pressable onPress={onClose} style={styles.overlay}>
        <Pressable onPress={(e) => e.stopPropagation()} style={styles.modalContent}>
          <ThemedText style={styles.title} typography="headingLg">
            {className}
          </ThemedText>
          <AttributesView items={items} />
          <Button onPress={onClose}>닫기</Button>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
