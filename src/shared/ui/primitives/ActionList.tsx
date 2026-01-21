import {
  Pressable,
  PressableProps,
  PressableStateCallbackType,
  View,
  ViewProps,
} from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { propagateState } from '@/shared/lib/propagateState';
import { Switch } from '@/shared/ui/primitives/Switch';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';
import { palette } from '@/unistyles';

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
  switchItem: {
    display: 'flex',
    flexDirection: 'row',
    paddingHorizontal: theme.gap(1.5),
    gap: theme.gap(1.5),
    alignItems: 'center',
    height: 56,
    backgroundColor: theme.colors.surfaceDimmer,
  },
  switchItemDisabled: {
    opacity: 0.5,
  },
  switchItemContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.gap(0.25),
  },
  switchItemDescription: {
    color: rt.colorScheme === 'dark' ? palette.sand400 : palette.sand600,
  },
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

export interface ActionItemWithSwitchProps {
  /** 설명 텍스트 (선택적) */
  description?: string;
  /** 스위치 비활성화 여부 */
  disabled?: boolean;
  /** 아이콘 */
  icon: React.ReactNode;
  /** 값 변경 핸들러 */
  onValueChange: (value: boolean) => void;
  /** 제목 */
  title: string;
  /** 스위치 값 */
  value: boolean;
}

/**
 * Switch가 포함된 ActionItem 컴포넌트
 * 설정 화면에서 토글 기능이 필요한 항목에 사용
 */
export const ActionItemWithSwitch = ({
  description,
  disabled = false,
  icon,
  onValueChange,
  title,
  value,
}: ActionItemWithSwitchProps) => {
  return (
    <View style={[styles.switchItem, disabled && styles.switchItemDisabled]}>
      {icon}
      <View style={styles.switchItemContent}>
        <ThemedText typography="bodyLg">{title}</ThemedText>
        {description && (
          <ThemedText style={styles.switchItemDescription} typography="bodySm">
            {description}
          </ThemedText>
        )}
      </View>
      <Switch disabled={disabled} onValueChange={onValueChange} value={value} />
    </View>
  );
};
