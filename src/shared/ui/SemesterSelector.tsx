import {
  Button as JetpackButton,
  ContextMenu as JetpackContextMenu,
} from '@expo/ui/jetpack-compose';
import {
  Host,
  Button as SwiftButton,
  ContextMenu as SwiftContextMenu,
  Picker as SwiftPicker,
} from '@expo/ui/swift-ui';
import { YearSemester } from '@rusaint/react-native';
import { Platform } from 'react-native';
import { StyleSheet, withUnistyles } from 'react-native-unistyles';

import { semesterToString } from '@/shared/lib/semester';
import { paletteHex } from '@/unistyles';

export interface SemesterSelectorProps {
  onChange: (index: number, semester: YearSemester) => void;
  selectedIndex?: number;
  semesters: YearSemester[];
}

const styles = StyleSheet.create((theme, rt) => ({
  triggerColor: {
    color: rt.colorScheme === 'dark' ? paletteHex.wave400 : paletteHex.wave600,
  },
  jetpackItemColor: {
    color: rt.colorScheme === 'dark' ? paletteHex.sand50 : paletteHex.sand950,
    backgroundColor: rt.colorScheme === 'dark' ? paletteHex.sand900 : paletteHex.sand100,
  },
}));

export const SemesterSelector = withUnistyles(
  ({ selectedIndex, semesters, onChange }: SemesterSelectorProps) => {
    const handleSelect = (index: number) => {
      const semester = semesters[index];
      if (semester != null) {
        onChange(index, semester);
      }
    };
    return Platform.select({
      ios: (
        <Host
          style={{
            width: 50,
            height: 30,
          }}
        >
          <SwiftContextMenu>
            <SwiftContextMenu.Trigger>
              <SwiftButton color={styles.triggerColor.color}>학기</SwiftButton>
            </SwiftContextMenu.Trigger>
            <SwiftContextMenu.Items>
              <SwiftPicker
                onOptionSelected={({ nativeEvent: { index } }) => handleSelect(index)}
                options={semesters.map(semesterToString)}
                selectedIndex={selectedIndex ?? null}
                variant="inline"
              />
            </SwiftContextMenu.Items>
          </SwiftContextMenu>
        </Host>
      ),
      android: (
        <JetpackContextMenu>
          <JetpackContextMenu.Trigger>
            <JetpackButton color={styles.triggerColor.color}>학기</JetpackButton>
          </JetpackContextMenu.Trigger>
          <JetpackContextMenu.Items>
            {semesters.map((semester, index) => (
              <JetpackButton
                color={styles.jetpackItemColor.backgroundColor}
                elementColors={{ contentColor: styles.jetpackItemColor.color }}
                key={`${semester.year}-${semester.semester}`}
                onPress={() => handleSelect(index)}
              >
                {semesterToString(semester)}
              </JetpackButton>
            ))}
          </JetpackContextMenu.Items>
        </JetpackContextMenu>
      ),
    });
  },
);
