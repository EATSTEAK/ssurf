import { TextInput, TextInputProps } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

type Props = TextInputProps;

export const TextField = ({ style, placeholderTextColor, ...props }: Props) => {
  const { theme } = useUnistyles();

  return (
    <TextInput
      {...props}
      placeholderTextColor={placeholderTextColor ?? theme.colors.fgSurfaceMuted}
      style={[styles.container, style]}
    />
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    width: '100%',
    height: 48,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.primaryContainer,
    color: theme.colors.fgPrimaryContainer,
    fontWeight: '500',
  },
}));
