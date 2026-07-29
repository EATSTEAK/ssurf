import { View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { StudentInformationEntity } from '@/entities/studentInformation/model';
import { ProfileIcon } from '@/shared/ui/icons';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

const styles = StyleSheet.create((theme) => ({
  profileView: {
    display: 'flex',
    gap: theme.gap(1),
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileIcon: {
    width: 64,
    height: 64,
    borderRadius: theme.cornerRadius.full,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

export const UserProfile = ({ info }: { info: StudentInformationEntity }) => {
  const { theme } = useUnistyles();

  return (
    <View style={styles.profileView}>
      <View style={styles.profileIcon}>
        <ProfileIcon color={theme.colorsHex.fgSurface} size={32} />
      </View>
      <View>
        <ThemedText typography="headingXl">{info.name}</ThemedText>
        <ThemedText typography="bodyMd">
          {info.studentNumber} / {info.department}
        </ThemedText>
      </View>
    </View>
  );
};
