import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Button } from '@/shared/ui/primitives/Button';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.gap(1),
  },
}));

export const GraduationSummary = () => {
  return (
    <View style={styles.container}>
      <View>
        <ThemedText typography="headingMd">졸업까지</ThemedText>
        <ThemedText color="primaryInverted" typography="heading3xl">
          {(100).toFixed(1)}
          <ThemedText color="fgSurfaceMuted" typography="labelLg">
            / 133.00
          </ThemedText>
        </ThemedText>
      </View>
      <Button>졸업사정표 보기</Button>
    </View>
  );
};
