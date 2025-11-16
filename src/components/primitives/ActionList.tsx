import {
  Pressable,
  PressableProps,
  PressableStateCallbackType,
  View,
  ViewProps,
} from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { palette } from '@/unistyles';
import { propagateState } from '@/utils/propagateState';

const styles = StyleSheet.create((theme, rt) => ({
  list: {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: theme.cornerRadius.md,
    overflow: 'hidden',
  },
  item: ({ pressed }: PressableStateCallbackType) => ({
    display: 'flex',
    flexDirection: 'row',
    paddingHorizontal: theme.gap(1.5),
    gap: theme.gap(1.5),
    alignItems: 'center',
    height: 56,
    backgroundColor: pressed
      ? rt.colorScheme === 'dark'
        ? palette.sand700
        : palette.sand300
      : theme.colors.surfaceDimmer,
  }),
}));

export const ActionList = ({ style, ...props }: ViewProps) => {
  return <View style={[styles.list, style]} {...props} />;
};

export const ActionListItem = ({
  icon,
  style,
  children,
  ...props
}: PressableProps & { icon: React.ReactNode }) => {
  return (
    <Pressable style={(state) => [styles.item(state), propagateState(state, style)]} {...props}>
      {(state) => (
        <>
          {icon}
          {propagateState(state, children)}
        </>
      )}
    </Pressable>
  );
};
