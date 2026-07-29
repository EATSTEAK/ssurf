import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { getChapelSeatId } from '@/entities/chapel/lib/seat';
import { ChapelSeatmap1F } from '@/features/chapel/ui/seatmap/ChapelSeatmap1F';
import { ChapelSeatmap2F3F } from '@/features/chapel/ui/seatmap/ChapelSeatmap2F3F';

interface ChapelSeatmapViewProps {
  floor: 1 | 2 | 3;
  seat: null | string;
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
    padding: theme.gap(1),
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

export const ChapelSeatmapView = ({ floor, seat }: ChapelSeatmapViewProps) => {
  const selectedSeat = getChapelSeatId(floor, seat);

  return (
    <View
      accessibilityLabel={`${floor}층 ${selectedSeat ?? seat ?? ''} 좌석 배치도`}
      accessibilityRole="image"
      style={styles.container}
    >
      {floor === 1 ? (
        <View style={styles.firstFloor}>
          <ChapelSeatmap1F height="100%" seat={selectedSeat} width="100%" />
        </View>
      ) : (
        <View style={styles.secondThirdFloor}>
          <ChapelSeatmap2F3F height="100%" seat={selectedSeat} width="100%" />
        </View>
      )}
    </View>
  );
};
