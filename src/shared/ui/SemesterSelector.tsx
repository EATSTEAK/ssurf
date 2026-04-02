import {
  DropdownMenu,
  DropdownMenuItem,
  Button as JetpackButton,
  Host as JetpackHost,
} from '@expo/ui/jetpack-compose';
import { fillMaxWidth, wrapContentWidth } from '@expo/ui/jetpack-compose/modifiers';
import {
  Button as SwiftButton,
  ContextMenu as SwiftContextMenu,
  Host as SwiftHost,
  Picker as SwiftPicker,
  Text as SwiftText,
} from '@expo/ui/swift-ui';
import { tag, tint } from '@expo/ui/swift-ui/modifiers';
import { YearSemester } from '@rusaint/react-native';
import { useState } from 'react';
import { Platform } from 'react-native';
import { StyleSheet, withUnistyles } from 'react-native-unistyles';

import { semesterToString } from '@/shared/lib/semester';
import { paletteHex } from '@/shared/lib/theme';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

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
    const [isExpanded, setIsExpanded] = useState(false);

    const handleSelect = (index: number) => {
      setIsExpanded(false);
      const semester = semesters[index];
      if (semester != null) {
        onChange(index, semester);
      }
    };
    return Platform.select({
      ios: (
        <SwiftHost
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
                onSelectionChange={(index) => {
                  if (typeof index === 'number') {
                    handleSelect(index);
                  }
                }}
                selection={selectedIndex ?? null}
              >
                {semesters.map((semester, index) => (
                  <SwiftText key={`${semester.year}-${semester.semester}`} modifiers={[tag(index)]}>
                    {semesterToString(semester)}
                  </SwiftText>
                ))}
              </SwiftPicker>
            </SwiftContextMenu.Items>
          </SwiftContextMenu>
        </SwiftHost>
      ),
      android: (
        <JetpackHost matchContents>
          <DropdownMenu expanded={isExpanded} onDismissRequest={() => setIsExpanded(false)}>
            <DropdownMenu.Trigger>
              <JetpackButton
                colors={{
                  contentColor: styles.triggerColor.color,
                  containerColor: styles.jetpackItemColor.backgroundColor,
                }}
                modifiers={[fillMaxWidth(0.2), wrapContentWidth('centerHorizontally')]}
                onClick={() => setIsExpanded(true)}
              >
                <ThemedText color="primaryInverted">학기</ThemedText>
              </JetpackButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Items>
              {semesters.map((semester, index) => (
                <DropdownMenuItem
                  elementColors={{
                    textColor: styles.jetpackItemColor.color,
                    disabledTextColor: styles.jetpackItemColor.color,
                  }}
                  key={`${semester.year}-${semester.semester}`}
                  onClick={() => handleSelect(index)}
                >
                  <DropdownMenuItem.Text>
                    <ThemedText>{semesterToString(semester)}</ThemedText>
                  </DropdownMenuItem.Text>
                </DropdownMenuItem>
              ))}
            </DropdownMenu.Items>
          </DropdownMenu>
        </JetpackHost>
      ),
    });
  },
);
