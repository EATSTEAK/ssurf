import { LinearGradient, Rect, vec } from '@shopify/react-native-skia';
import { View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Area, CartesianChart, Line } from 'victory-native';

import { SemesterGradeDto } from '@/db/schema/grades';

interface GradeSequenceGraphWidgetProps {
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
  },
  chartContainer: {
    height: '100%',
    width: '100%',
    paddingVertical: theme.gap(2),
  },
}));

export function GradeSequenceGraphWidget({ semesters }: GradeSequenceGraphWidgetProps) {
  const { theme } = useUnistyles();

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
          {({ points, chartBounds }) => (
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
          )}
        </CartesianChart>
      </View>
    </View>
  );
}
