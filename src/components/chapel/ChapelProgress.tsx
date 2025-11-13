import { ComponentProps } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { ChunkedProgress } from '@/components/primitives/ChunkedProgress';
import { ThemedText } from '@/components/primitives/ThemedText';

export interface ChapelProgressProps
  extends Omit<ComponentProps<typeof ChunkedProgress>, 'max' | 'value'> {
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
          index: weekPassed + attendanceLeft - 1,
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
