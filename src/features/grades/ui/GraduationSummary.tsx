import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import {
  GraduationRequirementsGeneralEntity,
  GraduationStudentEntity,
} from '@/entities/graduationRequirements/model';
import { ArrowForwardIcon } from '@/shared/ui/icons';
import { Button } from '@/shared/ui/primitives/Button';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.gap(1),
  },
  icon: {
    color: theme.colorsHex.fgSurface,
  },
  buttonStyle: ({ pressed }) => ({
    backgroundColor: pressed ? theme.colors.surfaceDimmer : theme.colors.surfaceDim,
    alignItems: 'flex-start',
    paddingHorizontal: theme.gap(2),
  }),
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: theme.gap(0.5),
  },
}));

export interface GraduationSummaryProps {
  general: GraduationRequirementsGeneralEntity | null;
  showDetailsButton?: boolean;
  student: GraduationStudentEntity | null;
}

export const GraduationSummary = ({
  student,
  general,
  showDetailsButton = true,
}: GraduationSummaryProps) => {
  const { navigate } = useRouter();
  return (
    <View style={styles.container}>
      <View>
        <ThemedText typography="headingMd">졸업까지</ThemedText>
        <ThemedText
          color={general?.isGraduatable ? 'successInverted' : 'primaryInverted'}
          typography="heading3xl"
        >
          {student?.completedPoints.toFixed(1) ?? '-'}
          <ThemedText color="fgSurfaceMuted" typography="labelLg">
            {' '}
            / {student?.graduationPoints.toFixed(1) ?? '-'} 학점
          </ThemedText>
        </ThemedText>
      </View>
      {showDetailsButton && (
        <Button
          onPress={() => navigate('/(tabs)/grades/graduation')}
          style={styles.buttonStyle}
          variant="ghost"
        >
          <View style={styles.buttonContent}>
            <ArrowForwardIcon color={styles.icon.color} size={16} />
            <ThemedText>상세 보기</ThemedText>
          </View>
        </Button>
      )}
    </View>
  );
};
