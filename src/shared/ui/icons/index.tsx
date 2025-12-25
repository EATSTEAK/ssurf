import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { SymbolView, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';

type MaterialIconProps = ComponentProps<typeof MaterialCommunityIcons>;

export interface IconProps {
  /**
   * 아이콘 색상
   */
  color: string;
  /**
   * Material Community Icons 이름 (Android/Fallback)
   */
  materialName: MaterialIconProps['name'];
  /**
   * MaterialCommunityIcons 추가 props (name, color 제외)
   */
  materialProps?: Omit<MaterialIconProps, 'color' | 'name'>;
  /**
   * 아이콘 크기
   */
  size?: number;
  /**
   * SF Symbol 이름 (iOS)
   */
  symbolName: SymbolViewProps['name'];
  /**
   * SymbolView 추가 props (name, fallback, tintColor 제외)
   */
  symbolProps?: Omit<SymbolViewProps, 'fallback' | 'name' | 'tintColor'>;
}

/**
 * iOS에서는 SF Symbols, Android/Fallback에서는 Material Community Icons를 사용하는 크로스 플랫폼 아이콘 컴포넌트
 */
export function Icon({
  color,
  materialName,
  materialProps,
  size = 24,
  symbolName,
  symbolProps,
}: IconProps) {
  return (
    <SymbolView
      fallback={
        <MaterialCommunityIcons color={color} name={materialName} size={size} {...materialProps} />
      }
      name={symbolName}
      size={size}
      tintColor={color}
      {...symbolProps}
    />
  );
}

const createIcon = (
  displayName: string,
  materialName: IconProps['materialName'],
  symbolName: IconProps['symbolName'],
) => {
  const Component = (props: Omit<IconProps, 'materialName' | 'symbolName'>) => (
    <Icon materialName={materialName} symbolName={symbolName} {...props} />
  );
  Component.displayName = displayName;
  return Component;
};

export const LogoutIcon = createIcon('LogoutIcon', 'logout', 'rectangle.portrait.and.arrow.right');
export const ProfileIcon = createIcon('ProfileIcon', 'account', 'person');
