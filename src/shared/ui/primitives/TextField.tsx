import { TextInput, TextInputProps } from 'react-native';
import { StyleSheet, withUnistyles } from 'react-native-unistyles';

type Props = TextInputProps;

const UnistylesTextInput = withUnistyles(TextInput);

export const TextField = ({ style, placeholderTextColor, ...props }: Props) => (
  <UnistylesTextInput
    {...props}
    style={[styles.container, style]}
    uniProps={(theme) => ({
      placeholderTextColor: placeholderTextColor ?? theme.colors.fgSurfaceMuted,
    })}
  />
);

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
