import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { StyleSheet, withUnistyles } from 'react-native-unistyles';

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

const ThemedArrowForwardIcon = withUnistyles(ArrowForwardIcon, (theme) => ({
  color: theme.colorsHex.fgSurface,
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
          color={general?.isGraduatable ? 'successInverted' : 'errorInverted'}
          typography="heading3xl"
        >
          {student?.completedPoints.toFixed(1) ?? '-'}
          <ThemedText color="fgSurfaceMuted" typography="labelLg">
            {' '}
            / {student?.graduationPoints.toFixed(1) ?? '-'} 학점
          </ThemedText>
        </ThemedText>
        {general?.isGraduatable ? (
          <ThemedText color="successInverted" typography="bodyMd">
            졸업 요건을 모두 충족했어요!
          </ThemedText>
        ) : (
          <ThemedText color="errorInverted" typography="bodyMd">
            졸업하려면 추가 요건이 필요해요.
          </ThemedText>
        )}
      </View>
      {showDetailsButton && (
        <Button
          onPress={() => navigate('/(tabs)/grades/graduation')}
          style={styles.buttonStyle}
          variant="ghost"
        >
          <View style={styles.buttonContent}>
            <ThemedArrowForwardIcon size={16} />
            <ThemedText>상세 보기</ThemedText>
          </View>
        </Button>
      )}
    </View>
  );
};
