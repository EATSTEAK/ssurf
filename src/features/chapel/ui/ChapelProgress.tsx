import { ComponentProps } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { ChunkedProgress } from '@/shared/ui/primitives/ChunkedProgress';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

export interface ChapelProgressProps extends Omit<
  ComponentProps<typeof ChunkedProgress>,
  'max' | 'value'
> {
  attendanceLeft: number;
  attendedArray: boolean[];
  totalAttendances: number;
}

const style = StyleSheet.create((theme) => ({
  container: {
    height: 32,
    display: 'flex',
    justifyContent: 'center',
  },
  passIndicator: ({ index, total }) => ({
    position: 'absolute',
    left: `${(index / total) * 100}%`,
    top: '50%',
    transform: [{ translateY: '-50%' }, { translateY: -9 }],
    height: 28,
    borderLeftWidth: 2,
    borderLeftColor: theme.colors.success,
    paddingHorizontal: 2,
  }),
  passText: {
    color: theme.colors.success,
  },
  attended: {
    backgroundColor: theme.colors.primary,
  },
  absence: {
    backgroundColor: theme.colors.error,
  },
}));

export const ChapelProgress = ({
  attendanceLeft,
  totalAttendances,
  attendedArray,
  ...props
}: ChapelProgressProps) => {
  const weekPassed = attendedArray.length;
  const passIndicatorIndex =
    attendanceLeft > 0
      ? weekPassed + attendanceLeft
      : (attendedArray
          .map((value, index) => [value, index] satisfies [boolean, number])
          .filter(([attended]) => attended === true)
          .at(-1 + attendanceLeft)?.[1] ?? weekPassed) + 1;

  const selectStyle = (index: number) => {
    return [
      attendedArray[index] === true && style.attended,
      attendedArray[index] === false && style.absence,
    ];
  };
  return (
    <View style={style.container}>
      <ChunkedProgress
        indicatorStyle={selectStyle}
        max={totalAttendances}
        value={attendedArray.length}
        {...props}
      />
      <View
        style={style.passIndicator({
          index: passIndicatorIndex,
          total: totalAttendances,
        })}
      >
        <ThemedText style={style.passText} typography="labelSm">
          PASS
        </ThemedText>
      </View>
    </View>
  );
};
