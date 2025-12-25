import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { SsurfLined } from '@/icons/SsurfLined';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

const styles = StyleSheet.create((theme) => ({
  headerView: {
    display: 'flex',
    gap: theme.gap(1),
    flexDirection: 'row',
    alignItems: 'center',
  },
}));

export const Header = ({ title }: { title: string }) => {
  return (
    <View style={styles.headerView}>
      <SsurfLined height={32} width={32} />
      <ThemedText typography="heading3xl">{title}</ThemedText>
    </View>
  );
};
