import { useState } from 'react';
import { type LayoutChangeEvent, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { getChapelSeatId } from '@/entities/chapel/lib/seat';
import { chapelSeatBounds } from '@/features/chapel/ui/seatmap/chapel-seat-bounds';
import { ChapelSeatRipple } from '@/features/chapel/ui/seatmap/chapel-seat-ripple';
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
    position: 'relative',
    width: '100%',
  },
  secondThirdFloor: {
    aspectRatio: 915 / 590,
    position: 'relative',
    width: '100%',
  },
}));

export const ChapelSeatmapView = ({ floor, seat }: ChapelSeatmapViewProps) => {
  const { theme } = useUnistyles();
  const selectedSeat = getChapelSeatId(floor, seat);
  const viewBoxHeight = floor === 1 ? 594 : 590;
  const [mapSize, setMapSize] = useState({ height: 0, width: 0 });

  const handleMapLayout = (event: LayoutChangeEvent) => {
    const { height, width } = event.nativeEvent.layout;
    setMapSize({ height, width });
  };

  const floorKey = floor === 1 ? '1' : '23';
  const seatBounds = selectedSeat ? chapelSeatBounds[`${floorKey}:${selectedSeat}`] : null;
  const scaleX = mapSize.width / 915;
  const scaleY = mapSize.height / viewBoxHeight;
  const ripple =
    seatBounds && scaleX > 0 && scaleY > 0
      ? {
          centerX: (seatBounds[0] + seatBounds[2] / 2) * scaleX,
          centerY: (seatBounds[1] + seatBounds[3] / 2) * scaleY,
          size: Math.max(12, seatBounds[2] * scaleX + 4, seatBounds[3] * scaleY + 4),
        }
      : null;

  return (
    <View
      accessibilityLabel={`${floor}층 ${selectedSeat ?? seat ?? ''} 좌석 배치도`}
      accessibilityRole="image"
      style={styles.container}
    >
      <View
        onLayout={handleMapLayout}
        style={floor === 1 ? styles.firstFloor : styles.secondThirdFloor}
      >
        {floor === 1 ? (
          <ChapelSeatmap1F height="100%" seat={selectedSeat} width="100%" />
        ) : (
          <ChapelSeatmap2F3F height="100%" seat={selectedSeat} width="100%" />
        )}
        {ripple && (
          <ChapelSeatRipple
            centerX={ripple.centerX}
            centerY={ripple.centerY}
            color={theme.colors.primary}
            size={ripple.size}
          />
        )}
      </View>
    </View>
  );
};
