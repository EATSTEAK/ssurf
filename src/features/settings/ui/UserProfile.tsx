import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { SymbolView } from 'expo-symbols';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { StudentInformationModel } from '@/entities/studentInformation/model/studentInformation';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';
import { paletteHex } from '@/unistyles';

const styles = StyleSheet.create((theme, rt) => ({
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
  // NOTE: `SymbolView`의 `tintColor`가 hsl을 지원하지 않음
  profileSymbol: {
    color: rt.colorScheme === 'dark' ? paletteHex.sand50 : paletteHex.sand950, // fgSurface
  },
}));

export const UserProfile = ({ info }: { info: StudentInformationModel }) => {
  return (
    <View style={styles.profileView}>
      <View style={styles.profileIcon}>
        <SymbolView
          fallback={
            <MaterialCommunityIcons color={styles.profileSymbol.color} name="account" size={32} />
          }
          name="person"
          size={32}
          tintColor={styles.profileSymbol.color}
        />
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
