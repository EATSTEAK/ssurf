import { Circle, LinearGradient, Rect, vec } from '@shopify/react-native-skia';
import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { Easing, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Area, CartesianChart, Line } from 'victory-native';

import { SemesterGradeDto } from '@/entities/grades/model/grades';

interface GradeSequenceGraphWidgetProps {
  selectedSemester?: number;
  selectedYear?: number;
  semesters: SemesterGradeDto[];
}

const styles = StyleSheet.create((theme) => ({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.2,
    zIndex: 1,
    elevation: 1,
  },
  chartContainer: {
    height: '100%',
    width: '100%',
    paddingVertical: theme.gap(2),
  },
}));

export function GradeSequenceGraphWidget({
  selectedSemester,
  selectedYear,
  semesters,
}: GradeSequenceGraphWidgetProps) {
  const { theme } = useUnistyles();

  // 애니메이션을 위한 Reanimated shared values
  const outerRadius = useSharedValue(0);
  const innerRadius = useSharedValue(0);
  const outerOpacity = useSharedValue(0);
  const innerOpacity = useSharedValue(0);
  const animatedCx = useSharedValue(0);
  const animatedCy = useSharedValue(0);

  // 이전 좌표를 추적하기 위한 ref
  const prevCoordsRef = useRef<null | { x: number; y: number }>(null);

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

  // 선택된 semester의 인덱스 찾기
  const selectedIndex =
    selectedYear !== undefined && selectedSemester !== undefined
      ? validSemesters.findIndex((s) => s.year === selectedYear && s.semester === selectedSemester)
      : -1;

  // selectedIndex가 변경될 때마다 크기/불투명도 애니메이션 실행
  useEffect(() => {
    if (selectedIndex >= 0) {
      // Spring 애니메이션으로 나타나기
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
    } else {
      // 선택 해제 시 사라지기
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

      // 좌표 초기화
      prevCoordsRef.current = null;
    }
  }, [selectedIndex, outerRadius, innerRadius, outerOpacity, innerOpacity]);

  if (data.length === 0) {
    return null;
  }

  const minValue = Math.min(...data.map((d) => d.y));
  const yMin = Math.max(0, minValue - 0.5);

  return (
    <View pointerEvents="none" style={styles.container}>
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
            // 선택된 포인트의 좌표를 가져와서 애니메이션 업데이트
            if (selectedIndex >= 0 && points.y[selectedIndex]) {
              const currentX = points.y[selectedIndex].x;
              const currentY = points.y[selectedIndex].y;

              if (typeof currentX === 'number' && typeof currentY === 'number') {
                // 이전 좌표와 비교하여 변경되었으면 애니메이션
                const prevCoords = prevCoordsRef.current;

                if (!prevCoords || prevCoords.x !== currentX || prevCoords.y !== currentY) {
                  // 좌표가 변경되었으면 Timing 애니메이션으로 부드럽게 이동 (오버슈트 없음)
                  animatedCx.value = withTiming(currentX, {
                    duration: 300,
                    easing: Easing.out(Easing.cubic),
                  });
                  animatedCy.value = withTiming(currentY, {
                    duration: 300,
                    easing: Easing.out(Easing.cubic),
                  });

                  // 현재 좌표 저장
                  prevCoordsRef.current = { x: currentX, y: currentY };
                }
              }
            }

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
                {/* 선택된 semester 하이라이트 - 위치와 크기 모두 애니메이션 */}
                {selectedIndex >= 0 && (
                  <>
                    {/* 외곽 원 (불투명도 낮음) */}
                    <Circle
                      color="#FFFFFF"
                      cx={animatedCx}
                      cy={animatedCy}
                      opacity={outerOpacity}
                      r={outerRadius}
                    />
                    {/* 내부 원 (선명함) */}
                    <Circle
                      color="#FFFFFF"
                      cx={animatedCx}
                      cy={animatedCy}
                      opacity={innerOpacity}
                      r={innerRadius}
                    />
                  </>
                )}
                {/* 그리드 페이드 효과 - 상단 */}
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
                {/* 그리드 페이드 효과 - 하단 */}
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
