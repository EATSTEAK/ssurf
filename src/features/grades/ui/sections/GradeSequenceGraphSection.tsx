import { Circle, LinearGradient, Rect, vec } from '@shopify/react-native-skia';
import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { Easing, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Area, CartesianChart, Line } from 'victory-native';

import { SemesterGradeEntity } from '@/entities/grades/model';
import { useBlurGrade } from '@/features/grades/providers/BlurGradeProvider';

interface GradeSequenceGraphSectionProps {
  selectedSemester?: number;
  selectedYear?: number;
  semesters: SemesterGradeEntity[];
}

interface SelectedSemesterHighlightProps {
  pointX?: number;
  pointY?: number;
  visible: boolean;
}

const styles = StyleSheet.create((theme) => ({
  container: (isBlurred: boolean) => ({
    bottom: 0,
    elevation: 1,
    left: 0,
    opacity: isBlurred ? 0.02 : 0.2,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1,
  }),
  chartContainer: {
    height: '100%',
    paddingVertical: theme.gap(2),
    width: '100%',
  },
}));

function SelectedSemesterHighlight({ pointX, pointY, visible }: SelectedSemesterHighlightProps) {
  const outerRadius = useSharedValue(0);
  const innerRadius = useSharedValue(0);
  const outerOpacity = useSharedValue(0);
  const innerOpacity = useSharedValue(0);
  const animatedCx = useSharedValue(0);
  const animatedCy = useSharedValue(0);
  const prevCoordsRef = useRef<null | { x: number; y: number }>(null);

  useEffect(() => {
    if (!visible || pointX === undefined || pointY === undefined) {
      outerRadius.value = withSpring(0, {
        damping: 15,
        stiffness: 200,
      });
      innerRadius.value = withSpring(0, {
        damping: 15,
        stiffness: 200,
      });
      outerOpacity.value = withSpring(0, {
        damping: 15,
        stiffness: 200,
      });
      innerOpacity.value = withSpring(0, {
        damping: 15,
        stiffness: 200,
      });
      prevCoordsRef.current = null;
      return;
    }

    const prevCoords = prevCoordsRef.current;

    if (!prevCoords) {
      animatedCx.value = pointX;
      animatedCy.value = pointY;
    } else if (prevCoords.x !== pointX || prevCoords.y !== pointY) {
      animatedCx.value = withTiming(pointX, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
      animatedCy.value = withTiming(pointY, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
    }

    prevCoordsRef.current = { x: pointX, y: pointY };

    outerRadius.value = withSpring(12, {
      damping: 15,
      stiffness: 200,
    });
    innerRadius.value = withSpring(6, {
      damping: 15,
      stiffness: 200,
    });
    outerOpacity.value = withSpring(0.3, {
      damping: 15,
      stiffness: 200,
    });
    innerOpacity.value = withSpring(1, {
      damping: 15,
      stiffness: 200,
    });
  }, [
    animatedCx,
    animatedCy,
    innerOpacity,
    innerRadius,
    outerOpacity,
    outerRadius,
    pointX,
    pointY,
    visible,
  ]);

  return (
    <>
      <Circle
        color="#FFFFFF"
        cx={animatedCx}
        cy={animatedCy}
        opacity={outerOpacity}
        r={outerRadius}
      />
      <Circle
        color="#FFFFFF"
        cx={animatedCx}
        cy={animatedCy}
        opacity={innerOpacity}
        r={innerRadius}
      />
    </>
  );
}

export function GradeSequenceGraphSection({
  selectedSemester,
  selectedYear,
  semesters,
}: GradeSequenceGraphSectionProps) {
  const { theme } = useUnistyles();
  const { isBlurred } = useBlurGrade();

  const validSemesters = semesters
    .filter((s) => s.gradePointsAverage > 0)
    .sort((a, b) => {
      if (a.year !== b.year) {
        return a.year - b.year;
      }
      return a.semester - b.semester;
    });

  const data = validSemesters.map((s, index) => ({
    x: index,
    y: s.gradePointsAverage,
  }));

  const selectedIndex =
    selectedYear !== undefined && selectedSemester !== undefined
      ? validSemesters.findIndex((s) => s.year === selectedYear && s.semester === selectedSemester)
      : -1;

  if (data.length === 0) {
    return null;
  }

  const minValue = Math.min(...data.map((d) => d.y));
  const yMin = Math.max(0, minValue - 0.5);

  return (
    <View pointerEvents="none" style={styles.container(isBlurred)}>
      <View style={styles.chartContainer}>
        <CartesianChart
          axisOptions={{
            lineColor: {
              grid: {
                x: theme.colorsHex.fgSurfaceMuted,
                y: theme.colorsHex.fgSurfaceMuted,
              },
              frame: 'transparent',
            },
            lineWidth: {
              grid: {
                x: 1,
                y: 1,
              },
              frame: 0,
            },
          }}
          data={data}
          domain={{ y: [yMin, 4.5] }}
          domainPadding={{ top: 20, bottom: 20 }}
          xKey="x"
          yKeys={['y']}
        >
          {({ points, chartBounds }) => {
            const selectedPoint = selectedIndex >= 0 ? points.y[selectedIndex] : undefined;
            const highlightPointX =
              typeof selectedPoint?.x === 'number' ? selectedPoint.x : undefined;
            const highlightPointY =
              typeof selectedPoint?.y === 'number' ? selectedPoint.y : undefined;
            const isHighlightVisible =
              selectedIndex >= 0 && highlightPointX !== undefined && highlightPointY !== undefined;

            return (
              <>
                <Area curveType="natural" points={points.y} y0={chartBounds.bottom}>
                  <LinearGradient
                    colors={[`${theme.colorsHex.surface}AF`, `${theme.colorsHex.primary}FF`]}
                    end={vec(0, chartBounds.top)}
                    start={vec(0, chartBounds.bottom)}
                  />
                </Area>
                <Line
                  color={theme.colorsHex.primary}
                  curveType="natural"
                  points={points.y}
                  strokeWidth={4}
                />
                <SelectedSemesterHighlight
                  pointX={highlightPointX}
                  pointY={highlightPointY}
                  visible={isHighlightVisible}
                />
                <Rect
                  height={40}
                  width={chartBounds.right - chartBounds.left}
                  x={chartBounds.left}
                  y={chartBounds.top}
                >
                  <LinearGradient
                    colors={[theme.colorsHex.surface, `${theme.colorsHex.surface}00`]}
                    end={vec(0, chartBounds.top + 40)}
                    start={vec(0, chartBounds.top)}
                  />
                </Rect>
                <Rect
                  height={40}
                  width={chartBounds.right - chartBounds.left}
                  x={chartBounds.left}
                  y={chartBounds.bottom - 40}
                >
                  <LinearGradient
                    colors={[`${theme.colorsHex.surface}00`, theme.colorsHex.surface]}
                    end={vec(0, chartBounds.bottom)}
                    start={vec(0, chartBounds.bottom - 40)}
                  />
                </Rect>
              </>
            );
          }}
        </CartesianChart>
      </View>
    </View>
  );
}
