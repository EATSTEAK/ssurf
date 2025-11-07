import { TextInput, TextInputProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

type Props = TextInputProps;

export const TextField = ({ style, placeholderTextColor, ...props }: Props) => {
  return (
    <TextInput
      {...props}
      placeholderTextColor={placeholderTextColor ?? styles.placeholder.color}
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
    backgroundColor: theme.colors.cardPrimary,
    color: theme.colors.fgCardPrimary,
    fontWeight: '500',
  },
  placeholder: {
    color: theme.colors.fgCardSecondary,
  },
}));
