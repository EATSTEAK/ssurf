import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

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

export const GraduationSummary = () => {
  const { navigate } = useRouter();
  return (
    <View style={styles.container}>
      <View>
        <ThemedText typography="headingMd">졸업까지</ThemedText>
        <ThemedText color="primaryInverted" typography="heading3xl">
          {(100).toFixed(1)}
          <ThemedText color="fgSurfaceMuted" typography="labelLg">
            {' '}
            / 133.0
          </ThemedText>
        </ThemedText>
      </View>
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
    </View>
  );
};
