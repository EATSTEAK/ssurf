import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { ThemedText } from '@/components/primitives/ThemedText';
import { SsurfLined } from '@/icons/SsurfLined';

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
