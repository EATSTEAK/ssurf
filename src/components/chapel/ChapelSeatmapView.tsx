import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { ChapelSeatmap1F } from '@/components/chapel/seatmap/ChapelSeatmap1F';
import { ChapelSeatmap2F3F } from '@/components/chapel/seatmap/ChapelSeatmap2F3F';

interface ChapelSeatmapViewProps {
  floor: 1 | 2 | 3;
  seat: `${string}-${number}-${number}`;
}

const styles = StyleSheet.create((theme) => ({
  container: {
    aspectRatio: 1.5,
    width: '100%',
    overflow: 'hidden',
    borderRadius: theme.cornerRadius.md,
    backgroundColor: theme.colors.surfaceDim,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  firstFloor: {
    aspectRatio: 915 / 594,
    width: '100%',
  },
  secondThirdFloor: {
    aspectRatio: 915 / 590,
    width: '100%',
  },
}));

export const ChapelSeatmapView = ({ floor }: ChapelSeatmapViewProps) => {
  return (
    <View style={styles.container}>
      {floor === 1 ? (
        <View style={styles.firstFloor}>
          <ChapelSeatmap1F height="100%" width="100%" />
        </View>
      ) : (
        <View style={styles.secondThirdFloor}>
          <ChapelSeatmap2F3F height="100%" width="100%" />
        </View>
      )}
    </View>
  );
};
