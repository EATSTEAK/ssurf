import { ReactNode } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { SsurfLined } from '@/shared/ui/icons/SsurfLined';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

const styles = StyleSheet.create((theme) => ({
  headerView: {
    display: 'flex',
    gap: theme.gap(1),
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftSection: {
    display: 'flex',
    gap: theme.gap(1),
    flexDirection: 'row',
    alignItems: 'center',
  },
}));

interface HeaderProps {
  action?: ReactNode;
  title: string;
}

export const Header = ({ action, title }: HeaderProps) => {
  return (
    <View style={styles.headerView}>
      <View style={styles.leftSection}>
        <SsurfLined height={32} width={32} />
        <ThemedText typography="heading3xl">{title}</ThemedText>
      </View>
      {action}
    </View>
  );
};
