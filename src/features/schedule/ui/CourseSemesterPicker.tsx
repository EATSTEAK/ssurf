import { SemesterType, type YearSemester } from '@rusaint/react-native';
import { FlatList, Modal, Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import {
  constructSemesters,
  semesterToString,
  USAINT_COURSE_FIRST_YEAR,
} from '@/shared/lib/semester';
import { ChevronDownIcon } from '@/shared/ui/icons';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

const ITEM_HEIGHT = 52;
// ponytail: rusaint RN does not expose the U-Saint year dropdown; U-Saint currently offers 1954 through four years ahead.
const COURSE_SEARCH_SEMESTERS = constructSemesters(
  USAINT_COURSE_FIRST_YEAR,
  new Date().getFullYear() + 4,
  [SemesterType.Winter, SemesterType.Two, SemesterType.Summer, SemesterType.One],
);

const styles = StyleSheet.create((theme) => ({
  closeButton: {
    minHeight: 44,
    justifyContent: 'center',
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

type CourseSemesterPickerProps = {
  onChange: (semester: YearSemester) => void;
  onClose: () => void;
  onOpen: () => void;
  selectedSemester: YearSemester;
  visible: boolean;
};

export const CourseSemesterPicker = ({
  onChange,
  selectedSemester,
  visible,
  onClose,
  onOpen,
}: CourseSemesterPickerProps) => {
  const { theme } = useUnistyles();
  const selectedIndex = COURSE_SEARCH_SEMESTERS.findIndex(
    ({ year, semester }) =>
      year === selectedSemester.year && semester === selectedSemester.semester,
  );

  return (
    <>
      <Pressable
        accessibilityHint="학기 선택 창을 열어요"
        accessibilityLabel={`검색 학기 선택, ${semesterToString(selectedSemester)}`}
        accessibilityRole="button"
        onPress={onOpen}
        style={({ pressed }) => [styles.trigger, pressed && styles.triggerPressed]}
      >
        <ThemedText typography="labelMd">{semesterToString(selectedSemester)}</ThemedText>
        <ChevronDownIcon color={theme.colorsHex.fgPrimary} size={16} />
      </Pressable>
      <Modal
        animationType="fade"
        onRequestClose={onClose}
        statusBarTranslucent
        transparent
        visible={visible}
      >
        <Pressable onPress={onClose} style={styles.overlay}>
          <Pressable onPress={(event) => event.stopPropagation()} style={styles.modal}>
            <View style={styles.header}>
              <ThemedText typography="headingLg">학기 선택</ThemedText>
              <Pressable accessibilityRole="button" onPress={onClose} style={styles.closeButton}>
                <ThemedText color="primary" typography="labelMd">
                  닫기
                </ThemedText>
              </Pressable>
            </View>
            <FlatList
              data={COURSE_SEARCH_SEMESTERS}
              getItemLayout={(_, index) => ({
                index,
                length: ITEM_HEIGHT,
                offset: ITEM_HEIGHT * index,
              })}
              initialScrollIndex={selectedIndex >= 0 ? selectedIndex : 0}
              key={`${selectedSemester.year}-${selectedSemester.semester}`}
              keyExtractor={({ semester, year }) => `${year}-${semester}`}
              renderItem={({ item }) => {
                const isSelected =
                  item.year === selectedSemester.year &&
                  item.semester === selectedSemester.semester;
                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => {
                      onChange(item);
                      onClose();
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
