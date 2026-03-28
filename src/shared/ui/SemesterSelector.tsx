import { DropdownMenu, Button as JetpackButton } from '@expo/ui/jetpack-compose';
import {
  Host,
  Button as SwiftButton,
  ContextMenu as SwiftContextMenu,
  Picker as SwiftPicker,
  Text as SwiftText,
} from '@expo/ui/swift-ui';
import { tag, tint } from '@expo/ui/swift-ui/modifiers';
import { YearSemester } from '@rusaint/react-native';
import { Platform } from 'react-native';
import { StyleSheet, withUnistyles } from 'react-native-unistyles';

import { semesterToString } from '@/shared/lib/semester';
import { paletteHex } from '@/shared/lib/theme';

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
              <SwiftButton label="학기" modifiers={[tint(styles.triggerColor.color)]} />
            </SwiftContextMenu.Trigger>
            <SwiftContextMenu.Items>
              <SwiftPicker
                selection={selectedIndex ?? null}
                onSelectionChange={(index) => {
                  if (typeof index === 'number') {
                    handleSelect(index);
                  }
                }}
              >
                {semesters.map((semester, index) => (
                  <SwiftText key={`${semester.year}-${semester.semester}`} modifiers={[tag(index)]}>
                    {semesterToString(semester)}
                  </SwiftText>
                ))}
              </SwiftPicker>
            </SwiftContextMenu.Items>
          </SwiftContextMenu>
        </Host>
      ),
      android: (
        <DropdownMenu>
          <DropdownMenu.Trigger>
            <JetpackButton colors={{ contentColor: styles.triggerColor.color }}>학기</JetpackButton>
          </DropdownMenu.Trigger>
          <DropdownMenu.Items>
            {semesters.map((semester, index) => (
              <JetpackButton
                colors={{
                  containerColor: styles.jetpackItemColor.backgroundColor,
                  contentColor: styles.jetpackItemColor.color,
                }}
                key={`${semester.year}-${semester.semester}`}
                onClick={() => handleSelect(index)}
              >
                {semesterToString(semester)}
              </JetpackButton>
            ))}
          </DropdownMenu.Items>
        </DropdownMenu>
      ),
    });
  },
);
