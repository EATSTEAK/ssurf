/**
 * 플랫폼별 네이티브 Switch 컴포넌트
 * iOS: @expo/ui/swift-ui의 Switch 사용
 * Android: @expo/ui/jetpack-compose의 Switch 사용
 */
import { Switch as JetpackComposeSwitch } from '@expo/ui/jetpack-compose';
import { Switch as SwiftUISwitch } from '@expo/ui/swift-ui';
import { disabled as disabledModifier } from '@expo/ui/swift-ui/modifiers';
import { Platform, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

const styles = StyleSheet.create(() => ({
  wrapper: {
    opacity: 1,
  },
  disabledWrapper: {
    opacity: 0.5,
  },
}));

export interface SwitchProps {
  /** 스위치 비활성화 여부 */
  disabled?: boolean;
  /** 스위치 라벨 (선택적) */
  label?: string;
  /** 값 변경 핸들러 */
  onValueChange: (value: boolean) => void;
  /** 스위치 값 */
  value: boolean;
}

/**
 * 네이티브 스위치 래퍼 컴포넌트
 * @expo/ui의 플랫폼별 Switch를 사용하여 네이티브 스위치 제공
 */
export function Switch({ disabled = false, label, onValueChange, value }: SwitchProps) {
  if (Platform.OS === 'ios') {
    return (
      <SwiftUISwitch
        label={label}
        modifiers={disabled ? [disabledModifier(true)] : undefined}
        onValueChange={disabled ? undefined : onValueChange}
        value={value}
      />
    );
  }

  // Android - disabled 상태일 때 onValueChange를 undefined로 설정하여 비활성화 효과
  return (
    <View style={disabled ? styles.disabledWrapper : styles.wrapper}>
      <JetpackComposeSwitch onValueChange={disabled ? undefined : onValueChange} value={value} />
    </View>
  );
}
