import type { YearSemester } from '@rusaint/react-native';

import { useState } from 'react';
import { FlatList, Modal, Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { semesterToString } from '@/shared/lib/semester';
import { ChevronDownIcon } from '@/shared/ui/icons';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

const ITEM_HEIGHT = 52;

const styles = StyleSheet.create((theme) => ({
  closeButton: {
    justifyContent: 'center',
    minHeight: 44,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.gap(3),
  },
  modal: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.cornerRadius.lg,
    maxHeight: '72%',
    overflow: 'hidden',
    paddingVertical: theme.gap(1),
    width: '86%',
  },
  option: {
    alignItems: 'center',
    flexDirection: 'row',
    height: ITEM_HEIGHT,
    justifyContent: 'space-between',
    paddingHorizontal: theme.gap(3),
  },
  optionPressed: {
    backgroundColor: theme.colors.surfaceDimmer,
  },
  optionSelected: {
    backgroundColor: theme.colors.primaryContainer,
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    flex: 1,
    justifyContent: 'center',
  },
  trigger: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.gap(0.5),
    minHeight: 44,
    paddingHorizontal: theme.gap(1),
  },
  triggerPressed: {
    opacity: 0.55,
  },
}));

export interface SemesterSelectorProps {
  onChange: (index: number, semester: YearSemester) => void;
  selectedIndex?: number;
  semesters: YearSemester[];
}

export const SemesterSelector = ({
  selectedIndex = 0,
  semesters,
  onChange,
}: SemesterSelectorProps) => {
  const { theme } = useUnistyles();
  const [visible, setVisible] = useState(false);
  const normalizedSelectedIndex =
    selectedIndex >= 0 && selectedIndex < semesters.length ? selectedIndex : 0;
  const selectedSemester = semesters[normalizedSelectedIndex];

  if (!selectedSemester) {
    return null;
  }

  return (
    <>
      <Pressable
        accessibilityHint="학기 선택 창을 열어요"
        accessibilityLabel={`학기 선택, ${semesterToString(selectedSemester)}`}
        accessibilityRole="button"
        onPress={() => setVisible(true)}
        style={({ pressed }) => [styles.trigger, pressed && styles.triggerPressed]}
      >
        <ThemedText typography="labelMd">{semesterToString(selectedSemester)}</ThemedText>
        <ChevronDownIcon color={theme.colorsHex.fgPrimary} size={16} />
      </Pressable>
      <Modal
        animationType="fade"
        onRequestClose={() => setVisible(false)}
        statusBarTranslucent
        transparent
        visible={visible}
      >
        <Pressable onPress={() => setVisible(false)} style={styles.overlay}>
          <Pressable onPress={(event) => event.stopPropagation()} style={styles.modal}>
            <View style={styles.header}>
              <ThemedText typography="headingLg">학기 선택</ThemedText>
              <Pressable
                accessibilityRole="button"
                onPress={() => setVisible(false)}
                style={styles.closeButton}
              >
                <ThemedText color="primary" typography="labelMd">
                  닫기
                </ThemedText>
              </Pressable>
            </View>
            <FlatList
              data={semesters}
              getItemLayout={(_, index) => ({
                index,
                length: ITEM_HEIGHT,
                offset: ITEM_HEIGHT * index,
              })}
              initialScrollIndex={normalizedSelectedIndex}
              key={`${selectedSemester.year}-${selectedSemester.semester}`}
              keyExtractor={({ semester, year }) => `${year}-${semester}`}
              renderItem={({ index, item }) => {
                const isSelected = index === normalizedSelectedIndex;
                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => {
                      onChange(index, item);
                      setVisible(false);
                    }}
                    style={({ pressed }) => [
                      styles.option,
                      isSelected && styles.optionSelected,
                      pressed && styles.optionPressed,
                    ]}
                  >
                    <ThemedText typography={isSelected ? 'headingMd' : 'bodyLg'}>
                      {semesterToString(item)}
                    </ThemedText>
                    {isSelected ? (
                      <ThemedText color="primary" typography="labelMd">
                        선택됨
                      </ThemedText>
                    ) : null}
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};
